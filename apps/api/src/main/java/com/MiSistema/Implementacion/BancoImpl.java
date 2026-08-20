package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Banco;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.BancoService;
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
public class BancoImpl implements BancoService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<Banco>> list(DefaultFilter filtro) {
        List<Banco> arrayList = new ArrayList<>();
        long totalRecords = 0;
        String texto = filtro.getTexto() != null ? filtro.getTexto() : "";
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(
                     "SELECT * FROM public.banco WHERE (bancodigo ILIKE ? OR bannombre ILIKE ?) " +
                     "ORDER BY bannombre LIMIT ? OFFSET ?");
             PreparedStatement stmtCount = conn.prepareStatement(
                     "SELECT count(*) AS totalRecords FROM public.banco WHERE (bancodigo ILIKE ? OR bannombre ILIKE ?)")
        ) {
            stmt.setString(1, "%" + texto + "%");
            stmt.setString(2, "%" + texto + "%");
            stmt.setLong(3, filtro.getLimit());
            stmt.setLong(4, filtro.getOffset());

            stmtCount.setString(1, "%" + texto + "%");
            stmtCount.setString(2, "%" + texto + "%");
            try (ResultSet rsC = stmtCount.executeQuery()) {
                rsC.next();
                totalRecords = rsC.getLong("totalRecords");
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
    public ResponseEntity<DefaultResponse<Banco>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.banco WHERE banid = ?")
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
        return ResponseBuilder.error("Banco no encontrado.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Banco>> insert(Banco banco) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.banco(" +
                     "bancodigo, bannombre, bantipo, banruc, bandv, banswift, banbcp, " +
                     "bantelefono, banejecutivo, banobserva, banactivo) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            bindBanco(stmt, banco);
            stmt.execute();
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                banco.setBanid(rs.getLong("banid"));
            }
            return ResponseBuilder.ok(banco);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Banco>> update(Banco banco) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.banco SET " +
                     "bancodigo=?, bannombre=?, bantipo=?, banruc=?, bandv=?, banswift=?, banbcp=?, " +
                     "bantelefono=?, banejecutivo=?, banobserva=?, banactivo=? WHERE banid=?;")
        ) {
            int idx = bindBanco(stmt, banco);
            stmt.setLong(idx, banco.getBanid());
            stmt.execute();
            return ResponseBuilder.ok(banco);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    /** Baja lógica: el banco no se borra, se desactiva (regla del módulo). */
    @Override
    public ResponseEntity<DefaultResponse<Banco>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.banco SET banactivo = FALSE WHERE banid = ?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // Vincula las 11 columnas de INSERT/UPDATE en orden y devuelve el siguiente índice libre.
    private int bindBanco(PreparedStatement stmt, Banco b) throws SQLException {
        int i = 1;
        stmt.setString(i++, b.getBancodigo());
        stmt.setString(i++, b.getBannombre());
        stmt.setString(i++, b.getBantipo() != null ? b.getBantipo() : "B");
        stmt.setString(i++, b.getBanruc());
        stmt.setObject(i++, b.getBandv());
        stmt.setString(i++, b.getBanswift());
        stmt.setString(i++, b.getBanbcp());
        stmt.setString(i++, b.getBantelefono());
        stmt.setString(i++, b.getBanejecutivo());
        stmt.setString(i++, b.getBanobserva());
        stmt.setBoolean(i++, b.isBanactivo());
        return i;
    }

    private Banco mapRow(ResultSet rs) throws SQLException {
        Banco b = new Banco();
        b.setBanid(rs.getLong("banid"));
        b.setBancodigo(rs.getString("bancodigo"));
        b.setBannombre(rs.getString("bannombre"));
        b.setBantipo(rs.getString("bantipo"));
        b.setBanruc(rs.getString("banruc"));
        b.setBandv((Integer) rs.getObject("bandv"));
        b.setBanswift(rs.getString("banswift"));
        b.setBanbcp(rs.getString("banbcp"));
        b.setBantelefono(rs.getString("bantelefono"));
        b.setBanejecutivo(rs.getString("banejecutivo"));
        b.setBanobserva(rs.getString("banobserva"));
        b.setBanactivo(rs.getBoolean("banactivo"));
        return b;
    }
}
