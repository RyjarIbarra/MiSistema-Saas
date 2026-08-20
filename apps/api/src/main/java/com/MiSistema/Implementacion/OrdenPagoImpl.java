package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.OrdenPago;
import com.MiSistema.Modelos.OrdenPagoImputacion;
import com.MiSistema.Modelos.OrdenPagoMedio;
import com.MiSistema.Modelos.OrdenPagoRetencion;
import com.MiSistema.ModelsDto.Banco.ChequeFiltro;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.Services.ChequeTerceroService;
import com.MiSistema.Services.OrdenPagoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrdenPagoImpl implements OrdenPagoService {

    private final DataSourceManager dsManager;
    private final ChequeTerceroService chequeTerceroService;   // para el endoso de cheques de tercero

    @Override
    public ResponseEntity<DefaultResponse<OrdenPago>> list(ChequeFiltro f) {
        List<OrdenPago> lista = new ArrayList<>();
        long total = 0;
        String texto = f.getTexto() != null ? f.getTexto() : "";
        String estado = f.getEstado() != null ? f.getEstado() : "";
        String where = "WHERE (? = '' OR o.opaestado = ?) " +
                "AND (o.opanumero::text ILIKE ? OR o.opaprvrazon ILIKE ? OR o.opaconcepto ILIKE ?) ";
        String sql = "SELECT o.* FROM public.orden_pago o " + where + "ORDER BY o.opaejercicio DESC, o.opanumero DESC LIMIT ? OFFSET ?";
        String countSql = "SELECT count(*) AS c FROM public.orden_pago o " + where;
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql);
             PreparedStatement cst = conn.prepareStatement(countSql)) {
            bindList(stmt, estado, texto); stmt.setLong(6, f.getLimit()); stmt.setLong(7, f.getOffset());
            bindList(cst, estado, texto);
            try (ResultSet rs = cst.executeQuery()) { rs.next(); total = rs.getLong("c"); }
            try (ResultSet rs = stmt.executeQuery()) { while (rs.next()) lista.add(mapOrden(rs)); }
            return ResponseBuilder.ok(lista, total);
        } catch (SQLException e) {
            log.error("SQLException list orden_pago: ", e);
            throw new RuntimeException(e);
        }
    }

    private void bindList(PreparedStatement stmt, String estado, String texto) throws SQLException {
        stmt.setString(1, estado); stmt.setString(2, estado);
        stmt.setString(3, "%" + texto + "%"); stmt.setString(4, "%" + texto + "%"); stmt.setString(5, "%" + texto + "%");
    }

    @Override
    public ResponseEntity<DefaultResponse<OrdenPago>> getById(long id) {
        try (Connection conn = dsManager.getDataSource()) {
            OrdenPago o = cargarOrden(conn, id);
            if (o == null) return ResponseBuilder.error("Orden de pago no encontrada.");
            return ResponseBuilder.ok(o);
        } catch (SQLException e) {
            log.error("SQLException getById orden_pago: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<OrdenPago>> crear(OrdenPago o) {
        String err = validarCabecera(o);
        if (err != null) return ResponseBuilder.error(err, HttpStatus.BAD_REQUEST);
        if (o.getImputaciones() == null || o.getImputaciones().isEmpty())
            return ResponseBuilder.error("La orden debe imputar al menos un comprobante.", HttpStatus.BAD_REQUEST);

        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            int ejercicio = o.getOpafecha().getYear();
            int numero;
            try (PreparedStatement stmt = conn.prepareStatement("SELECT public.fn_orden_pago_siguiente_numero(?::smallint)")) {
                stmt.setInt(1, ejercicio);
                try (ResultSet rs = stmt.executeQuery()) { rs.next(); numero = rs.getInt(1); }
            }
            completarSnapshotProveedor(conn, o);
            BigDecimal tc = (o.getOpatipcambio() != null && o.getOpatipcambio().signum() > 0) ? o.getOpatipcambio() : BigDecimal.ONE;
            if ("PYG".equals(o.getOpamoneda())) tc = BigDecimal.ONE;

            long opaid;
            try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.orden_pago(" +
                    "opanumero, opaejercicio, opafecha, opaprvid, opaprvrazon, opaprvruc, opaprvdv, opasucid, " +
                    "opamoneda, opatipcambio, opaconcepto, opaobserva, opausucrea) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS)) {
                stmt.setInt(1, numero);
                stmt.setInt(2, ejercicio);
                stmt.setDate(3, Date.valueOf(o.getOpafecha()));
                stmt.setLong(4, o.getOpaprvid());
                stmt.setString(5, o.getOpaprvrazon());
                stmt.setString(6, blankToNull(o.getOpaprvruc()));
                stmt.setObject(7, o.getOpaprvdv());
                stmt.setString(8, blankToNull(o.getOpasucid()));
                stmt.setString(9, o.getOpamoneda());
                stmt.setBigDecimal(10, tc);
                stmt.setString(11, o.getOpaconcepto());
                stmt.setString(12, blankToNull(o.getOpaobserva()));
                stmt.setObject(13, o.getOpausucrea());
                stmt.execute();
                try (ResultSet rs = stmt.getGeneratedKeys()) { rs.next(); opaid = rs.getLong("opaid"); }
            }

            insertarDetalle(conn, opaid, o, tc);
            conn.commit();
            OrdenPago full = cargarOrden(conn, opaid);
            return ResponseBuilder.ok(full);
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException crear orden_pago: ", e);
            return ResponseBuilder.error("No se pudo crear la orden: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<OrdenPago>> actualizar(OrdenPago o) {
        if (o.getOpaid() <= 0) return ResponseBuilder.error("Orden no indicada.", HttpStatus.BAD_REQUEST);
        if (o.getImputaciones() == null || o.getImputaciones().isEmpty())
            return ResponseBuilder.error("La orden debe imputar al menos un comprobante.", HttpStatus.BAD_REQUEST);
        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);
            String estado; BigDecimal tc;
            try (PreparedStatement stmt = conn.prepareStatement("SELECT opaestado, opatipcambio FROM public.orden_pago WHERE opaid = ? FOR UPDATE")) {
                stmt.setLong(1, o.getOpaid());
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) { rollback(conn); return ResponseBuilder.error("Orden no encontrada.", HttpStatus.BAD_REQUEST); }
                    estado = rs.getString("opaestado"); tc = rs.getBigDecimal("opatipcambio");
                }
            }
            if (!"BORRADOR".equals(estado)) { rollback(conn); return ResponseBuilder.error("Solo se puede editar una orden en BORRADOR.", HttpStatus.BAD_REQUEST); }

            try (PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.orden_pago_imputacion WHERE opiopaid = ?")) { stmt.setLong(1, o.getOpaid()); stmt.executeUpdate(); }
            try (PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.orden_pago_retencion WHERE opropaid = ?")) { stmt.setLong(1, o.getOpaid()); stmt.executeUpdate(); }
            // Concepto/observaciones editables
            try (PreparedStatement stmt = conn.prepareStatement("UPDATE public.orden_pago SET opaconcepto = ?, opaobserva = ? WHERE opaid = ?")) {
                stmt.setString(1, o.getOpaconcepto()); stmt.setString(2, blankToNull(o.getOpaobserva())); stmt.setLong(3, o.getOpaid()); stmt.executeUpdate();
            }
            insertarDetalle(conn, o.getOpaid(), o, tc != null ? tc : BigDecimal.ONE);
            conn.commit();
            return ResponseBuilder.ok(cargarOrden(conn, o.getOpaid()));
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException actualizar orden_pago: ", e);
            return ResponseBuilder.error("No se pudo actualizar la orden: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> aprobar(long id, Integer usu) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.orden_pago SET " +
                     "opaestado = 'APROBADA', opafecaprob = NOW(), opausuaprob = ? " +
                     "WHERE opaid = ? AND opaestado = 'BORRADOR' AND opatotneto > 0;")) {
            stmt.setObject(1, usu);
            stmt.setLong(2, id);
            if (stmt.executeUpdate() == 0) return ResponseBuilder.error("Solo se aprueba una orden en BORRADOR con neto mayor a cero.", HttpStatus.BAD_REQUEST);
            return ResponseBuilder.ok("Orden aprobada.");
        } catch (SQLException e) {
            log.error("SQLException aprobar: ", e);
            return ResponseBuilder.error("No se pudo aprobar: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> anular(long id, String motivo, Integer usu) {
        if (motivo == null || motivo.isBlank()) return ResponseBuilder.error("El motivo de anulación es obligatorio.", HttpStatus.BAD_REQUEST);
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.orden_pago SET " +
                     "opaestado = 'ANULADA', opamotanul = ?, opafecanul = NOW(), opausuanul = ? " +
                     "WHERE opaid = ? AND opaestado <> 'PAGADA' AND opaestado <> 'ANULADA';")) {
            stmt.setString(1, motivo);
            stmt.setObject(2, usu);
            stmt.setLong(3, id);
            if (stmt.executeUpdate() == 0) return ResponseBuilder.error("No se puede anular (ya pagada, ya anulada o inexistente).", HttpStatus.BAD_REQUEST);
            return ResponseBuilder.ok("Orden anulada.");
        } catch (SQLException e) {
            log.error("SQLException anular orden: ", e);
            return ResponseBuilder.error("No se pudo anular: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> eliminar(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.orden_pago WHERE opaid = ? AND opaestado = 'BORRADOR';")) {
            stmt.setLong(1, id);
            if (stmt.executeUpdate() == 0) return ResponseBuilder.error("Solo se elimina una orden en BORRADOR.", HttpStatus.BAD_REQUEST);
            return ResponseBuilder.ok("Orden eliminada.");
        } catch (SQLException e) {
            log.error("SQLException eliminar orden: ", e);
            return ResponseBuilder.error("No se pudo eliminar: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ---------------- medios ----------------
    @Override
    public ResponseEntity<DefaultResponse<OrdenPagoMedio>> agregarMedio(OrdenPagoMedio m) {
        if (m.getOpmopaid() <= 0 || m.getOpmforma() == null) return ResponseBuilder.error("Datos del medio incompletos.", HttpStatus.BAD_REQUEST);
        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            String estado, razon;
            try (PreparedStatement stmt = conn.prepareStatement("SELECT opaestado, opaprvrazon FROM public.orden_pago WHERE opaid = ? FOR UPDATE")) {
                stmt.setLong(1, m.getOpmopaid());
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) { rollback(conn); return ResponseBuilder.error("Orden no encontrada.", HttpStatus.BAD_REQUEST); }
                    estado = rs.getString("opaestado"); razon = rs.getString("opaprvrazon");
                }
            }
            if (!"APROBADA".equals(estado)) { rollback(conn); return ResponseBuilder.error("Los medios se registran sobre una orden APROBADA.", HttpStatus.BAD_REQUEST); }

            // Endoso de cheque de tercero: cambia el cheque a ENDOSADO y fija el importe del medio.
            if ("CHEQUE_TER".equals(m.getOpmforma())) {
                if (m.getOpmchtid() == null) { rollback(conn); return ResponseBuilder.error("Indicá el cheque de tercero a endosar.", HttpStatus.BAD_REQUEST); }
                BigDecimal imp = chequeTerceroService.endosarInterno(conn, m.getOpmchtid(), razon, LocalDate.now(), m.getOpmopaid());
                m.setOpmimporte(imp);
            }
            if (m.getOpmimporte() == null || m.getOpmimporte().signum() <= 0) { rollback(conn); return ResponseBuilder.error("El importe del medio debe ser mayor a cero.", HttpStatus.BAD_REQUEST); }

            int orden;
            try (PreparedStatement stmt = conn.prepareStatement("SELECT COALESCE(MAX(opmorden),0)+1 FROM public.orden_pago_medio WHERE opmopaid = ?")) {
                stmt.setLong(1, m.getOpmopaid());
                try (ResultSet rs = stmt.executeQuery()) { rs.next(); orden = rs.getInt(1); }
            }
            long opmid;
            try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.orden_pago_medio(" +
                    "opmopaid, opmorden, opmforma, opmimporte, opmchpid, opmchtid, opmmbaid, opmrefext, opmobserva) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS)) {
                stmt.setLong(1, m.getOpmopaid());
                stmt.setInt(2, orden);
                stmt.setString(3, m.getOpmforma());
                stmt.setBigDecimal(4, m.getOpmimporte());
                stmt.setObject(5, m.getOpmchpid());
                stmt.setObject(6, m.getOpmchtid());
                stmt.setObject(7, m.getOpmmbaid());
                stmt.setString(8, blankToNull(m.getOpmrefext()));
                stmt.setString(9, blankToNull(m.getOpmobserva()));
                stmt.execute();
                try (ResultSet rs = stmt.getGeneratedKeys()) { rs.next(); opmid = rs.getLong("opmid"); }
            }
            conn.commit();
            m.setOpmid(opmid); m.setOpmorden(orden);
            return ResponseBuilder.ok(m);
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException agregar medio: ", e);
            return ResponseBuilder.error("No se pudo agregar el medio: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> quitarMedio(long opmid) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(
                     "DELETE FROM public.orden_pago_medio m USING public.orden_pago o " +
                     "WHERE m.opmid = ? AND o.opaid = m.opmopaid AND o.opaestado = 'APROBADA';")) {
            stmt.setLong(1, opmid);
            if (stmt.executeUpdate() == 0) return ResponseBuilder.error("Solo se quitan medios de una orden APROBADA (aún no pagada).", HttpStatus.BAD_REQUEST);
            return ResponseBuilder.ok("Medio eliminado.");
        } catch (SQLException e) {
            log.error("SQLException quitar medio: ", e);
            return ResponseBuilder.error("No se pudo quitar el medio: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> pagar(long id, LocalDate fecha, Integer usu) {
        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);
            BigDecimal neto, medios; String estado;
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT opaestado, opatotneto, COALESCE((SELECT SUM(opmimporte) FROM public.orden_pago_medio WHERE opmopaid = ?),0) AS medios " +
                    "FROM public.orden_pago WHERE opaid = ? FOR UPDATE")) {
                stmt.setLong(1, id); stmt.setLong(2, id);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) { rollback(conn); return ResponseBuilder.error("Orden no encontrada.", HttpStatus.BAD_REQUEST); }
                    estado = rs.getString("opaestado"); neto = rs.getBigDecimal("opatotneto"); medios = rs.getBigDecimal("medios");
                }
            }
            if (!"APROBADA".equals(estado)) { rollback(conn); return ResponseBuilder.error("Solo se paga una orden APROBADA.", HttpStatus.BAD_REQUEST); }
            if (neto.compareTo(medios) != 0)
                { rollback(conn); return ResponseBuilder.error("Los medios de pago suman " + medios + " y el neto es " + neto + ".", HttpStatus.BAD_REQUEST); }

            try (PreparedStatement stmt = conn.prepareStatement("UPDATE public.orden_pago SET " +
                    "opaestado = 'PAGADA', opafecpago = ?, opausuaprob = COALESCE(opausuaprob, ?) WHERE opaid = ?;")) {
                stmt.setDate(1, Date.valueOf(fecha != null ? fecha : LocalDate.now()));
                stmt.setObject(2, usu);
                stmt.setLong(3, id);
                stmt.executeUpdate();
            }
            conn.commit();   // el constraint trigger diferido verifica el cuadre acá
            return ResponseBuilder.ok("Orden pagada.");
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException pagar orden: ", e);
            return ResponseBuilder.error("No se pudo pagar la orden: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    // ---------------- helpers ----------------
    private String validarCabecera(OrdenPago o) {
        if (o.getOpaprvid() <= 0 || o.getOpafecha() == null || o.getOpamoneda() == null || o.getOpamoneda().isBlank()
                || o.getOpaconcepto() == null || o.getOpaconcepto().isBlank())
            return "Proveedor, fecha, moneda y concepto son obligatorios.";
        return null;
    }

    private void completarSnapshotProveedor(Connection conn, OrdenPago o) throws SQLException {
        if (o.getOpaprvrazon() != null && !o.getOpaprvrazon().isBlank()) return;
        try (PreparedStatement stmt = conn.prepareStatement("SELECT prvrazon, prvruc FROM public.proveedor WHERE prvid = ?")) {
            stmt.setLong(1, o.getOpaprvid());
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) { o.setOpaprvrazon(rs.getString("prvrazon")); if (o.getOpaprvruc() == null) o.setOpaprvruc(rs.getString("prvruc")); }
                else throw new SQLException("Proveedor inexistente.");
            }
        }
    }

    private void insertarDetalle(Connection conn, long opaid, OrdenPago o, BigDecimal tc) throws SQLException {
        int orden = 1;
        try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.orden_pago_imputacion(" +
                "opiopaid, opiorden, opitipdoc, opitimbrado, opiestab, opipunexp, opinumero, opifecemi, opifecvto, " +
                "opitotdoc, opiimporte, opiacuenta, opiobserva) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);")) {
            for (OrdenPagoImputacion i : o.getImputaciones()) {
                stmt.setLong(1, opaid);
                stmt.setInt(2, orden++);
                stmt.setString(3, i.getOpitipdoc() != null ? i.getOpitipdoc() : "FAC");
                stmt.setString(4, blankToNull(i.getOpitimbrado()));
                stmt.setString(5, blankToNull(i.getOpiestab()));
                stmt.setString(6, blankToNull(i.getOpipunexp()));
                stmt.setObject(7, i.getOpinumero());
                stmt.setDate(8, i.getOpifecemi() != null ? Date.valueOf(i.getOpifecemi()) : null);
                stmt.setDate(9, i.getOpifecvto() != null ? Date.valueOf(i.getOpifecvto()) : null);
                stmt.setBigDecimal(10, i.getOpitotdoc());
                stmt.setBigDecimal(11, i.getOpiimporte());
                stmt.setBoolean(12, i.isOpiacuenta());
                stmt.setString(13, blankToNull(i.getOpiobserva()));
                stmt.addBatch();
            }
            stmt.executeBatch();
        }
        if (o.getRetenciones() != null) {
            try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.orden_pago_retencion(" +
                    "opropaid, oprtipo, oprconcepto, oprbase, oprtasa, oprmonto, oprmlmonto, oprperiodo) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?);")) {
                for (OrdenPagoRetencion r : o.getRetenciones()) {
                    BigDecimal ml = r.getOprmonto() != null ? r.getOprmonto().multiply(tc).setScale(0, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                    stmt.setLong(1, opaid);
                    stmt.setString(2, r.getOprtipo());
                    stmt.setString(3, r.getOprconcepto());
                    stmt.setBigDecimal(4, r.getOprbase());
                    stmt.setBigDecimal(5, r.getOprtasa());
                    stmt.setBigDecimal(6, r.getOprmonto());
                    stmt.setBigDecimal(7, ml);
                    stmt.setString(8, blankToNull(r.getOprperiodo()));
                    stmt.addBatch();
                }
                stmt.executeBatch();
            }
        }
    }

    private OrdenPago cargarOrden(Connection conn, long id) throws SQLException {
        OrdenPago o;
        try (PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.orden_pago WHERE opaid = ?")) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) { if (!rs.next()) return null; o = mapOrden(rs); }
        }
        o.setImputaciones(new ArrayList<>());
        try (PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.orden_pago_imputacion WHERE opiopaid = ? ORDER BY opiorden")) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) { while (rs.next()) o.getImputaciones().add(mapImput(rs)); }
        }
        o.setRetenciones(new ArrayList<>());
        try (PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.orden_pago_retencion WHERE opropaid = ? ORDER BY oprid")) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) { while (rs.next()) o.getRetenciones().add(mapReten(rs)); }
        }
        o.setMedios(new ArrayList<>());
        try (PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.orden_pago_medio WHERE opmopaid = ? ORDER BY opmorden")) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) { while (rs.next()) o.getMedios().add(mapMedio(rs)); }
        }
        return o;
    }

    private static String blankToNull(String s) { return (s == null || s.isBlank()) ? null : s; }
    private static LocalDate toLocal(Date d) { return d != null ? d.toLocalDate() : null; }

    private OrdenPago mapOrden(ResultSet rs) throws SQLException {
        OrdenPago o = new OrdenPago();
        o.setOpaid(rs.getLong("opaid"));
        o.setOpanumero(rs.getInt("opanumero"));
        o.setOpaejercicio(rs.getInt("opaejercicio"));
        o.setOpafecha(toLocal(rs.getDate("opafecha")));
        o.setOpaprvid(rs.getLong("opaprvid"));
        o.setOpaprvrazon(rs.getString("opaprvrazon"));
        o.setOpaprvruc(rs.getString("opaprvruc"));
        o.setOpaprvdv((Integer) rs.getObject("opaprvdv"));
        o.setOpasucid(rs.getString("opasucid"));
        o.setOpamoneda(rs.getString("opamoneda"));
        o.setOpatipcambio(rs.getBigDecimal("opatipcambio"));
        o.setOpatotimput(rs.getBigDecimal("opatotimput"));
        o.setOpatotreten(rs.getBigDecimal("opatotreten"));
        o.setOpatotneto(rs.getBigDecimal("opatotneto"));
        o.setOpamltotneto(rs.getBigDecimal("opamltotneto"));
        o.setOpaconcepto(rs.getString("opaconcepto"));
        o.setOpaestado(rs.getString("opaestado"));
        Timestamp fa = rs.getTimestamp("opafecaprob"); o.setOpafecaprob(fa != null ? fa.toLocalDateTime() : null);
        o.setOpausuaprob((Integer) rs.getObject("opausuaprob"));
        o.setOpafecpago(toLocal(rs.getDate("opafecpago")));
        o.setOpamotanul(rs.getString("opamotanul"));
        Timestamp fn = rs.getTimestamp("opafecanul"); o.setOpafecanul(fn != null ? fn.toLocalDateTime() : null);
        o.setOpausuanul((Integer) rs.getObject("opausuanul"));
        o.setOpaobserva(rs.getString("opaobserva"));
        Timestamp c = rs.getTimestamp("opacreated"); o.setOpacreated(c != null ? c.toLocalDateTime() : null);
        o.setOpausucrea((Integer) rs.getObject("opausucrea"));
        return o;
    }

    private OrdenPagoImputacion mapImput(ResultSet rs) throws SQLException {
        OrdenPagoImputacion i = new OrdenPagoImputacion();
        i.setOpiid(rs.getLong("opiid")); i.setOpiopaid(rs.getLong("opiopaid")); i.setOpiorden(rs.getInt("opiorden"));
        i.setOpidocid((Long) rs.getObject("opidocid")); i.setOpitipdoc(rs.getString("opitipdoc"));
        i.setOpitimbrado(rs.getString("opitimbrado")); i.setOpiestab(rs.getString("opiestab")); i.setOpipunexp(rs.getString("opipunexp"));
        i.setOpinumero((Integer) rs.getObject("opinumero"));
        i.setOpifecemi(toLocal(rs.getDate("opifecemi"))); i.setOpifecvto(toLocal(rs.getDate("opifecvto")));
        i.setOpitotdoc(rs.getBigDecimal("opitotdoc")); i.setOpiimporte(rs.getBigDecimal("opiimporte"));
        i.setOpiacuenta(rs.getBoolean("opiacuenta")); i.setOpiobserva(rs.getString("opiobserva"));
        return i;
    }

    private OrdenPagoRetencion mapReten(ResultSet rs) throws SQLException {
        OrdenPagoRetencion r = new OrdenPagoRetencion();
        r.setOprid(rs.getLong("oprid")); r.setOpropaid(rs.getLong("opropaid")); r.setOprtipo(rs.getString("oprtipo"));
        r.setOprconcepto(rs.getString("oprconcepto")); r.setOprbase(rs.getBigDecimal("oprbase"));
        r.setOprtasa(rs.getBigDecimal("oprtasa")); r.setOprmonto(rs.getBigDecimal("oprmonto"));
        r.setOprmlmonto(rs.getBigDecimal("oprmlmonto")); r.setOprdocid((Long) rs.getObject("oprdocid")); r.setOprperiodo(rs.getString("oprperiodo"));
        return r;
    }

    private OrdenPagoMedio mapMedio(ResultSet rs) throws SQLException {
        OrdenPagoMedio m = new OrdenPagoMedio();
        m.setOpmid(rs.getLong("opmid")); m.setOpmopaid(rs.getLong("opmopaid")); m.setOpmorden(rs.getInt("opmorden"));
        m.setOpmforma(rs.getString("opmforma")); m.setOpmimporte(rs.getBigDecimal("opmimporte"));
        m.setOpmchpid((Long) rs.getObject("opmchpid")); m.setOpmchtid((Long) rs.getObject("opmchtid")); m.setOpmmbaid((Long) rs.getObject("opmmbaid"));
        m.setOpmcajaid((Long) rs.getObject("opmcajaid")); m.setOpmrefext(rs.getString("opmrefext")); m.setOpmobserva(rs.getString("opmobserva"));
        return m;
    }

    private void rollback(Connection conn) { if (conn != null) try { conn.rollback(); } catch (SQLException ex) { log.error("rollback: ", ex); } }
    private void close(Connection conn) { if (conn != null) try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ex) { log.error("close: ", ex); } }
}
