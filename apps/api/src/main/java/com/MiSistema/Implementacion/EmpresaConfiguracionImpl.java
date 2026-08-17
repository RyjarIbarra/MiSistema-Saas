package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.EmpresaActividadEconomica;
import com.MiSistema.Modelos.EmpresaConfiguracion;
import com.MiSistema.Modelos.EmpresaObligacion;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.EmpresaConfiguracionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmpresaConfiguracionImpl implements EmpresaConfiguracionService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<EmpresaConfiguracion>> list(DefaultFilter defaultFilter) {
        List<EmpresaConfiguracion> arrayList = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.empresa_configuracion " +
                     "WHERE (razon_social ilike ? or ruc ilike ?) ORDER BY id")
        ) {
            stmt.setString(1, "%" + defaultFilter.getTexto() + "%");
            stmt.setString(2, "%" + defaultFilter.getTexto() + "%");

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    arrayList.add(mapRow(rs));
                }
            }
            // Cargo las actividades y obligaciones (una empresa por tenant)
            for (EmpresaConfiguracion empresa : arrayList) {
                empresa.setActividades(loadActividades(conn));
                empresa.setObligaciones(loadObligaciones(conn));
            }
            return ResponseBuilder.ok(arrayList, arrayList.size());
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<EmpresaConfiguracion>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.empresa_configuracion WHERE id = ?")
        ) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    EmpresaConfiguracion empresa = mapRow(rs);
                    empresa.setActividades(loadActividades(conn));
                    empresa.setObligaciones(loadObligaciones(conn));
                    return ResponseBuilder.ok(empresa);
                }
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Empresa no encontrada.");
    }

    @Override
    public ResponseEntity<DefaultResponse<EmpresaConfiguracion>> insert(EmpresaConfiguracion empresa) {
        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.empresa_configuracion(" +
                    "ruc, dv_ruc, razon_social, nombre_fantasia, tipo_contribuyente, tipo_regimen, " +
                    "direccion, numero_casa, departamento_codigo, departamento_descripcion, " +
                    "distrito_codigo, distrito_descripcion, ciudad_codigo, ciudad_descripcion, " +
                    "telefono, email, sitio_web, logo_ruta, " +
                    "es_facturador_electronico, ambiente_sifen, codigo_seguridad_contribuyente, " +
                    "moneda_default, iva_incluido_default, estado, fecha_inicio_actividades, " +
                    "tipo_transaccion, tipo_impuesto) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
                    PreparedStatement.RETURN_GENERATED_KEYS)
            ) {
                bindEmpresa(stmt, empresa);
                stmt.execute();
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    rs.next();
                    empresa.setId(rs.getLong("id"));
                }
            }

            // Inserto las listas hijas (replace total: una empresa por tenant)
            deleteActividades(conn);
            insertActividades(conn, empresa.getActividades());
            deleteObligaciones(conn);
            insertObligaciones(conn, empresa.getObligaciones());

            empresa.setActividades(loadActividades(conn));
            empresa.setObligaciones(loadObligaciones(conn));

            conn.commit();
            return ResponseBuilder.ok(empresa);
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        } finally {
            close(conn);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<EmpresaConfiguracion>> update(EmpresaConfiguracion empresa) {
        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            try (PreparedStatement stmt = conn.prepareStatement("UPDATE public.empresa_configuracion SET " +
                    "ruc=?, dv_ruc=?, razon_social=?, nombre_fantasia=?, tipo_contribuyente=?, tipo_regimen=?, " +
                    "direccion=?, numero_casa=?, departamento_codigo=?, departamento_descripcion=?, " +
                    "distrito_codigo=?, distrito_descripcion=?, ciudad_codigo=?, ciudad_descripcion=?, " +
                    "telefono=?, email=?, sitio_web=?, logo_ruta=?, " +
                    "es_facturador_electronico=?, ambiente_sifen=?, codigo_seguridad_contribuyente=?, " +
                    "moneda_default=?, iva_incluido_default=?, estado=?, fecha_inicio_actividades=?, " +
                    "tipo_transaccion=?, tipo_impuesto=?, " +
                    "updated_at=CURRENT_TIMESTAMP " +
                    "WHERE id=?;")
            ) {
                int idx = bindEmpresa(stmt, empresa);
                stmt.setLong(idx, empresa.getId());
                stmt.execute();
            }

            // Sincronizo las listas hijas: reemplazo el set completo por el recibido
            deleteActividades(conn);
            insertActividades(conn, empresa.getActividades());
            deleteObligaciones(conn);
            insertObligaciones(conn, empresa.getObligaciones());

            empresa.setActividades(loadActividades(conn));
            empresa.setObligaciones(loadObligaciones(conn));

            conn.commit();
            return ResponseBuilder.ok(empresa);
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        } finally {
            close(conn);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<EmpresaConfiguracion>> delete(long id) {
        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            deleteActividades(conn);
            deleteObligaciones(conn);
            try (PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.empresa_configuracion WHERE id=?;")) {
                stmt.setLong(1, id);
                stmt.execute();
            }

            conn.commit();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        } finally {
            close(conn);
        }
    }

    // ---------- Actividades económicas (hijas) ----------

    private void insertActividades(Connection conn, List<EmpresaActividadEconomica> actividades) throws SQLException {
        if (actividades == null || actividades.isEmpty()) {
            return;
        }
        try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.empresa_actividad_economica(" +
                "codigo, descripcion, es_principal) VALUES (?, ?, ?);")
        ) {
            for (EmpresaActividadEconomica a : actividades) {
                stmt.setString(1, a.getCodigo());
                stmt.setString(2, a.getDescripcion());
                stmt.setBoolean(3, a.isEs_principal());
                stmt.addBatch();
            }
            stmt.executeBatch();
        }
    }

    private void deleteActividades(Connection conn) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.empresa_actividad_economica;")) {
            stmt.execute();
        }
    }

    private List<EmpresaActividadEconomica> loadActividades(Connection conn) throws SQLException {
        List<EmpresaActividadEconomica> actividades = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.empresa_actividad_economica " +
                "ORDER BY es_principal DESC, codigo");
             ResultSet rs = stmt.executeQuery()
        ) {
            while (rs.next()) {
                EmpresaActividadEconomica a = new EmpresaActividadEconomica();
                a.setCodigo(rs.getString("codigo"));
                a.setDescripcion(rs.getString("descripcion"));
                a.setEs_principal(rs.getBoolean("es_principal"));
                actividades.add(a);
            }
        }
        return actividades;
    }

    // ---------- Obligaciones (hijas) ----------

    private void insertObligaciones(Connection conn, List<EmpresaObligacion> obligaciones) throws SQLException {
        if (obligaciones == null || obligaciones.isEmpty()) {
            return;
        }
        try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.empresa_obligacion(" +
                "codigo, descripcion) VALUES (?, ?);")
        ) {
            for (EmpresaObligacion o : obligaciones) {
                stmt.setString(1, o.getCodigo());
                stmt.setString(2, o.getDescripcion());
                stmt.addBatch();
            }
            stmt.executeBatch();
        }
    }

    private void deleteObligaciones(Connection conn) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.empresa_obligacion;")) {
            stmt.execute();
        }
    }

    private List<EmpresaObligacion> loadObligaciones(Connection conn) throws SQLException {
        List<EmpresaObligacion> obligaciones = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.empresa_obligacion ORDER BY codigo");
             ResultSet rs = stmt.executeQuery()
        ) {
            while (rs.next()) {
                EmpresaObligacion o = new EmpresaObligacion();
                o.setCodigo(rs.getString("codigo"));
                o.setDescripcion(rs.getString("descripcion"));
                obligaciones.add(o);
            }
        }
        return obligaciones;
    }

    // ---------- Helpers ----------

    // Vincula las 25 columnas del INSERT/UPDATE en orden y devuelve el siguiente índice libre.
    private int bindEmpresa(PreparedStatement stmt, EmpresaConfiguracion e) throws SQLException {
        int i = 1;
        stmt.setString(i++, e.getRuc());
        stmt.setString(i++, e.getDv_ruc());
        stmt.setString(i++, e.getRazon_social());
        stmt.setString(i++, e.getNombre_fantasia());
        stmt.setInt(i++, e.getTipo_contribuyente());
        stmt.setObject(i++, e.getTipo_regimen());
        stmt.setString(i++, e.getDireccion());
        stmt.setString(i++, e.getNumero_casa());
        stmt.setInt(i++, e.getDepartamento_codigo());
        stmt.setString(i++, e.getDepartamento_descripcion());
        stmt.setInt(i++, e.getDistrito_codigo());
        stmt.setString(i++, e.getDistrito_descripcion());
        stmt.setInt(i++, e.getCiudad_codigo());
        stmt.setString(i++, e.getCiudad_descripcion());
        stmt.setString(i++, e.getTelefono());
        stmt.setString(i++, e.getEmail());
        stmt.setString(i++, e.getSitio_web());
        stmt.setString(i++, e.getLogo_ruta());
        stmt.setBoolean(i++, e.isEs_facturador_electronico());
        stmt.setString(i++, e.getAmbiente_sifen());
        stmt.setString(i++, e.getCodigo_seguridad_contribuyente());
        stmt.setString(i++, e.getMoneda_default());
        stmt.setBoolean(i++, e.isIva_incluido_default());
        stmt.setString(i++, e.getEstado());
        stmt.setDate(i++, e.getFecha_inicio_actividades() != null ? Date.valueOf(e.getFecha_inicio_actividades()) : null);
        stmt.setObject(i++, e.getTipo_transaccion());
        stmt.setObject(i++, e.getTipo_impuesto());
        return i;
    }

    private EmpresaConfiguracion mapRow(ResultSet rs) throws SQLException {
        EmpresaConfiguracion e = new EmpresaConfiguracion();
        e.setId(rs.getLong("id"));
        e.setRuc(rs.getString("ruc"));
        e.setDv_ruc(rs.getString("dv_ruc"));
        e.setRazon_social(rs.getString("razon_social"));
        e.setNombre_fantasia(rs.getString("nombre_fantasia"));
        e.setTipo_contribuyente(rs.getInt("tipo_contribuyente"));
        e.setTipo_regimen((Integer) rs.getObject("tipo_regimen"));
        e.setDireccion(rs.getString("direccion"));
        e.setNumero_casa(rs.getString("numero_casa"));
        e.setDepartamento_codigo(rs.getInt("departamento_codigo"));
        e.setDepartamento_descripcion(rs.getString("departamento_descripcion"));
        e.setDistrito_codigo(rs.getInt("distrito_codigo"));
        e.setDistrito_descripcion(rs.getString("distrito_descripcion"));
        e.setCiudad_codigo(rs.getInt("ciudad_codigo"));
        e.setCiudad_descripcion(rs.getString("ciudad_descripcion"));
        e.setTelefono(rs.getString("telefono"));
        e.setEmail(rs.getString("email"));
        e.setSitio_web(rs.getString("sitio_web"));
        e.setLogo_ruta(rs.getString("logo_ruta"));
        e.setEs_facturador_electronico(rs.getBoolean("es_facturador_electronico"));
        e.setAmbiente_sifen(rs.getString("ambiente_sifen"));
        e.setCodigo_seguridad_contribuyente(rs.getString("codigo_seguridad_contribuyente"));
        e.setMoneda_default(rs.getString("moneda_default"));
        e.setIva_incluido_default(rs.getBoolean("iva_incluido_default"));
        e.setTipo_transaccion((Integer) rs.getObject("tipo_transaccion"));
        e.setTipo_impuesto((Integer) rs.getObject("tipo_impuesto"));
        e.setEstado(rs.getString("estado"));
        Date fia = rs.getDate("fecha_inicio_actividades");
        e.setFecha_inicio_actividades(fia != null ? fia.toLocalDate() : null);
        Timestamp ca = rs.getTimestamp("created_at");
        e.setCreated_at(ca != null ? ca.toLocalDateTime() : null);
        Timestamp ua = rs.getTimestamp("updated_at");
        e.setUpdated_at(ua != null ? ua.toLocalDateTime() : null);
        return e;
    }

    private void rollback(Connection conn) {
        if (conn != null) {
            try {
                conn.rollback();
            } catch (SQLException ex) {
                log.error("Error en rollback: ", ex);
            }
        }
    }

    private void close(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException ex) {
                log.error("Error al cerrar conexión: ", ex);
            }
        }
    }
}
