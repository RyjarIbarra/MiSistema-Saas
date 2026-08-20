package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.MovimientoBancario;
import com.MiSistema.ModelsDto.Banco.MovimientoFiltro;
import com.MiSistema.ModelsDto.Banco.SaldoCuentaDto;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.Services.MovimientoBancarioService;
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
public class MovimientoBancarioImpl implements MovimientoBancarioService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<MovimientoBancario>> list(MovimientoFiltro f) {
        List<MovimientoBancario> lista = new ArrayList<>();
        long totalRecords = 0;
        String texto = f.getTexto() != null ? f.getTexto() : "";

        String where = "WHERE m.mbacbaid = ? " +
                "AND (?::date IS NULL OR m.mbafecha >= ?::date) " +
                "AND (?::date IS NULL OR m.mbafecha <= ?::date) " +
                "AND (m.mbaconcepto ILIKE ? OR m.mbarefext ILIKE ? OR m.mbacontrapar ILIKE ?) ";

        String sql = "SELECT m.*, t.tmodescri, t.tmosigno " +
                "FROM public.movimiento_bancario m " +
                "INNER JOIN public.tipo_movimiento t ON t.tmocodigo = m.mbatipo " +
                where + "ORDER BY m.mbafecha DESC, m.mbanumero DESC LIMIT ? OFFSET ?";
        String countSql = "SELECT count(*) AS totalRecords FROM public.movimiento_bancario m " + where;

