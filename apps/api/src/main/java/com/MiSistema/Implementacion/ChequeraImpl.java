package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Chequera;
import com.MiSistema.ModelsDto.Banco.ChequeFiltro;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.Services.ChequeraService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChequeraImpl implements ChequeraService {

    private final DataSourceManager dsManager;

    private static final String SELECT_BASE =
            "SELECT q.*, c.cbaalias, c.cbamoneda, b.bannombre, " +
            "(q.chqhasta - q.chqactual + 1) AS disponibles " +
            "FROM public.chequera q " +
            "INNER JOIN public.cuenta_bancaria c ON c.cbaid = q.chqcbaid " +
            "INNER JOIN public.banco b ON b.banid = c.cbabanid ";

    @Override
    public ResponseEntity<DefaultResponse<Chequera>> list(ChequeFiltro f) {
        List<Chequera> lista = new ArrayList<>();
        long totalRecords = 0;
        String texto = f.getTexto() != null ? f.getTexto() : "";
        String where = "WHERE (?::bigint = 0 OR q.chqcbaid = ?) " +
                "AND (COALESCE(q.chqserie,'') ILIKE ? OR c.cbaalias ILIKE ? OR b.bannombre ILIKE ?) ";
        String sql = SELECT_BASE + where + "ORDER BY q.chqactivo DESC, c.cbaalias, q.chqdesde LIMIT ? OFFSET ?";
        String countSql = "SELECT count(*) AS totalRecords FROM public.chequera q " +
                "INNER JOIN public.cuenta_bancaria c ON c.cbaid = q.chqcbaid " +
                "INNER JOIN public.banco b ON b.banid = c.cbabanid " + where;
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql);
             PreparedStatement stmtCount = conn.prepareStatement(countSql)) {
            bindWhere(stmt, f, texto);
            stmt.setLong(6, f.getLimit());
            stmt.setLong(7, f.getOffset());
            bindWhere(stmtCount, f, texto);
            try (ResultSet rsC = stmtCount.executeQuery()) { rsC.next(); totalRecords = rsC.getLong("totalRecords"); }
            try (ResultSet rs = stmt.executeQuery()) { while (rs.next()) lista.add(mapRow(rs)); }
            return ResponseBuilder.ok(lista, totalRecords);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    private void bindWhere(PreparedStatement stmt, ChequeFiltro f, String texto) throws SQLException {
        stmt.setLong(1, f.getCbaid());
        stmt.setLong(2, f.getCbaid());
        stmt.setString(3, "%" + texto + "%");
        stmt.setString(4, "%" + texto + "%");
        stmt.setString(5, "%" + texto + "%");
    }

    @Override
    public ResponseEntity<DefaultResponse<Chequera>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(SELECT_BASE + "WHERE q.chqid = ?")) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return ResponseBuilder.ok(mapRow(rs));
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Chequera no encontrada.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Chequera>> insert(Chequera q) {
        if (q.getChqcbaid() <= 0 || q.getChqdesde() <= 0 || q.getChqhasta() < q.getChqdesde() || q.getChqfecrec() == null) {
            return ResponseBuilder.error("Datos incompletos: cuenta, rango válido (desde ≤ hasta) y fecha de recepción son obligatorios.", HttpStatus.BAD_REQUEST);
        }
        // chqactual arranca en chqdesde (primer número disponible).
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.chequera(" +
                     "chqcbaid, chqserie, chqdesde, chqhasta, chqactual, chqfecrec, chqobserva, chqactivo) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS)) {
            stmt.setLong(1, q.getChqcbaid());
            stmt.setString(2, blankToNull(q.getChqserie()));
            stmt.setInt(3, q.getChqdesde());
            stmt.setInt(4, q.getChqhasta());
            stmt.setInt(5, q.getChqdesde());
            stmt.setDate(6, Date.valueOf(q.getChqfecrec()));
            stmt.setString(7, blankToNull(q.getChqobserva()));
            stmt.setBoolean(8, true);
            stmt.execute();
            try (ResultSet rs = stmt.getGeneratedKeys()) { rs.next(); q.setChqid(rs.getLong("chqid")); }
            return ResponseBuilder.ok(q);
        } catch (SQLException e) {
            log.error("SQLException insert chequera: ", e);
            return ResponseBuilder.error("No se pudo registrar la chequera: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /** Solo edita datos descriptivos y estado; no toca chqactual (lo gobierna la emisión de cheques). */
    @Override
    public ResponseEntity<DefaultResponse<Chequera>> update(Chequera q) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.chequera SET " +
                     "chqserie=?, chqhasta=?, chqfecrec=?, chqobserva=?, chqactivo=? WHERE chqid=?;")) {
            stmt.setString(1, blankToNull(q.getChqserie()));
            stmt.setInt(2, q.getChqhasta());
            stmt.setDate(3, Date.valueOf(q.getChqfecrec()));
            stmt.setString(4, blankToNull(q.getChqobserva()));
            stmt.setBoolean(5, q.isChqactivo());
            stmt.setLong(6, q.getChqid());
            stmt.execute();
            return ResponseBuilder.ok(q);
        } catch (SQLException e) {
            log.error("SQLException update chequera: ", e);
            return ResponseBuilder.error("No se pudo modificar la chequera: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /** Baja lógica: la chequera no se borra (hay cheques que la referencian), se desactiva. */
    @Override
    public ResponseEntity<DefaultResponse<Chequera>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.chequera SET chqactivo = FALSE WHERE chqid = ?;")) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    private static String blankToNull(String s) { return (s == null || s.isBlank()) ? null : s; }

    private Chequera mapRow(ResultSet rs) throws SQLException {
        Chequera q = new Chequera();
        q.setChqid(rs.getLong("chqid"));
        q.setChqcbaid(rs.getLong("chqcbaid"));
        q.setChqserie(rs.getString("chqserie"));
        q.setChqdesde(rs.getInt("chqdesde"));
        q.setChqhasta(rs.getInt("chqhasta"));
        q.setChqactual(rs.getInt("chqactual"));
        Date fr = rs.getDate("chqfecrec");
        q.setChqfecrec(fr != null ? fr.toLocalDate() : null);
        q.setChqobserva(rs.getString("chqobserva"));
        q.setChqactivo(rs.getBoolean("chqactivo"));
        q.setCbaalias(rs.getString("cbaalias"));
        q.setCbamoneda(rs.getString("cbamoneda"));
        q.setBannombre(rs.getString("bannombre"));
        q.setDisponibles((Integer) rs.getObject("disponibles"));
        return q;
    }
}
