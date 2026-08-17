package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Caja;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.CajaService;
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
public class CajaImpl implements CajaService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<Caja>> list(DefaultFilter defaultFilter) {
        List<Caja> arrayList = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.caja " +
                     "WHERE (cajsucest ILIKE ? OR cajpuntoexp ILIKE ? OR cajnombre ILIKE ?) " +
                     "ORDER BY cajsucest, cajpuntoexp")
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
    public ResponseEntity<DefaultResponse<Caja>> getById(String sucest, String puntoexp) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.caja WHERE cajsucest = ? AND cajpuntoexp = ?")
        ) {
            stmt.setString(1, sucest);
            stmt.setString(2, puntoexp);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return ResponseBuilder.ok(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Caja no encontrada.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Caja>> insert(Caja caja) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.caja(" +
                     "cajsucest, cajpuntoexp, cajnombre, cajactivo) VALUES (?, ?, ?, ?);")
        ) {
            stmt.setString(1, caja.getCajsucest());
            stmt.setString(2, caja.getCajpuntoexp());
            stmt.setString(3, caja.getCajnombre());
            stmt.setBoolean(4, caja.isCajactivo());
            stmt.execute();
            return ResponseBuilder.ok(caja);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Caja>> update(Caja caja) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.caja SET " +
                     "cajnombre=?, cajactivo=? WHERE cajsucest=? AND cajpuntoexp=?;")
        ) {
            stmt.setString(1, caja.getCajnombre());
            stmt.setBoolean(2, caja.isCajactivo());
            stmt.setString(3, caja.getCajsucest());
            stmt.setString(4, caja.getCajpuntoexp());
            stmt.execute();
            return ResponseBuilder.ok(caja);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Caja>> delete(String sucest, String puntoexp) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.caja WHERE cajsucest=? AND cajpuntoexp=?;")
        ) {
            stmt.setString(1, sucest);
            stmt.setString(2, puntoexp);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Caja>> actEstadoCaj(String sucest, String puntoexp) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.caja SET cajactivo = NOT cajactivo " +
                     "WHERE cajsucest = ? AND cajpuntoexp = ?;")
        ) {
            stmt.setString(1, sucest);
            stmt.setString(2, puntoexp);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // La PK es compuesta (cajsucest, cajpuntoexp) — los overloads long del contrato genérico no aplican.
    @Override
    public ResponseEntity<DefaultResponse<Caja>> getById(long id) {
        return ResponseBuilder.error("Use getById(String sucest, String puntoexp).");
    }

    @Override
    public ResponseEntity<DefaultResponse<Caja>> delete(long id) {
        return ResponseBuilder.error("Use delete(String sucest, String puntoexp).");
    }

    private Caja mapRow(ResultSet rs) throws SQLException {
        Caja c = new Caja();
        c.setCajsucest(rs.getString("cajsucest"));
        c.setCajpuntoexp(rs.getString("cajpuntoexp"));
        c.setCajnombre(rs.getString("cajnombre"));
        c.setCajactivo(rs.getBoolean("cajactivo"));
        return c;
    }
}
