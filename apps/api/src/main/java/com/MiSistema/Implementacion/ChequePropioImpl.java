package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.ChequePropio;
import com.MiSistema.Modelos.MovimientoBancario;
import com.MiSistema.ModelsDto.Banco.ChequeAccion;
import com.MiSistema.ModelsDto.Banco.ChequeFiltro;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.Services.ChequePropioService;
import com.MiSistema.Services.MovimientoBancarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChequePropioImpl implements ChequePropioService {

    private final DataSourceManager dsManager;
    private final MovimientoBancarioService movimientoService;   // genera los movimientos de libro

    private static final String SELECT_BASE =
            "SELECT p.*, q.chqserie, c.cbaalias, c.cbamoneda, b.bannombre " +
            "FROM public.cheque_propio p " +
            "INNER JOIN public.chequera q ON q.chqid = p.chpchqid " +
            "INNER JOIN public.cuenta_bancaria c ON c.cbaid = p.chpcbaid " +
            "INNER JOIN public.banco b ON b.banid = c.cbabanid ";

    @Override
    public ResponseEntity<DefaultResponse<ChequePropio>> list(ChequeFiltro f) {
        List<ChequePropio> lista = new ArrayList<>();
        long totalRecords = 0;
        String texto = f.getTexto() != null ? f.getTexto() : "";
        String estado = f.getEstado() != null ? f.getEstado() : "";
        String where = "WHERE (?::bigint = 0 OR p.chpcbaid = ?) " +
                "AND (? = '' OR p.chpestado = ?) " +
                "AND (p.chpnumero::text ILIKE ? OR p.chpbenefic ILIKE ? OR p.chpconcepto ILIKE ?) ";
        String sql = SELECT_BASE + where + "ORDER BY p.chpfecemi DESC, p.chpid DESC LIMIT ? OFFSET ?";
        String countSql = "SELECT count(*) AS totalRecords FROM public.cheque_propio p " + where;
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql);
             PreparedStatement stmtCount = conn.prepareStatement(countSql)) {
            bindWhere(stmt, f, estado, texto);
            stmt.setLong(8, f.getLimit());
            stmt.setLong(9, f.getOffset());
            bindWhere(stmtCount, f, estado, texto);
            try (ResultSet rsC = stmtCount.executeQuery()) { rsC.next(); totalRecords = rsC.getLong("totalRecords"); }
            try (ResultSet rs = stmt.executeQuery()) { while (rs.next()) lista.add(mapRow(rs)); }
            return ResponseBuilder.ok(lista, totalRecords);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    private void bindWhere(PreparedStatement stmt, ChequeFiltro f, String estado, String texto) throws SQLException {
        stmt.setLong(1, f.getCbaid());
        stmt.setLong(2, f.getCbaid());
        stmt.setString(3, estado);
        stmt.setString(4, estado);
        stmt.setString(5, "%" + texto + "%");
        stmt.setString(6, "%" + texto + "%");
        stmt.setString(7, "%" + texto + "%");
    }

    @Override
    public ResponseEntity<DefaultResponse<ChequePropio>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(SELECT_BASE + "WHERE p.chpid = ?")) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return ResponseBuilder.ok(mapRow(rs));
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Cheque no encontrado.");
    }

    @Override
    public ResponseEntity<DefaultResponse<ChequePropio>> emitir(ChequePropio ch) {
        if (ch.getChpchqid() <= 0 || ch.getChpcbaid() <= 0 || ch.getChpfecemi() == null
                || ch.getChpimporte() == null || ch.getChpimporte().signum() <= 0
                || ch.getChpbenefic() == null || ch.getChpbenefic().isBlank()
                || ch.getChpconcepto() == null || ch.getChpconcepto().isBlank()) {
            return ResponseBuilder.error("Datos incompletos: chequera, cuenta, fecha, importe (>0), beneficiario y concepto son obligatorios.", HttpStatus.BAD_REQUEST);
        }
        // Regla de diferidos: común → fecha de pago = emisión; diferido → posterior.
        if (!ch.isChpdiferido()) {
            ch.setChpfecpago(ch.getChpfecemi());
        } else if (ch.getChpfecpago() == null || !ch.getChpfecpago().isAfter(ch.getChpfecemi())) {
            return ResponseBuilder.error("Un cheque diferido requiere una fecha de pago posterior a la de emisión.", HttpStatus.BAD_REQUEST);
        }

        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            int numero;
            try (PreparedStatement stmt = conn.prepareStatement("SELECT public.fn_chequera_siguiente_numero(?)")) {
                stmt.setLong(1, ch.getChpchqid());
                try (ResultSet rs = stmt.executeQuery()) { rs.next(); numero = rs.getInt(1); }
            }
            ch.setChpnumero(numero);

            // El movimiento de libro se registra a la fecha de pago (tipo CHE, débito).
            MovimientoBancario mov = new MovimientoBancario();
            mov.setMbacbaid(ch.getChpcbaid());
            mov.setMbatipo("CHE");
            mov.setMbafecha(ch.getChpfecpago());
            mov.setMbaimporte(ch.getChpimporte());
            mov.setMbaconcepto("Cheque Nº " + numero + " - " + ch.getChpconcepto());
            mov.setMbacontrapar(ch.getChpbenefic());
            mov.setMbacontraruc(ch.getChpbeneruc());
            mov.setMbausucrea(ch.getChpusucrea());
            long mbaid = movimientoService.registrarInterno(conn, mov, "CHEQUE_PROPIO");
            ch.setChpmbaid(mbaid);

            long id;
            try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.cheque_propio(" +
                    "chpchqid, chpcbaid, chpnumero, chpdiferido, chpfecemi, chpfecpago, chpimporte, " +
                    "chpbenefic, chpbeneruc, chpalaorden, chpcruzado, chpconcepto, chpestado, chpmbaid, chpobserva, chpusucrea) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EMITIDO', ?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS)) {
                stmt.setLong(1, ch.getChpchqid());
                stmt.setLong(2, ch.getChpcbaid());
                stmt.setInt(3, numero);
                stmt.setBoolean(4, ch.isChpdiferido());
                stmt.setDate(5, Date.valueOf(ch.getChpfecemi()));
                stmt.setDate(6, Date.valueOf(ch.getChpfecpago()));
                stmt.setBigDecimal(7, ch.getChpimporte());
                stmt.setString(8, ch.getChpbenefic());
                stmt.setString(9, blankToNull(ch.getChpbeneruc()));
                stmt.setBoolean(10, ch.isChpalaorden());
                stmt.setBoolean(11, ch.isChpcruzado());
                stmt.setString(12, ch.getChpconcepto());
                stmt.setLong(13, mbaid);
                stmt.setString(14, blankToNull(ch.getChpobserva()));
                stmt.setObject(15, ch.getChpusucrea());
                stmt.execute();
                try (ResultSet rs = stmt.getGeneratedKeys()) { rs.next(); id = rs.getLong("chpid"); }
            }
            conn.commit();
            ch.setChpid(id);
            ch.setChpestado("EMITIDO");
            return ResponseBuilder.ok(ch);
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException emitiendo cheque: ", e);
            return ResponseBuilder.error("No se pudo emitir el cheque: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> entregar(ChequeAccion a) {
        LocalDate fecha = a.getFecha() != null ? a.getFecha() : LocalDate.now();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.cheque_propio SET " +
                     "chpestado = 'ENTREGADO', chpfecentr = ? WHERE chpid = ? AND chpestado = 'EMITIDO';")) {
            stmt.setDate(1, Date.valueOf(fecha));
            stmt.setLong(2, a.getId());
            if (stmt.executeUpdate() == 0) return ResponseBuilder.error("El cheque no está en estado EMITIDO.", HttpStatus.BAD_REQUEST);
            return ResponseBuilder.ok("Cheque entregado.");
        } catch (SQLException e) {
            log.error("SQLException entregar: ", e);
            return ResponseBuilder.error("No se pudo registrar la entrega: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> cobrar(ChequeAccion a) {
        LocalDate fecha = a.getFecha() != null ? a.getFecha() : LocalDate.now();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.cheque_propio SET " +
                     "chpestado = 'COBRADO', chpfeccobro = ? WHERE chpid = ? AND chpestado IN ('EMITIDO','ENTREGADO');")) {
            stmt.setDate(1, Date.valueOf(fecha));
            stmt.setLong(2, a.getId());
            if (stmt.executeUpdate() == 0) return ResponseBuilder.error("El cheque debe estar EMITIDO o ENTREGADO.", HttpStatus.BAD_REQUEST);
            return ResponseBuilder.ok("Cheque marcado como cobrado.");
        } catch (SQLException e) {
            log.error("SQLException cobrar: ", e);
            return ResponseBuilder.error("No se pudo marcar el cobro: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> rechazar(ChequeAccion a) {
        if (a.getMotivo() == null || a.getMotivo().isBlank()) {
            return ResponseBuilder.error("El motivo del rechazo es obligatorio.", HttpStatus.BAD_REQUEST);
        }
        LocalDate fecha = a.getFecha() != null ? a.getFecha() : LocalDate.now();
        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            long cbaid; int numero; BigDecimal importe; String estado;
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT chpcbaid, chpnumero, chpimporte, chpestado FROM public.cheque_propio WHERE chpid = ? FOR UPDATE")) {
                stmt.setLong(1, a.getId());
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) { rollback(conn); return ResponseBuilder.error("Cheque no encontrado.", HttpStatus.BAD_REQUEST); }
                    cbaid = rs.getLong("chpcbaid"); numero = rs.getInt("chpnumero");
                    importe = rs.getBigDecimal("chpimporte"); estado = rs.getString("chpestado");
                }
            }
            if (!"EMITIDO".equals(estado) && !"ENTREGADO".equals(estado)) {
                rollback(conn);
                return ResponseBuilder.error("Solo se puede rechazar un cheque EMITIDO o ENTREGADO.", HttpStatus.BAD_REQUEST);
            }

            // Movimiento de reversión (tipo CHR, crédito): devuelve el importe al libro. El original no se toca.
            MovimientoBancario mov = new MovimientoBancario();
            mov.setMbacbaid(cbaid);
            mov.setMbatipo("CHR");
            mov.setMbafecha(fecha);
            mov.setMbaimporte(importe);
            mov.setMbaconcepto("Rechazo cheque Nº " + numero + " - " + a.getMotivo());
            long mbarech = movimientoService.registrarInterno(conn, mov, "CHEQUE_PROPIO");

            try (PreparedStatement stmt = conn.prepareStatement("UPDATE public.cheque_propio SET " +
                    "chpestado = 'RECHAZADO', chpmotivo = ?, chpmbarech = ? WHERE chpid = ?;")) {
                stmt.setString(1, a.getMotivo());
                stmt.setLong(2, mbarech);
                stmt.setLong(3, a.getId());
                stmt.executeUpdate();
            }
            conn.commit();
            return ResponseBuilder.ok("Cheque rechazado; se generó la reversión en el libro.");
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException rechazar: ", e);
            return ResponseBuilder.error("No se pudo rechazar el cheque: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> anular(ChequeAccion a) {
        if (a.getMotivo() == null || a.getMotivo().isBlank()) {
            return ResponseBuilder.error("El motivo de anulación es obligatorio.", HttpStatus.BAD_REQUEST);
        }
        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            long mbaid; int numero; String estado;
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT chpmbaid, chpnumero, chpestado FROM public.cheque_propio WHERE chpid = ? FOR UPDATE")) {
                stmt.setLong(1, a.getId());
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) { rollback(conn); return ResponseBuilder.error("Cheque no encontrado.", HttpStatus.BAD_REQUEST); }
                    mbaid = rs.getLong("chpmbaid"); numero = rs.getInt("chpnumero"); estado = rs.getString("chpestado");
                }
            }
            if (!"EMITIDO".equals(estado)) {
                rollback(conn);
                return ResponseBuilder.error("Solo se puede anular un cheque EMITIDO (aún no entregado).", HttpStatus.BAD_REQUEST);
            }

            movimientoService.anularInterno(conn, mbaid, "Anulación cheque Nº " + numero + ": " + a.getMotivo(), null);

            try (PreparedStatement stmt = conn.prepareStatement("UPDATE public.cheque_propio SET " +
                    "chpestado = 'ANULADO', chpmotivo = ? WHERE chpid = ?;")) {
                stmt.setString(1, a.getMotivo());
                stmt.setLong(2, a.getId());
                stmt.executeUpdate();
            }
            conn.commit();
            return ResponseBuilder.ok("Cheque anulado; se revirtió el movimiento de la emisión.");
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException anular cheque: ", e);
            return ResponseBuilder.error("No se pudo anular el cheque: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    // ---------- helpers ----------
    private static String blankToNull(String s) { return (s == null || s.isBlank()) ? null : s; }

    private ChequePropio mapRow(ResultSet rs) throws SQLException {
        ChequePropio p = new ChequePropio();
        p.setChpid(rs.getLong("chpid"));
        p.setChpchqid(rs.getLong("chpchqid"));
        p.setChpcbaid(rs.getLong("chpcbaid"));
        p.setChpnumero(rs.getInt("chpnumero"));
        p.setChpdiferido(rs.getBoolean("chpdiferido"));
        p.setChpfecemi(toLocal(rs.getDate("chpfecemi")));
        p.setChpfecpago(toLocal(rs.getDate("chpfecpago")));
        p.setChpimporte(rs.getBigDecimal("chpimporte"));
        p.setChpbenefic(rs.getString("chpbenefic"));
        p.setChpbeneruc(rs.getString("chpbeneruc"));
        p.setChpalaorden(rs.getBoolean("chpalaorden"));
        p.setChpcruzado(rs.getBoolean("chpcruzado"));
        p.setChpconcepto(rs.getString("chpconcepto"));
        p.setChpestado(rs.getString("chpestado"));
        p.setChpfecentr(toLocal(rs.getDate("chpfecentr")));
        p.setChpfeccobro(toLocal(rs.getDate("chpfeccobro")));
        p.setChpmotivo(rs.getString("chpmotivo"));
        p.setChpmbaid((Long) rs.getObject("chpmbaid"));
        p.setChpmbarech((Long) rs.getObject("chpmbarech"));
        p.setChpopaid((Long) rs.getObject("chpopaid"));
        p.setChpobserva(rs.getString("chpobserva"));
        Timestamp created = rs.getTimestamp("chpcreated");
        p.setChpcreated(created != null ? created.toLocalDateTime() : null);
        p.setChpusucrea((Integer) rs.getObject("chpusucrea"));
        p.setChqserie(rs.getString("chqserie"));
        p.setCbaalias(rs.getString("cbaalias"));
        p.setCbamoneda(rs.getString("cbamoneda"));
        p.setBannombre(rs.getString("bannombre"));
        return p;
    }

    private static LocalDate toLocal(Date d) { return d != null ? d.toLocalDate() : null; }

    private void rollback(Connection conn) {
        if (conn != null) try { conn.rollback(); } catch (SQLException ex) { log.error("rollback: ", ex); }
    }
    private void close(Connection conn) {
        if (conn != null) try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ex) { log.error("close: ", ex); }
    }
}
