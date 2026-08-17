package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Familia;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.FamiliaService;
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
public class FamiliaImpl implements FamiliaService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<Familia>> list(DefaultFilter defaultFilter) {
        List<Familia> arrayList = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.familia " +
                     "WHERE (fam_nom ilike ? or fam_desc ilike ?) ORDER BY fam_id")
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
    public ResponseEntity<DefaultResponse<Familia>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.familia WHERE fam_id = ?")
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
        return ResponseBuilder.error("Familia no encontrada.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Familia>> insert(Familia familia) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.familia(fam_nom, fam_desc) VALUES (?, ?);",
                     PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            stmt.setString(1, familia.getFam_nom());
            stmt.setString(2, familia.getFam_desc());
            stmt.execute();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                familia.setFam_id(rs.getLong("fam_id"));
            }
            return ResponseBuilder.ok(familia);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Familia>> update(Familia familia) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.familia SET fam_nom=?, fam_desc=? WHERE fam_id=?;")
        ) {
            stmt.setString(1, familia.getFam_nom());
            stmt.setString(2, familia.getFam_desc());
            stmt.setLong(3, familia.getFam_id());
            stmt.execute();
            return ResponseBuilder.ok(familia);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Familia>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.familia WHERE fam_id=?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    private Familia mapRow(ResultSet rs) throws SQLException {
        Familia f = new Familia();
        f.setFam_id(rs.getLong("fam_id"));
        f.setFam_nom(rs.getString("fam_nom"));
        f.setFam_desc(rs.getString("fam_desc"));
        return f;
    }
}
