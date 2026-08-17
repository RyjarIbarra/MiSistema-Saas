package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Cliente;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.ClienteService;
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
public class ClienteImpl implements ClienteService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<Cliente>> list(DefaultFilter defaultFilter) {
        List<Cliente> arrayList = new ArrayList<>();
        long totalRecords = 0;
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM cliente WHERE (clinom ilike ? or cliruc ilike ?) ORDER BY cliid LIMIT ? OFFSET ?");
             PreparedStatement stmt_count = conn.prepareStatement("SELECT count(*) AS totalRecords FROM cliente WHERE (clinom ilike ? or cliruc ilike ?)")
        ) {
            stmt.setString(1, "%" + defaultFilter.getTexto() + "%");
            stmt.setString(2, "%" + defaultFilter.getTexto() + "%");
            stmt.setLong(3, defaultFilter.getLimit());
            stmt.setLong(4, defaultFilter.getOffset());

            stmt_count.setString(1, "%" + defaultFilter.getTexto() + "%");
            stmt_count.setString(2, "%" + defaultFilter.getTexto() + "%");
            try (ResultSet rs_count = stmt_count.executeQuery()) {
                rs_count.next();
                totalRecords = rs_count.getLong("totalRecords");
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    arrayList.add(mapRow(rs));
                }
            }
            return ResponseBuilder.ok(arrayList, totalRecords);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Cliente>> getById(long cliid) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.cliente WHERE cliid = ?")
        ) {
            stmt.setLong(1, cliid);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return ResponseBuilder.ok(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Cliente no encontrado.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Cliente>> insert(Cliente cliente) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.cliente(" +
                     "cliruc, clinom, tipo_documento, clitel, climail, clidir, tipoprecio, cliobs, " +
                     "tipo_operacion, tipo_contribuyente, " +
                     "pais_codigo, pais_descripcion, pais_prefijo, " +
                     "departamento_codigo, departamento_descripcion, " +
                     "distrito_codigo, distrito_descripcion, " +
                     "ciudad_codigo, ciudad_descripcion, naturaleza_receptor) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
                     PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            bindCliente(stmt, cliente);
            stmt.execute();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                cliente.setCliid(rs.getLong("cliid"));
            }

            return ResponseBuilder.ok(cliente);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Cliente>> update(Cliente cliente) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.cliente SET " +
                     "cliruc=?, clinom=?, tipo_documento=?, clitel=?, climail=?, clidir=?, tipoprecio=?, cliobs=?, " +
                     "tipo_operacion=?, tipo_contribuyente=?, " +
                     "pais_codigo=?, pais_descripcion=?, pais_prefijo=?, " +
                     "departamento_codigo=?, departamento_descripcion=?, " +
                     "distrito_codigo=?, distrito_descripcion=?, " +
                     "ciudad_codigo=?, ciudad_descripcion=?, naturaleza_receptor=? " +
                     "WHERE cliid=?;")
        ) {
            int idx = bindCliente(stmt, cliente);
            stmt.setLong(idx, cliente.getCliid());
            stmt.execute();

            return ResponseBuilder.ok(cliente);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Cliente>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.cliente WHERE cliid = ?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    /**
     * Resuelve (busca o crea) el cliente por RUC dentro de la transacción recibida.
     * ClienteImpl es el dueño de la tabla public.cliente: cualquier alta de cliente
     * disparada por otro dominio (p. ej. facturación) debe pasar por acá.
     * No abre conexión propia: usa la Connection del llamador para respetar su transacción.
     */
    @Override
    public long resolverClienteId(Connection conn, String cliruc, String clinom) throws SQLException {
        // 1. ¿Ya existe?
        try (PreparedStatement stmt = conn.prepareStatement("SELECT cliid FROM public.cliente WHERE cliruc = ?")) {
            stmt.setString(1, cliruc);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return rs.getLong("cliid");
            }
        }
        // 2. No existe: crearlo con lo mínimo (defaults del DDL cubren el resto)
        try (PreparedStatement stmt = conn.prepareStatement(
                "INSERT INTO public.cliente(cliruc, clinom, tipo_documento) VALUES (?, ?, ?);",
                PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            stmt.setString(1, cliruc);
            stmt.setString(2, clinom);
            stmt.setInt(3, 9);  // 9 = RUC
            stmt.execute();
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                return rs.getLong("cliid");
            }
        }
    }

    // Vincula las 20 columnas de INSERT/UPDATE en orden y devuelve el siguiente índice libre.
    private int bindCliente(PreparedStatement stmt, Cliente c) throws SQLException {
        int i = 1;
        stmt.setString(i++, c.getCliruc());
        stmt.setString(i++, c.getClinom());
        stmt.setInt(i++, c.getTipo_documento());
        stmt.setString(i++, c.getClitel());
        stmt.setString(i++, c.getClimail());
        stmt.setString(i++, c.getClidir());
        stmt.setObject(i++, c.getTipoprecio());
        stmt.setString(i++, c.getCliobs());
        stmt.setObject(i++, c.getTipo_operacion());
        stmt.setObject(i++, c.getTipo_contribuyente());
        stmt.setString(i++, c.getPais_codigo());
        stmt.setString(i++, c.getPais_descripcion());
        stmt.setString(i++, c.getPais_prefijo());
        stmt.setObject(i++, c.getDepartamento_codigo());
        stmt.setString(i++, c.getDepartamento_descripcion());
        stmt.setObject(i++, c.getDistrito_codigo());
        stmt.setString(i++, c.getDistrito_descripcion());
        stmt.setObject(i++, c.getCiudad_codigo());
        stmt.setString(i++, c.getCiudad_descripcion());
        stmt.setObject(i++, c.getNaturaleza_receptor());
        return i;
    }

    private Cliente mapRow(ResultSet rs) throws SQLException {
        Cliente c = new Cliente();
        c.setCliid(rs.getLong("cliid"));
        c.setCliruc(rs.getString("cliruc"));
        c.setClinom(rs.getString("clinom"));
        c.setTipo_documento(rs.getInt("tipo_documento"));
        c.setClitel(rs.getString("clitel"));
        c.setClimail(rs.getString("climail"));
        c.setClidir(rs.getString("clidir"));
        c.setTipoprecio((Integer) rs.getObject("tipoprecio"));
        c.setCliobs(rs.getString("cliobs"));
        Timestamp clifec = rs.getTimestamp("clifec");
        c.setClifec(clifec != null ? clifec.toLocalDateTime() : null);
        c.setTipo_operacion((Integer) rs.getObject("tipo_operacion"));
        c.setTipo_contribuyente((Integer) rs.getObject("tipo_contribuyente"));
        c.setPais_codigo(rs.getString("pais_codigo"));
        c.setPais_descripcion(rs.getString("pais_descripcion"));
        c.setPais_prefijo(rs.getString("pais_prefijo"));
        c.setDepartamento_codigo((Integer) rs.getObject("departamento_codigo"));
        c.setDepartamento_descripcion(rs.getString("departamento_descripcion"));
        c.setDistrito_codigo((Integer) rs.getObject("distrito_codigo"));
        c.setDistrito_descripcion(rs.getString("distrito_descripcion"));
        c.setCiudad_codigo((Integer) rs.getObject("ciudad_codigo"));
        c.setCiudad_descripcion(rs.getString("ciudad_descripcion"));
        c.setNaturaleza_receptor((Integer) rs.getObject("naturaleza_receptor"));
        return c;
    }
}
