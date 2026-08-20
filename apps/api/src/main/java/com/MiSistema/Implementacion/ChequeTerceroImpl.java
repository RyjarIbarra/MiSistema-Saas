package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.ChequeTercero;
import com.MiSistema.Modelos.MovimientoBancario;
import com.MiSistema.ModelsDto.Banco.ChequeAccion;
import com.MiSistema.ModelsDto.Banco.ChequeFiltro;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.Services.ChequeTerceroService;
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
public class ChequeTerceroImpl implements ChequeTerceroService {

    private final DataSourceManager dsManager;
    private final MovimientoBancarioService movimientoService;

    private static final String SELECT_BASE =
            "SELECT t.*, b.bannombre, cl.clinom AS clinombre, c.cbaalias " +
            "FROM public.cheque_tercero t " +
            "INNER JOIN public.banco b ON b.banid = t.chtbanid " +
            "LEFT JOIN public.cliente cl ON cl.cliid = t.chtcliid " +
            "LEFT JOIN public.cuenta_bancaria c ON c.cbaid = t.chtcbaid ";

    @Override
    public ResponseEntity<DefaultResponse<ChequeTercero>> list(ChequeFiltro f) {
        List<ChequeTercero> lista = new ArrayList<>();
        long totalRecords = 0;
        String texto = f.getTexto() != null ? f.getTexto() : "";
        String estado = f.getEstado() != null ? f.getEstado() : "";
        // cbaid en terceros filtra por cuenta de depósito (0 = todos).
        String where = "WHERE (?::bigint = 0 OR t.chtcbaid = ?) " +
                "AND (? = '' OR t.chtestado = ?) " +
                "AND (t.chtnumero ILIKE ? OR t.chtlibrador ILIKE ? OR COALESCE(cl.clinom,'') ILIKE ?) ";
        String sql = SELECT_BASE + where + "ORDER BY t.chtfecrec DESC, t.chtid DESC LIMIT ? OFFSET ?";
        String countSql = "SELECT count(*) AS totalRecords FROM public.cheque_tercero t " +
                "LEFT JOIN public.cliente cl ON cl.cliid = t.chtcliid " + where;
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
    public ResponseEntity<DefaultResponse<ChequeTercero>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(SELECT_BASE + "WHERE t.chtid = ?")) {
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
    public ResponseEntity<DefaultResponse<ChequeTercero>> recibir(ChequeTercero ch) {
        if (ch.getChtbanid() <= 0 || ch.getChtnumero() == null || ch.getChtnumero().isBlank()
                || ch.getChtlibrador() == null || ch.getChtlibrador().isBlank()
                || ch.getChtfecemi() == null || ch.getChtfecrec() == null
                || ch.getChtimporte() == null || ch.getChtimporte().signum() <= 0
                || ch.getChtmoneda() == null || ch.getChtmoneda().isBlank()) {
            return ResponseBuilder.error("Datos incompletos: banco, número, librador, fechas, importe (>0) y moneda son obligatorios.", HttpStatus.BAD_REQUEST);
        }
        if (!ch.isChtdiferido()) {
            ch.setChtfecpago(ch.getChtfecemi());
        } else if (ch.getChtfecpago() == null || !ch.getChtfecpago().isAfter(ch.getChtfecemi())) {
            return ResponseBuilder.error("Un cheque diferido requiere una fecha de pago posterior a la de emisión.", HttpStatus.BAD_REQUEST);
        }
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.cheque_tercero(" +
                     "chtbanid, chtnumero, chtcuenta, chtlibrador, chtlibruc, chtdiferido, chtfecemi, chtfecpago, " +
                     "chtfecrec, chtimporte, chtmoneda, chtcliid, chtestado, chtrefint, chtobserva, chtusucrea) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CARTERA', ?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS)) {
            stmt.setLong(1, ch.getChtbanid());
            stmt.setString(2, ch.getChtnumero());
            stmt.setString(3, blankToNull(ch.getChtcuenta()));
            stmt.setString(4, ch.getChtlibrador());
            stmt.setString(5, blankToNull(ch.getChtlibruc()));
            stmt.setBoolean(6, ch.isChtdiferido());
            stmt.setDate(7, Date.valueOf(ch.getChtfecemi()));
            stmt.setDate(8, Date.valueOf(ch.getChtfecpago()));
            stmt.setDate(9, Date.valueOf(ch.getChtfecrec()));
            stmt.setBigDecimal(10, ch.getChtimporte());
            stmt.setString(11, ch.getChtmoneda());
            stmt.setObject(12, ch.getChtcliid());
            stmt.setString(13, blankToNull(ch.getChtrefint()));
            stmt.setString(14, blankToNull(ch.getChtobserva()));
            stmt.setObject(15, ch.getChtusucrea());
            stmt.execute();
            try (ResultSet rs = stmt.getGeneratedKeys()) { rs.next(); ch.setChtid(rs.getLong("chtid")); }
            ch.setChtestado("CARTERA");
            return ResponseBuilder.ok(ch);
        } catch (SQLException e) {
            log.error("SQLException recibir cheque tercero: ", e);
            return ResponseBuilder.error("No se pudo registrar el cheque: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> depositar(ChequeAccion a) {
        if (a.getCbaid() == null || a.getCbaid() <= 0) {
            return ResponseBuilder.error("Debe indicar la cuenta de depósito.", HttpStatus.BAD_REQUEST);
        }
        if (a.getReferencia() == null || a.getReferencia().isBlank()) {
            return ResponseBuilder.error("La referencia del depósito (boleta) es obligatoria.", HttpStatus.BAD_REQUEST);
        }
        LocalDate fecha = a.getFecha() != null ? a.getFecha() : LocalDate.now();
        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            String numero, librador, estado; BigDecimal importe;
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT chtnumero, chtlibrador, chtimporte, chtestado FROM public.cheque_tercero WHERE chtid = ? FOR UPDATE")) {
                stmt.setLong(1, a.getId());
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) { rollback(conn); return ResponseBuilder.error("Cheque no encontrado.", HttpStatus.BAD_REQUEST); }
                    numero = rs.getString("chtnumero"); librador = rs.getString("chtlibrador");
                    importe = rs.getBigDecimal("chtimporte"); estado = rs.getString("chtestado");
                }
            }
            if (!"CARTERA".equals(estado)) {
                rollback(conn);
                return ResponseBuilder.error("Solo se puede depositar un cheque en CARTERA.", HttpStatus.BAD_REQUEST);
            }

            // Movimiento de depósito (tipo DCT, crédito). El trigger valida moneda y fecha de pago.
            MovimientoBancario mov = new MovimientoBancario();
            mov.setMbacbaid(a.getCbaid());
            mov.setMbatipo("DCT");
            mov.setMbafecha(fecha);
            mov.setMbaimporte(importe);
            mov.setMbaconcepto("Depósito cheque " + numero + " de " + librador);
            mov.setMbarefext(a.getReferencia());
            long mbadep = movimientoService.registrarInterno(conn, mov, "CHEQUE_TERCERO");

            try (PreparedStatement stmt = conn.prepareStatement("UPDATE public.cheque_tercero SET " +
                    "chtestado = 'DEPOSITADO', chtcbaid = ?, chtfecdep = ?, chtmbadep = ? WHERE chtid = ?;")) {
                stmt.setLong(1, a.getCbaid());
                stmt.setDate(2, Date.valueOf(fecha));
                stmt.setLong(3, mbadep);
                stmt.setLong(4, a.getId());
                stmt.executeUpdate();
            }
            conn.commit();
            return ResponseBuilder.ok("Cheque depositado; se registró el ingreso en el libro.");
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException depositar: ", e);
            return ResponseBuilder.error("No se pudo depositar el cheque: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> acreditar(ChequeAccion a) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.cheque_tercero SET " +
                     "chtestado = 'ACREDITADO' WHERE chtid = ? AND chtestado = 'DEPOSITADO';")) {
            stmt.setLong(1, a.getId());
            if (stmt.executeUpdate() == 0) return ResponseBuilder.error("El cheque debe estar DEPOSITADO.", HttpStatus.BAD_REQUEST);
            return ResponseBuilder.ok("Cheque acreditado.");
        } catch (SQLException e) {
            log.error("SQLException acreditar: ", e);
            return ResponseBuilder.error("No se pudo acreditar el cheque: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> endosar(ChequeAccion a) {
        if (a.getEndosado() == null || a.getEndosado().isBlank()) {
            return ResponseBuilder.error("Debe indicar a quién se endosa el cheque.", HttpStatus.BAD_REQUEST);
        }
        LocalDate fecha = a.getFecha() != null ? a.getFecha() : LocalDate.now();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.cheque_tercero SET " +
                     "chtestado = 'ENDOSADO', chtendosado = ?, chtfecendo = ? WHERE chtid = ? AND chtestado = 'CARTERA';")) {
            stmt.setString(1, a.getEndosado());
            stmt.setDate(2, Date.valueOf(fecha));
            stmt.setLong(3, a.getId());
            if (stmt.executeUpdate() == 0) return ResponseBuilder.error("Solo se puede endosar un cheque en CARTERA.", HttpStatus.BAD_REQUEST);
            return ResponseBuilder.ok("Cheque endosado.");
        } catch (SQLException e) {
            log.error("SQLException endosar: ", e);
            return ResponseBuilder.error("No se pudo endosar el cheque: " + e.getMessage(), HttpStatus.BAD_REQUEST);
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

            String numero, librador, estado; BigDecimal importe; Long cbaid;
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT chtnumero, chtlibrador, chtimporte, chtestado, chtcbaid FROM public.cheque_tercero WHERE chtid = ? FOR UPDATE")) {
                stmt.setLong(1, a.getId());
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) { rollback(conn); return ResponseBuilder.error("Cheque no encontrado.", HttpStatus.BAD_REQUEST); }
                    numero = rs.getString("chtnumero"); librador = rs.getString("chtlibrador");
                    importe = rs.getBigDecimal("chtimporte"); estado = rs.getString("chtestado");
                    cbaid = (Long) rs.getObject("chtcbaid");
                }
            }
            if (!"DEPOSITADO".equals(estado) && !"ACREDITADO".equals(estado)) {
                rollback(conn);
                return ResponseBuilder.error("Solo se puede rechazar un cheque DEPOSITADO o ACREDITADO.", HttpStatus.BAD_REQUEST);
            }
            if (cbaid == null) {
                rollback(conn);
                return ResponseBuilder.error("El cheque no tiene cuenta de depósito asociada.", HttpStatus.BAD_REQUEST);
            }

            // Reversión (tipo RCT, débito): descuenta lo previamente acreditado. Requiere contraparte.
            MovimientoBancario mov = new MovimientoBancario();
            mov.setMbacbaid(cbaid);
            mov.setMbatipo("RCT");
            mov.setMbafecha(fecha);
            mov.setMbaimporte(importe);
            mov.setMbaconcepto("Rechazo cheque " + numero + " de " + librador + " - " + a.getMotivo());
            mov.setMbacontrapar(librador);
            long mbarech = movimientoService.registrarInterno(conn, mov, "CHEQUE_TERCERO");

            try (PreparedStatement stmt = conn.prepareStatement("UPDATE public.cheque_tercero SET " +
                    "chtestado = 'RECHAZADO', chtmotivo = ?, chtmbarech = ? WHERE chtid = ?;")) {
                stmt.setString(1, a.getMotivo());
                stmt.setLong(2, mbarech);
                stmt.setLong(3, a.getId());
                stmt.executeUpdate();
            }
            conn.commit();
            return ResponseBuilder.ok("Cheque rechazado; se generó la reversión en el libro.");
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException rechazar tercero: ", e);
            return ResponseBuilder.error("No se pudo rechazar el cheque: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> devolver(ChequeAccion a) {
        if (a.getMotivo() == null || a.getMotivo().isBlank()) {
            return ResponseBuilder.error("El motivo de la devolución es obligatorio.", HttpStatus.BAD_REQUEST);
        }
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.cheque_tercero SET " +
                     "chtestado = 'DEVUELTO', chtmotivo = ? WHERE chtid = ? AND chtestado = 'CARTERA';")) {
            stmt.setString(1, a.getMotivo());
            stmt.setLong(2, a.getId());
            if (stmt.executeUpdate() == 0) return ResponseBuilder.error("Solo se puede devolver un cheque en CARTERA.", HttpStatus.BAD_REQUEST);
            return ResponseBuilder.ok("Cheque devuelto al cliente.");
        } catch (SQLException e) {
            log.error("SQLException devolver: ", e);
            return ResponseBuilder.error("No se pudo devolver el cheque: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /** Endoso en la transacción del llamador (medio de una orden de pago). Devuelve el importe. */
    @Override
    public java.math.BigDecimal endosarInterno(Connection conn, long chtid, String endosado, LocalDate fecha, Long opaid) throws SQLException {
        java.math.BigDecimal importe; String estado; String moneda;
        try (PreparedStatement stmt = conn.prepareStatement(
                "SELECT chtimporte, chtestado, chtmoneda FROM public.cheque_tercero WHERE chtid = ? FOR UPDATE")) {
            stmt.setLong(1, chtid);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) throw new SQLException("Cheque de tercero inexistente.");
                importe = rs.getBigDecimal("chtimporte"); estado = rs.getString("chtestado"); moneda = rs.getString("chtmoneda");
            }
        }
        if (!"CARTERA".equals(estado)) throw new SQLException("El cheque de tercero debe estar en CARTERA para endosarse.");
        try (PreparedStatement stmt = conn.prepareStatement("UPDATE public.cheque_tercero SET " +
                "chtestado = 'ENDOSADO', chtendosado = ?, chtfecendo = ?, chtopaid = ? WHERE chtid = ?;")) {
            stmt.setString(1, endosado);
            stmt.setDate(2, Date.valueOf(fecha != null ? fecha : LocalDate.now()));
            stmt.setObject(3, opaid);
            stmt.setLong(4, chtid);
            stmt.executeUpdate();
        }
        return importe;
    }

    // ---------- helpers ----------
    private static String blankToNull(String s) { return (s == null || s.isBlank()) ? null : s; }

    private ChequeTercero mapRow(ResultSet rs) throws SQLException {
        ChequeTercero t = new ChequeTercero();
        t.setChtid(rs.getLong("chtid"));
        t.setChtbanid(rs.getLong("chtbanid"));
        t.setChtnumero(rs.getString("chtnumero"));
        t.setChtcuenta(rs.getString("chtcuenta"));
        t.setChtlibrador(rs.getString("chtlibrador"));
        t.setChtlibruc(rs.getString("chtlibruc"));
        t.setChtdiferido(rs.getBoolean("chtdiferido"));
        t.setChtfecemi(toLocal(rs.getDate("chtfecemi")));
        t.setChtfecpago(toLocal(rs.getDate("chtfecpago")));
        t.setChtfecrec(toLocal(rs.getDate("chtfecrec")));
        t.setChtimporte(rs.getBigDecimal("chtimporte"));
        t.setChtmoneda(rs.getString("chtmoneda"));
        t.setChtcliid((Long) rs.getObject("chtcliid"));
        t.setChtestado(rs.getString("chtestado"));
        t.setChtcbaid((Long) rs.getObject("chtcbaid"));
        t.setChtfecdep(toLocal(rs.getDate("chtfecdep")));
        t.setChtendosado(rs.getString("chtendosado"));
        t.setChtfecendo(toLocal(rs.getDate("chtfecendo")));
        t.setChtopaid((Long) rs.getObject("chtopaid"));
        t.setChtmotivo(rs.getString("chtmotivo"));
        t.setChtmbadep((Long) rs.getObject("chtmbadep"));
        t.setChtmbarech((Long) rs.getObject("chtmbarech"));
        t.setChtrefint(rs.getString("chtrefint"));
        t.setChtobserva(rs.getString("chtobserva"));
        Timestamp created = rs.getTimestamp("chtcreated");
        t.setChtcreated(created != null ? created.toLocalDateTime() : null);
        t.setChtusucrea((Integer) rs.getObject("chtusucrea"));
        t.setBannombre(rs.getString("bannombre"));
        t.setClinombre(rs.getString("clinombre"));
        t.setCbaalias(rs.getString("cbaalias"));
        return t;
    }

    private static LocalDate toLocal(Date d) { return d != null ? d.toLocalDate() : null; }

    private void rollback(Connection conn) {
        if (conn != null) try { conn.rollback(); } catch (SQLException ex) { log.error("rollback: ", ex); }
    }
    private void close(Connection conn) {
        if (conn != null) try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ex) { log.error("close: ", ex); }
    }
}
