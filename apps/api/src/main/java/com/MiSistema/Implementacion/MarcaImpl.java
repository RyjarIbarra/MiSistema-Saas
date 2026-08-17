package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Marca;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.MarcaService;
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
public class MarcaImpl implements MarcaService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<Marca>> list(DefaultFilter defaultFilter) {
        List<Marca> arrayList = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.marca " +
                     "WHERE (mar_nom ilike ? or mar_desc ilike ?) ORDER BY mar_id")
        ) {
            stmt.setString(1, "%" + defaultFilter.getTexto() + "%");
            stmt.setString(2, "%" + defaultFilter.getTexto() + "%");

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
    public ResponseEntity<DefaultResponse<Marca>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.marca WHERE mar_id = ?")
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
        return ResponseBuilder.error("Marca no encontrada.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Marca>> insert(Marca marca) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.marca(mar_nom, mar_desc) VALUES (?, ?);",
                     PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            stmt.setString(1, marca.getMar_nom());
            stmt.setString(2, marca.getMar_desc());
            stmt.execute();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                marca.setMar_id(rs.getLong("mar_id"));
            }
            return ResponseBuilder.ok(marca);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Marca>> update(Marca marca) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.marca SET mar_nom=?, mar_desc=? WHERE mar_id=?;")
        ) {
            stmt.setString(1, marca.getMar_nom());
            stmt.setString(2, marca.getMar_desc());
            stmt.setLong(3, marca.getMar_id());
            stmt.execute();
            return ResponseBuilder.ok(marca);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Marca>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.marca WHERE mar_id=?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    private Marca mapRow(ResultSet rs) throws SQLException {
        Marca m = new Marca();
        m.setMar_id(rs.getLong("mar_id"));
        m.setMar_nom(rs.getString("mar_nom"));
        m.setMar_desc(rs.getString("mar_desc"));
        return m;
    }
}
