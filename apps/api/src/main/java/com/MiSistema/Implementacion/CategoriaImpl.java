package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Categoria;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.CategoriaService;
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
public class CategoriaImpl implements CategoriaService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<Categoria>> list(DefaultFilter defaultFilter) {
        List<Categoria> arrayList = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.categoria " +
                     "WHERE (cat_nom ilike ? or cat_desc ilike ?) ORDER BY cat_id")
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
    public ResponseEntity<DefaultResponse<Categoria>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.categoria WHERE cat_id = ?")
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
        return ResponseBuilder.error("Categoría no encontrada.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Categoria>> insert(Categoria categoria) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.categoria(cat_nom, cat_desc, fam_id) VALUES (?, ?, ?);",
                     PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            stmt.setString(1, categoria.getCat_nom());
            stmt.setString(2, categoria.getCat_desc());
            stmt.setInt(3, categoria.getFam_id());
            stmt.execute();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                categoria.setCat_id(rs.getLong("cat_id"));
            }
            return ResponseBuilder.ok(categoria);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Categoria>> update(Categoria categoria) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.categoria SET cat_nom=?, cat_desc=?, fam_id=? WHERE cat_id=?;")
        ) {
            stmt.setString(1, categoria.getCat_nom());
            stmt.setString(2, categoria.getCat_desc());
            stmt.setInt(3, categoria.getFam_id());
            stmt.setLong(4, categoria.getCat_id());
            stmt.execute();
            return ResponseBuilder.ok(categoria);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Categoria>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.categoria WHERE cat_id=?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    private Categoria mapRow(ResultSet rs) throws SQLException {
        Categoria c = new Categoria();
        c.setCat_id(rs.getLong("cat_id"));
        c.setCat_nom(rs.getString("cat_nom"));
        c.setCat_desc(rs.getString("cat_desc"));
        c.setFam_id(rs.getInt("fam_id"));
        return c;
    }
}