        Date desde = f.getFechaDesde() != null ? Date.valueOf(f.getFechaDesde()) : null;
        Date hasta = f.getFechaHasta() != null ? Date.valueOf(f.getFechaHasta()) : null;

        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql);
             PreparedStatement stmtCount = conn.prepareStatement(countSql)) {

            bindFiltro(stmt, f.getCbaid(), desde, hasta, texto);
            stmt.setLong(9, f.getLimit());
            stmt.setLong(10, f.getOffset());

            bindFiltro(stmtCount, f.getCbaid(), desde, hasta, texto);
            try (ResultSet rsC = stmtCount.executeQuery()) {
                rsC.next();
                totalRecords = rsC.getLong("totalRecords");
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) lista.add(mapRow(rs));
            }
            return ResponseBuilder.ok(lista, totalRecords);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    private void bindFiltro(PreparedStatement stmt, long cbaid, Date desde, Date hasta, String texto) throws SQLException {
        stmt.setLong(1, cbaid);
        if (desde != null) { stmt.setDate(2, desde); stmt.setDate(3, desde); }
        else { stmt.setNull(2, Types.DATE); stmt.setNull(3, Types.DATE); }
        if (hasta != null) { stmt.setDate(4, hasta); stmt.setDate(5, hasta); }
        else { stmt.setNull(4, Types.DATE); stmt.setNull(5, Types.DATE); }
        stmt.setString(6, "%" + texto + "%");
        stmt.setString(7, "%" + texto + "%");
        stmt.setString(8, "%" + texto + "%");
    }

    /** Registra un movimiento manual: reserva el correlativo y lo inserta en la misma transacción. */
    @Override
    public ResponseEntity<DefaultResponse<MovimientoBancario>> registrar(MovimientoBancario mov) {
        if (mov.getMbacbaid() <= 0 || mov.getMbatipo() == null || mov.getMbafecha() == null
                || mov.getMbaimporte() == null || mov.getMbaimporte().signum() <= 0
                || mov.getMbaconcepto() == null || mov.getMbaconcepto().isBlank()) {
            return ResponseBuilder.error("Datos incompletos: cuenta, tipo, fecha, importe (>0) y concepto son obligatorios.", HttpStatus.BAD_REQUEST);
        }

        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            int numero;
            try (PreparedStatement stmt = conn.prepareStatement("SELECT public.fn_movimiento_siguiente_numero(?)")) {
                stmt.setLong(1, mov.getMbacbaid());
                try (ResultSet rs = stmt.executeQuery()) {
                    rs.next();
                    numero = rs.getInt(1);
                }
            }
            mov.setMbanumero(numero);

            long id;
            try (PreparedStatement stmt = conn.prepareStatement(
                    "INSERT INTO public.movimiento_bancario(" +
                    "mbacbaid, mbatipo, mbanumero, mbafecha, mbaimporte, mbaconcepto, " +
                    "mbarefext, mbacontrapar, mbacontraruc, mbaorigen, mbaobserva, mbausucrea) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'MANUAL', ?, ?);",
                    PreparedStatement.RETURN_GENERATED_KEYS)) {
                stmt.setLong(1, mov.getMbacbaid());
                stmt.setString(2, mov.getMbatipo());
                stmt.setInt(3, numero);
                stmt.setDate(4, Date.valueOf(mov.getMbafecha()));
                stmt.setBigDecimal(5, mov.getMbaimporte());
                stmt.setString(6, mov.getMbaconcepto());
                stmt.setString(7, blankToNull(mov.getMbarefext()));
                stmt.setString(8, blankToNull(mov.getMbacontrapar()));
                stmt.setString(9, blankToNull(mov.getMbacontraruc()));
                stmt.setString(10, blankToNull(mov.getMbaobserva()));
                stmt.setObject(11, mov.getMbausucrea());
                stmt.execute();
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    rs.next();
                    id = rs.getLong("mbaid");
                }
            }
            conn.commit();
            mov.setMbaid(id);
            mov.setMbaorigen("MANUAL");
            mov.setMbaestado("VIGENTE");
            return ResponseBuilder.ok(mov);
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException registrando movimiento: ", e);
            return ResponseBuilder.error("Error al registrar el movimiento: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    /** Inserta un movimiento generado por otro dominio en la transacción del llamador. Devuelve el mbaid. */
    @Override
    public long registrarInterno(Connection conn, MovimientoBancario mov, String origen) throws SQLException {
        int numero;
        try (PreparedStatement stmt = conn.prepareStatement("SELECT public.fn_movimiento_siguiente_numero(?)")) {
            stmt.setLong(1, mov.getMbacbaid());
            try (ResultSet rs = stmt.executeQuery()) {
                rs.next();
                numero = rs.getInt(1);
            }
        }
        mov.setMbanumero(numero);

        try (PreparedStatement stmt = conn.prepareStatement(
                "INSERT INTO public.movimiento_bancario(" +
                "mbacbaid, mbatipo, mbanumero, mbafecha, mbaimporte, mbaconcepto, " +
                "mbarefext, mbacontrapar, mbacontraruc, mbaorigen, mbaobserva, mbausucrea) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
                PreparedStatement.RETURN_GENERATED_KEYS)) {
            stmt.setLong(1, mov.getMbacbaid());
            stmt.setString(2, mov.getMbatipo());
            stmt.setInt(3, numero);
            stmt.setDate(4, Date.valueOf(mov.getMbafecha()));
            stmt.setBigDecimal(5, mov.getMbaimporte());
            stmt.setString(6, mov.getMbaconcepto());
            stmt.setString(7, blankToNull(mov.getMbarefext()));
            stmt.setString(8, blankToNull(mov.getMbacontrapar()));
            stmt.setString(9, blankToNull(mov.getMbacontraruc()));
            stmt.setString(10, origen);
            stmt.setString(11, blankToNull(mov.getMbaobserva()));
            stmt.setObject(12, mov.getMbausucrea());
            stmt.execute();
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                return rs.getLong("mbaid");
            }
        }
    }

    /** Anula un movimiento dentro de la transacción del llamador. */
    @Override
    public void anularInterno(Connection conn, long mbaid, String motivo, Integer usuAnul) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement("UPDATE public.movimiento_bancario SET " +
                "mbaestado = 'ANULADO', mbamotanul = ?, mbafecanul = NOW(), mbausuanul = ? " +
                "WHERE mbaid = ? AND mbaestado = 'VIGENTE';")) {
            stmt.setString(1, motivo);
            stmt.setObject(2, usuAnul);
            stmt.setLong(3, mbaid);
            stmt.executeUpdate();
        }
    }

    /**
     * Anula un movimiento vigente. El trigger propaga la anulación a la contrapartida del traspaso.
     * Solo se permiten movimientos de origen MANUAL o TRASPASO: los generados por instrumentos
     * (cheques, órdenes de pago) se gestionan desde su propio módulo, que mantiene ambas tablas
     * consistentes. Anular acá la línea de un cheque dejaría el cheque desincronizado.
     */
    @Override
    public ResponseEntity<DefaultResponse<String>> anular(long id, String motivo) {
        if (motivo == null || motivo.isBlank()) {
            return ResponseBuilder.error("El motivo de anulación es obligatorio.", HttpStatus.BAD_REQUEST);
        }
        try (Connection conn = dsManager.getDataSource()) {
            String origen, estado;
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT mbaorigen, mbaestado FROM public.movimiento_bancario WHERE mbaid = ?")) {
                stmt.setLong(1, id);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) return ResponseBuilder.error("Movimiento no encontrado.", HttpStatus.BAD_REQUEST);
                    origen = rs.getString("mbaorigen");
                    estado = rs.getString("mbaestado");
                }
            }
            if (!"VIGENTE".equals(estado)) {
                return ResponseBuilder.error("El movimiento ya está anulado.", HttpStatus.BAD_REQUEST);
            }
            if (!"MANUAL".equals(origen) && !"TRASPASO".equals(origen)) {
                return ResponseBuilder.error("Este movimiento proviene de " + origenLegible(origen) +
                        " y no puede anularse desde el libro. Gestionalo desde su módulo.", HttpStatus.BAD_REQUEST);
            }
            try (PreparedStatement stmt = conn.prepareStatement("UPDATE public.movimiento_bancario SET " +
                    "mbaestado = 'ANULADO', mbamotanul = ?, mbafecanul = NOW() " +
                    "WHERE mbaid = ? AND mbaestado = 'VIGENTE';")) {
                stmt.setString(1, motivo);
                stmt.setLong(2, id);
                if (stmt.executeUpdate() == 0) {
                    return ResponseBuilder.error("Movimiento no encontrado o ya anulado.", HttpStatus.BAD_REQUEST);
                }
            }
            return ResponseBuilder.ok("Movimiento anulado correctamente.");
        } catch (SQLException e) {
            log.error("SQLException anulando movimiento: ", e);
            throw new RuntimeException(e);
        }
    }

    private static String origenLegible(String origen) {
        if (origen == null) return "otro módulo";
        switch (origen) {
            case "CHEQUE_PROPIO":  return "un cheque propio";
            case "CHEQUE_TERCERO": return "un cheque de tercero";
            case "ORDEN_PAGO":     return "una orden de pago";
            case "COBRANZA":       return "una cobranza";
            case "PAGO":           return "un pago";
            case "IMPORTADO":      return "una importación de extracto";
            default:                return "otro módulo";
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<SaldoCuentaDto>> saldo(long cbaid) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.v_saldo_cuenta WHERE cbaid = ?")) {
            stmt.setLong(1, cbaid);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    SaldoCuentaDto s = new SaldoCuentaDto();
                    s.setCbaid(rs.getLong("cbaid"));
                    s.setCbaalias(rs.getString("cbaalias"));
                    s.setBannombre(rs.getString("bannombre"));
                    s.setCbanumero(rs.getString("cbanumero"));
                    s.setCbamoneda(rs.getString("cbamoneda"));
                    s.setCbasaldoini(rs.getBigDecimal("cbasaldoini"));
                    s.setMovimientos(rs.getBigDecimal("movimientos"));
                    s.setSaldo(rs.getBigDecimal("saldo"));
                    s.setCbasobregiro(rs.getBigDecimal("cbasobregiro"));
                    Date um = rs.getDate("ultimo_movimiento");
                    s.setUltimoMovimiento(um != null ? um.toLocalDate() : null);
                    return ResponseBuilder.ok(s);
                }
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Cuenta no encontrada.");
    }

    // ---------- helpers ----------
    private static String blankToNull(String s) { return (s == null || s.isBlank()) ? null : s; }

    private MovimientoBancario mapRow(ResultSet rs) throws SQLException {
        MovimientoBancario m = new MovimientoBancario();
        m.setMbaid(rs.getLong("mbaid"));
        m.setMbacbaid(rs.getLong("mbacbaid"));
        m.setMbatipo(rs.getString("mbatipo"));
        m.setMbanumero(rs.getInt("mbanumero"));
        Date fecha = rs.getDate("mbafecha");
        m.setMbafecha(fecha != null ? fecha.toLocalDate() : null);
        m.setMbaimporte(rs.getBigDecimal("mbaimporte"));
        m.setMbaconcepto(rs.getString("mbaconcepto"));
        m.setMbarefext(rs.getString("mbarefext"));
        m.setMbacontrapar(rs.getString("mbacontrapar"));
        m.setMbacontraruc(rs.getString("mbacontraruc"));
        m.setMbaorigen(rs.getString("mbaorigen"));
        m.setMbaestado(rs.getString("mbaestado"));
        m.setMbamotanul(rs.getString("mbamotanul"));
        Timestamp fecanul = rs.getTimestamp("mbafecanul");
        m.setMbafecanul(fecanul != null ? fecanul.toLocalDateTime() : null);
        m.setMbaobserva(rs.getString("mbaobserva"));
        m.setMbausucrea((Integer) rs.getObject("mbausucrea"));
        m.setTmodescri(rs.getString("tmodescri"));
        m.setTmosigno(rs.getInt("tmosigno"));
        return m;
    }

    private void rollback(Connection conn) {
        if (conn != null) try { conn.rollback(); } catch (SQLException ex) { log.error("rollback: ", ex); }
    }
    private void close(Connection conn) {
        if (conn != null) try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ex) { log.error("close: ", ex); }
    }
}
