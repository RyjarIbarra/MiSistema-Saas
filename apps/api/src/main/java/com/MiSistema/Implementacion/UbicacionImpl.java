package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Ubicacion;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.UbicacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UbicacionImpl implements UbicacionService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<Ubicacion>> list(DefaultFilter defaultFilter) {
        List<Ubicacion> arrayList = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.ubicacion " +
                     "WHERE (ubi_codigo ilike ? or ubi_ubicacion ilike ? or ubi_referencia ilike ?) ORDER BY ubi_id")
        ) {
            stmt.setString(1, "%" + defaultFilter.getTexto() + "%");
            stmt.setString(2, "%" + defaultFilter.getTexto() + "%");
            stmt.setString(3, "%" + defaultFilter.getTexto() + "%");

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
    public ResponseEntity<DefaultResponse<Ubicacion>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.ubicacion WHERE ubi_id = ?")
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
        return ResponseBuilder.error("Ubicación no encontrada.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Ubicacion>> insert(Ubicacion ubicacion) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.ubicacion(" +
                     "ubi_codigo, ubi_ubicacion, ubi_referencia) VALUES (?, ?, ?);",
                     PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            stmt.setString(1, ubicacion.getUbi_codigo());
            stmt.setString(2, ubicacion.getUbi_ubicacion());
            stmt.setString(3, ubicacion.getUbi_referencia());
            stmt.execute();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                ubicacion.setUbi_id(rs.getLong("ubi_id"));
            }
            return ResponseBuilder.ok(ubicacion);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Ubicacion>> update(Ubicacion ubicacion) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.ubicacion SET " +
                     "ubi_codigo=?, ubi_ubicacion=?, ubi_referencia=? WHERE ubi_id=?;")
        ) {
            stmt.setString(1, ubicacion.getUbi_codigo());
            stmt.setString(2, ubicacion.getUbi_ubicacion());
            stmt.setString(3, ubicacion.getUbi_referencia());
            stmt.setLong(4, ubicacion.getUbi_id());
            stmt.execute();
            return ResponseBuilder.ok(ubicacion);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Ubicacion>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.ubicacion WHERE ubi_id=?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    private Ubicacion mapRow(ResultSet rs) throws SQLException {
        Ubicacion u = new Ubicacion();
        u.setUbi_id(rs.getLong("ubi_id"));
        u.setUbi_codigo(rs.getString("ubi_codigo"));
        u.setUbi_ubicacion(rs.getString("ubi_ubicacion"));
        u.setUbi_referencia(rs.getString("ubi_referencia"));
        return u;
    }
}
