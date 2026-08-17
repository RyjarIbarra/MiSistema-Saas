package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Sucursal;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.SucursalService;
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
public class SucursalImpl implements SucursalService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<Sucursal>> list(DefaultFilter defaultFilter) {
        List<Sucursal> arrayList = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.sucursal " +
                     "WHERE (sucest ILIKE ? OR sucnom ILIKE ?) ORDER BY sucest")
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
    public ResponseEntity<DefaultResponse<Sucursal>> getById(String sucest) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.sucursal WHERE sucest = ?")
        ) {
            stmt.setString(1, sucest);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return ResponseBuilder.ok(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Sucursal no encontrada.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Sucursal>> insert(Sucursal sucursal) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.sucursal(" +
                     "sucest, sucnom, sucdir, suctel) VALUES (?, ?, ?, ?);")
        ) {
            stmt.setString(1, sucursal.getSucest());
            stmt.setString(2, sucursal.getSucnom());
            stmt.setString(3, sucursal.getSucdir());
            stmt.setString(4, sucursal.getSuctel());
            stmt.execute();
            return ResponseBuilder.ok(sucursal);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Sucursal>> update(Sucursal sucursal) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.sucursal SET " +
                     "sucnom=?, sucdir=?, suctel=? WHERE sucest=?;")
        ) {
            stmt.setString(1, sucursal.getSucnom());
            stmt.setString(2, sucursal.getSucdir());
            stmt.setString(3, sucursal.getSuctel());
            stmt.setString(4, sucursal.getSucest());
            stmt.execute();
            return ResponseBuilder.ok(sucursal);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Sucursal>> delete(String sucest) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.sucursal WHERE sucest=?;")
        ) {
            stmt.setString(1, sucest);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // La PK es sucest (String) — los overloads long del contrato genérico no aplican.
    @Override
    public ResponseEntity<DefaultResponse<Sucursal>> getById(long id) {
        return ResponseBuilder.error("Use getById(String sucest).");
    }

    @Override
    public ResponseEntity<DefaultResponse<Sucursal>> delete(long id) {
        return ResponseBuilder.error("Use delete(String sucest).");
    }

    private Sucursal mapRow(ResultSet rs) throws SQLException {
        Sucursal s = new Sucursal();
        s.setSucest(rs.getString("sucest"));
        s.setSucnom(rs.getString("sucnom"));
        s.setSucdir(rs.getString("sucdir"));
        s.setSuctel(rs.getString("suctel"));
        return s;
    }
}
