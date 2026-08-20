package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Timbrado;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.TimbradoService;
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
public class TimbradoImpl implements TimbradoService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<Timbrado>> list(DefaultFilter defaultFilter) {
        List<Timbrado> arrayList = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.timbrado " +
                     "WHERE timnumero ILIKE ? ORDER BY timid")
        ) {
            stmt.setString(1, "%" + defaultFilter.getTexto() + "%");

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    arrayList.add(mapRow(rs));
                }
            }
            return ResponseBuilder.ok(arrayList, arrayList.size());
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Timbrado>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.timbrado WHERE timid = ?")
        ) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return ResponseBuilder.ok(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Timbrado no encontrado.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Timbrado>> insert(Timbrado timbrado) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.timbrado(" +
                     "timtipdoc, timnumero, timmodalid, timfecini, timfecvto, " +
                     "timestab, timpunexp, " +
                     "timnrodesde, timnrohasta, timnroactual) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            stmt.setString(1, timbrado.getTimtipdoc());
            stmt.setString(2, timbrado.getTimnumero());
            stmt.setString(3, timbrado.getTimmodalid() != null ? timbrado.getTimmodalid() : "P");
            stmt.setDate(4, Date.valueOf(timbrado.getTimfecini()));
            stmt.setDate(5, timbrado.getTimfecvto() != null ? Date.valueOf(timbrado.getTimfecvto()) : null);
            stmt.setString(6, timbrado.getTimestab());
            stmt.setString(7, timbrado.getTimpunexp());
            stmt.setObject(8, timbrado.getTimnrodesde());
            stmt.setObject(9, timbrado.getTimnrohasta());
            // El nº actual debe cumplir la constraint timbrado_rango. El front manda null (=0) en
            // modalidad E; se arranca en 1 (E) o en timnrodesde (preimpreso/autoimpresor).
            timbrado.setTimnroactual(numeroActualValido(timbrado, timbrado.getTimnroactual()));
            stmt.setInt(10, timbrado.getTimnroactual());
            stmt.execute();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                timbrado.setTimid(rs.getLong("timid"));
            }

            return ResponseBuilder.ok(timbrado);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Timbrado>> update(Timbrado timbrado) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.timbrado SET " +
                     "timtipdoc=?, timnumero=?, timmodalid=?, timfecini=?, timfecvto=?, " +
                     "timestab=?, timpunexp=?, " +
                     "timnrodesde=?, timnrohasta=?, timnroactual=? " +
                     "WHERE timid=?;")
        ) {
            stmt.setString(1, timbrado.getTimtipdoc());
            stmt.setString(2, timbrado.getTimnumero());
            stmt.setString(3, timbrado.getTimmodalid() != null ? timbrado.getTimmodalid() : "P");
            stmt.setDate(4, Date.valueOf(timbrado.getTimfecini()));
            stmt.setDate(5, timbrado.getTimfecvto() != null ? Date.valueOf(timbrado.getTimfecvto()) : null);
            stmt.setString(6, timbrado.getTimestab());
            stmt.setString(7, timbrado.getTimpunexp());
            stmt.setObject(8, timbrado.getTimnrodesde());
            stmt.setObject(9, timbrado.getTimnrohasta());
            // Al editar metadatos no reiniciamos la secuencia: si no llega un nº actual válido
            // (el front manda null en modalidad E), se conserva el que ya tiene el timbrado.
            int nroActual = timbrado.getTimnroactual();
            if (nroActual < 1) {
                Integer existente = numeroActualExistente(conn, timbrado.getTimid());
                nroActual = (existente != null && existente >= 1)
                        ? existente
                        : numeroActualValido(timbrado, 0);
            }
            timbrado.setTimnroactual(nroActual);
            stmt.setInt(10, nroActual);
            stmt.setLong(11, timbrado.getTimid());
            stmt.execute();

            return ResponseBuilder.ok(timbrado);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Timbrado>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.timbrado WHERE timid=?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Timbrado>> actEstadoTim(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.timbrado SET timactivo = NOT timactivo WHERE timid = ?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    private Timbrado mapRow(ResultSet rs) throws SQLException {
        Timbrado t = new Timbrado();
        t.setTimid(rs.getLong("timid"));
        t.setTimtipdoc(rs.getString("timtipdoc"));
        t.setTimnumero(rs.getString("timnumero"));
        t.setTimmodalid(rs.getString("timmodalid"));
        t.setTimestab(rs.getString("timestab"));
        t.setTimpunexp(rs.getString("timpunexp"));
        t.setTimnrodesde((Integer) rs.getObject("timnrodesde"));
        t.setTimnrohasta((Integer) rs.getObject("timnrohasta"));
        t.setTimnroactual(rs.getInt("timnroactual"));
        t.setTimfecini(rs.getDate("timfecini").toLocalDate());
        Date timfecvto = rs.getDate("timfecvto");
        t.setTimfecvto(timfecvto != null ? timfecvto.toLocalDate() : null);
        t.setTimactivo(rs.getBoolean("timactivo"));
        return t;
    }

    /**
     * Devuelve un timnroactual que respeta la constraint timbrado_rango cuando el valor
     * propuesto no es válido (&lt; 1). Electrónico (E): arranca en 1 (rango 1..9.999.999).
     * Preimpreso/autoimpresor: arranca en timnrodesde.
     */
    private static int numeroActualValido(Timbrado t, int propuesto) {
        if (propuesto >= 1) return propuesto;
        String modalidad = t.getTimmodalid() != null ? t.getTimmodalid() : "P";
        if ("E".equals(modalidad)) return 1;
        return t.getTimnrodesde() != null ? t.getTimnrodesde() : 1;
    }

    /** Lee el timnroactual que ya tiene el timbrado (para no reiniciarlo al editar). */
    private static Integer numeroActualExistente(Connection conn, long timid) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT timnroactual FROM public.timbrado WHERE timid = ?")) {
            ps.setLong(1, timid);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return (Integer) rs.getObject("timnroactual");
            }
        }
        return null;
    }
}
