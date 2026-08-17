package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Moneda;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.MonedaService;
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
public class MonedaImpl implements MonedaService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<Moneda>> list(DefaultFilter defaultFilter) {
        List<Moneda> arrayList = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.moneda " +
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
    public ResponseEntity<DefaultResponse<Moneda>> getById(String codigo) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.moneda WHERE codigo = ?")
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
        return ResponseBuilder.error("Moneda no encontrada.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Moneda>> insert(Moneda moneda) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.moneda(" +
                     "codigo, descripcion, simbolo, decimales, activo) VALUES (?, ?, ?, ?, ?);")
        ) {
            stmt.setString(1, moneda.getCodigo());
            stmt.setString(2, moneda.getDescripcion());
            stmt.setString(3, moneda.getSimbolo());
            stmt.setInt(4, moneda.getDecimales());
            stmt.setBoolean(5, moneda.isActivo());
            stmt.execute();
            return ResponseBuilder.ok(moneda);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Moneda>> update(Moneda moneda) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.moneda SET " +
                     "descripcion=?, simbolo=?, decimales=?, activo=? WHERE codigo=?;")
        ) {
            stmt.setString(1, moneda.getDescripcion());
            stmt.setString(2, moneda.getSimbolo());
            stmt.setInt(3, moneda.getDecimales());
            stmt.setBoolean(4, moneda.isActivo());
            stmt.setString(5, moneda.getCodigo());
            stmt.execute();
            return ResponseBuilder.ok(moneda);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Moneda>> delete(String codigo) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.moneda WHERE codigo=?;")
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
    public ResponseEntity<DefaultResponse<Moneda>> getById(long id) {
        return ResponseBuilder.error("Use getById(String codigo).");
    }

    @Override
    public ResponseEntity<DefaultResponse<Moneda>> delete(long id) {
        return ResponseBuilder.error("Use delete(String codigo).");
    }

    private Moneda mapRow(ResultSet rs) throws SQLException {
        Moneda m = new Moneda();
        m.setCodigo(rs.getString("codigo"));
        m.setDescripcion(rs.getString("descripcion"));
        m.setSimbolo(rs.getString("simbolo"));
        m.setDecimales(rs.getInt("decimales"));
        m.setActivo(rs.getBoolean("activo"));
        return m;
    }
}
