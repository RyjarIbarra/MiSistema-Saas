package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.UnidadMedida;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.UnidadMedidaService;
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
public class UnidadMedidaImpl implements UnidadMedidaService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<UnidadMedida>> list(DefaultFilter defaultFilter) {
        List<UnidadMedida> arrayList = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.unidad_medida " +
                     "WHERE (codigo ilike ? or descripcion ilike ?) ORDER BY codigo")
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
    public ResponseEntity<DefaultResponse<UnidadMedida>> getById(String codigo) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.unidad_medida WHERE codigo = ?")
        ) {
            stmt.setString(1, codigo);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return ResponseBuilder.ok(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Unidad de medida no encontrada.");
    }

    @Override
    public ResponseEntity<DefaultResponse<UnidadMedida>> insert(UnidadMedida unidadMedida) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.unidad_medida(" +
                     "codigo, descripcion, abreviatura) VALUES (?, ?, ?);")
        ) {
            stmt.setString(1, unidadMedida.getCodigo());
            stmt.setString(2, unidadMedida.getDescripcion());
            stmt.setString(3, unidadMedida.getAbreviatura());
            stmt.execute();
            return ResponseBuilder.ok(unidadMedida);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<UnidadMedida>> update(UnidadMedida unidadMedida) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.unidad_medida SET " +
                     "descripcion=?, abreviatura=? WHERE codigo=?;")
        ) {
            stmt.setString(1, unidadMedida.getDescripcion());
            stmt.setString(2, unidadMedida.getAbreviatura());
            stmt.setString(3, unidadMedida.getCodigo());
            stmt.execute();
            return ResponseBuilder.ok(unidadMedida);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<UnidadMedida>> delete(String codigo) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.unidad_medida WHERE codigo=?;")
        ) {
            stmt.setString(1, codigo);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // La PK es codigo (String) — los overloads long del contrato genérico no aplican.
    @Override
    public ResponseEntity<DefaultResponse<UnidadMedida>> getById(long id) {
        return ResponseBuilder.error("Use getById(String codigo).");
    }

    @Override
    public ResponseEntity<DefaultResponse<UnidadMedida>> delete(long id) {
        return ResponseBuilder.error("Use delete(String codigo).");
    }

    private UnidadMedida mapRow(ResultSet rs) throws SQLException {
        UnidadMedida u = new UnidadMedida();
        u.setCodigo(rs.getString("codigo"));
        u.setDescripcion(rs.getString("descripcion"));
        u.setAbreviatura(rs.getString("abreviatura"));
        return u;
    }
}
