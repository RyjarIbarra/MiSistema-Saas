package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.ConciliacionVinculo;
import com.MiSistema.ModelsDto.Banco.ConciliacionReporte;
import com.MiSistema.ModelsDto.Banco.MovimientoConciliar;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.Services.ConciliacionService;
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
public class ConciliacionImpl implements ConciliacionService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<ConciliacionReporte>> reporte(long extid) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.v_conciliacion WHERE extid = ?")) {
            stmt.setLong(1, extid);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    ConciliacionReporte r = new ConciliacionReporte();
                    r.setExtid(rs.getLong("extid"));
                    r.setExtcbaid(rs.getLong("extcbaid"));
                    r.setCbaalias(rs.getString("cbaalias"));
                    r.setExtfecini(toLocal(rs.getDate("extfecini")));
                    r.setExtfecfin(toLocal(rs.getDate("extfecfin")));
                    r.setExtestado(rs.getString("extestado"));
                    r.setExtsaldoini(rs.getBigDecimal("extsaldoini"));
                    r.setSaldoBanco(rs.getBigDecimal("saldo_banco"));
                    r.setSumaPartidas(rs.getBigDecimal("suma_partidas"));
                    r.setErrorCarga(rs.getBigDecimal("error_carga"));
                    r.setPartidasTotal(rs.getLong("partidas_total"));
                    r.setPartidasConc(rs.getLong("partidas_conc"));
                    r.setPartidasAbiertas(rs.getLong("partidas_abiertas"));
                    r.setMovimAbiertos(rs.getLong("movim_abiertos"));
                    r.setMovimNoEnBanco(rs.getBigDecimal("movim_no_en_banco"));
                    r.setPartidasNoEnLibro(rs.getBigDecimal("partidas_no_en_libro"));
                    r.setCompleta(rs.getBoolean("completa"));
                    return ResponseBuilder.ok(r);
                }
            }
        } catch (SQLException e) {
            log.error("SQLException reporte: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Extracto no encontrado.");
    }

    @Override
    public ResponseEntity<DefaultResponse<MovimientoConciliar>> movimientosPeriodo(long extid) {
        List<MovimientoConciliar> lista = new ArrayList<>();
        String sql = "SELECT m.mbaid, m.mbanumero, m.mbafecha, m.mbatipo, t.tmodescri, t.tmosigno, " +
                "m.mbaconcepto, m.mbarefext, m.mbaorigen, m.mbaimporte, COALESCE(v.imp,0) AS imputado " +
                "FROM public.movimiento_bancario m " +
                "JOIN public.tipo_movimiento t ON t.tmocodigo = m.mbatipo " +
                "LEFT JOIN (SELECT covmbaid, SUM(covimporte) imp FROM public.conciliacion_vinculo GROUP BY covmbaid) v ON v.covmbaid = m.mbaid " +
                "WHERE m.mbacbaid = (SELECT extcbaid FROM public.extracto WHERE extid = ?) " +
                "AND m.mbafecha <= (SELECT extfecfin FROM public.extracto WHERE extid = ?) " +
                "AND m.mbaestado = 'VIGENTE' ORDER BY m.mbafecha, m.mbanumero";
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, extid);
            stmt.setLong(2, extid);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    MovimientoConciliar m = new MovimientoConciliar();
                    m.setMbaid(rs.getLong("mbaid"));
                    m.setMbanumero(rs.getInt("mbanumero"));
                    m.setMbafecha(toLocal(rs.getDate("mbafecha")));
                    m.setMbatipo(rs.getString("mbatipo"));
                    m.setTmodescri(rs.getString("tmodescri"));
                    m.setTmosigno(rs.getInt("tmosigno"));
                    m.setMbaconcepto(rs.getString("mbaconcepto"));
                    m.setMbarefext(rs.getString("mbarefext"));
                    m.setMbaorigen(rs.getString("mbaorigen"));
                    BigDecimal imp = rs.getBigDecimal("mbaimporte");
                    BigDecimal imputado = rs.getBigDecimal("imputado");
                    m.setMbaimporte(imp);
                    m.setImputado(imputado);
                    m.setPendiente(imp.subtract(imputado));
                    lista.add(m);
                }
            }
            return ResponseBuilder.ok(lista, lista.size());
        } catch (SQLException e) {
            log.error("SQLException movimientosPeriodo: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<ConciliacionVinculo>> listVinculos(long expid) {
        List<ConciliacionVinculo> lista = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.conciliacion_vinculo WHERE covexpid = ? ORDER BY covid")) {
            stmt.setLong(1, expid);
            try (ResultSet rs = stmt.executeQuery()) { while (rs.next()) lista.add(mapVinculo(rs)); }
            return ResponseBuilder.ok(lista, lista.size());
        } catch (SQLException e) {
            log.error("SQLException listVinculos: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<ConciliacionVinculo>> vincular(ConciliacionVinculo v) {
        if (v.getCovexpid() <= 0 || v.getCovmbaid() <= 0) {
            return ResponseBuilder.error("Debe indicar la partida y el movimiento a vincular.", HttpStatus.BAD_REQUEST);
        }
        try (Connection conn = dsManager.getDataSource()) {
            BigDecimal importe = v.getCovimporte();
            if (importe == null || importe.signum() <= 0) {
                importe = importePorDefecto(conn, v.getCovexpid(), v.getCovmbaid());
            }
            if (importe == null || importe.signum() <= 0) {
                return ResponseBuilder.error("No queda saldo pendiente para vincular en la partida o el movimiento.", HttpStatus.BAD_REQUEST);
            }
            String criterio = (v.getCovcriterio() != null && !v.getCovcriterio().isBlank()) ? v.getCovcriterio() : "MANUAL";
            long id = insertVinculo(conn, v.getCovexpid(), v.getCovmbaid(), importe, false, criterio, v.getCovusucrea());
            v.setCovid(id);
            v.setCovimporte(importe);
            v.setCovcriterio(criterio);
            return ResponseBuilder.ok(v);
        } catch (SQLException e) {
            log.error("SQLException vincular: ", e);
            return ResponseBuilder.error("No se pudo vincular: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> desvincular(long covid) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(
                     "DELETE FROM public.conciliacion_vinculo cv USING public.extracto_partida p, public.extracto e " +
                     "WHERE cv.covid = ? AND p.expid = cv.covexpid AND e.extid = p.expextid AND e.extestado = 'ABIERTO';")) {
            stmt.setLong(1, covid);
            if (stmt.executeUpdate() == 0) return ResponseBuilder.error("No se puede desvincular (extracto conciliado o vínculo inexistente).", HttpStatus.BAD_REQUEST);
            return ResponseBuilder.ok("Vínculo eliminado.");
        } catch (SQLException e) {
            log.error("SQLException desvincular: ", e);
            return ResponseBuilder.error("No se pudo desvincular: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /** Empareja las partidas pendientes contra movimientos por cheque, referencia o importe+fecha. */
    @Override
    public ResponseEntity<DefaultResponse<String>> autoMatch(long extid) {
        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            long cbaid; LocalDate fecfin; String estado;
            try (PreparedStatement stmt = conn.prepareStatement("SELECT extcbaid, extfecfin, extestado FROM public.extracto WHERE extid = ?")) {
                stmt.setLong(1, extid);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) { rollback(conn); return ResponseBuilder.error("Extracto no encontrado.", HttpStatus.BAD_REQUEST); }
                    cbaid = rs.getLong("extcbaid"); fecfin = rs.getDate("extfecfin").toLocalDate(); estado = rs.getString("extestado");
                }
            }
            if ("CONCILIADO".equals(estado)) { rollback(conn); return ResponseBuilder.error("El extracto ya está conciliado.", HttpStatus.BAD_REQUEST); }

            // Partidas pendientes (sin conciliar, no ignoradas)
            List<long[]> partidas = new ArrayList<>();          // {expid}
            List<Object[]> datos = new ArrayList<>();           // {importeAbs(BigDecimal), signo(int), checknro(Integer), referen(String), fecha(Date)}
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT expid, GREATEST(expdebito, expcredito) AS imp, " +
                    "CASE WHEN expdebito > 0 THEN -1 ELSE 1 END AS signo, expchecknro, expreferen, expfecha " +
                    "FROM public.extracto_partida WHERE expextid = ? AND NOT expconcilia AND NOT expignorar ORDER BY exporden")) {
                stmt.setLong(1, extid);
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        partidas.add(new long[]{rs.getLong("expid")});
                        datos.add(new Object[]{rs.getBigDecimal("imp"), rs.getInt("signo"),
                                (Integer) rs.getObject("expchecknro"), rs.getString("expreferen"), rs.getDate("expfecha")});
                    }
                }
            }

            int matches = 0;
            for (int i = 0; i < partidas.size(); i++) {
                long expid = partidas.get(i)[0];
                BigDecimal importeAbs = (BigDecimal) datos.get(i)[0];
                int signo = (int) datos.get(i)[1];
                Integer checknro = (Integer) datos.get(i)[2];
                String referen = (String) datos.get(i)[3];
                Date fecha = (Date) datos.get(i)[4];

                Long mbaid = null; String criterio = null;
                if (checknro != null) { mbaid = candidatoUnico(conn, cbaid, fecfin, signo, importeAbs, "CHEQUE", checknro, null, null); if (mbaid != null) criterio = "CHEQUE"; }
                if (mbaid == null && referen != null && !referen.isBlank()) { mbaid = candidatoUnico(conn, cbaid, fecfin, signo, importeAbs, "REFERENCIA", null, referen, null); if (mbaid != null) criterio = "REFERENCIA"; }
                if (mbaid == null) { mbaid = candidatoUnico(conn, cbaid, fecfin, signo, importeAbs, "IMPORTE_FECHA", null, null, fecha); if (mbaid != null) criterio = "IMPORTE_FECHA"; }

                if (mbaid != null) {
                    insertVinculo(conn, expid, mbaid, importeAbs, true, criterio, null);
                    matches++;
                }
            }
            conn.commit();
            return ResponseBuilder.ok("Se emparejaron " + matches + " partidas automáticamente.");
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException autoMatch: ", e);
            return ResponseBuilder.error("No se pudo ejecutar el emparejamiento: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    /** Devuelve el mbaid si hay exactamente un movimiento candidato (pendiente == importe, mismo signo). */
    private Long candidatoUnico(Connection conn, long cbaid, LocalDate fecfin, int signo, BigDecimal importeAbs,
                                String criterio, Integer checknro, String referen, Date fecha) throws SQLException {
        String base = "SELECT m.mbaid FROM public.movimiento_bancario m " +
                "JOIN public.tipo_movimiento t ON t.tmocodigo = m.mbatipo " +
                "LEFT JOIN (SELECT covmbaid, SUM(covimporte) imp FROM public.conciliacion_vinculo GROUP BY covmbaid) v ON v.covmbaid = m.mbaid " +
                "WHERE m.mbacbaid = ? AND m.mbaestado = 'VIGENTE' AND m.mbafecha <= ? AND t.tmosigno = ? " +
                "AND (m.mbaimporte - COALESCE(v.imp,0)) = ? ";
        String cond;
        switch (criterio) {
            case "CHEQUE":        cond = "AND EXISTS (SELECT 1 FROM public.cheque_propio cp WHERE cp.chpmbaid = m.mbaid AND cp.chpnumero = ?) "; break;
            case "REFERENCIA":    cond = "AND m.mbarefext = ? "; break;
            default:               cond = "AND ABS(m.mbafecha - ?::date) <= 5 "; break;   // IMPORTE_FECHA
        }
        try (PreparedStatement stmt = conn.prepareStatement(base + cond + "LIMIT 2")) {
            stmt.setLong(1, cbaid);
            stmt.setDate(2, Date.valueOf(fecfin));
            stmt.setInt(3, signo);
            stmt.setBigDecimal(4, importeAbs);
            if ("CHEQUE".equals(criterio)) stmt.setInt(5, checknro);
            else if ("REFERENCIA".equals(criterio)) stmt.setString(5, referen);
            else stmt.setDate(5, fecha);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) return null;
                long id = rs.getLong(1);
                if (rs.next()) return null;   // más de un candidato → ambiguo, no emparejar
                return id;
            }
        }
    }

    /** Importe pendiente a imputar: el mínimo entre lo que falta de la partida y del movimiento. */
    private BigDecimal importePorDefecto(Connection conn, long expid, long mbaid) throws SQLException {
        BigDecimal partPend, movPend;
        try (PreparedStatement stmt = conn.prepareStatement(
                "SELECT GREATEST(expdebito, expcredito) - COALESCE((SELECT SUM(covimporte) FROM public.conciliacion_vinculo WHERE covexpid = ?),0) " +
                "FROM public.extracto_partida WHERE expid = ?")) {
            stmt.setLong(1, expid); stmt.setLong(2, expid);
            try (ResultSet rs = stmt.executeQuery()) { rs.next(); partPend = rs.getBigDecimal(1); }
        }
        try (PreparedStatement stmt = conn.prepareStatement(
                "SELECT mbaimporte - COALESCE((SELECT SUM(covimporte) FROM public.conciliacion_vinculo WHERE covmbaid = ?),0) " +
                "FROM public.movimiento_bancario WHERE mbaid = ?")) {
            stmt.setLong(1, mbaid); stmt.setLong(2, mbaid);
            try (ResultSet rs = stmt.executeQuery()) { rs.next(); movPend = rs.getBigDecimal(1); }
        }
        if (partPend == null || movPend == null) return null;
        return partPend.min(movPend);
    }

    private long insertVinculo(Connection conn, long expid, long mbaid, BigDecimal importe, boolean auto, String criterio, Integer usu) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.conciliacion_vinculo(" +
                "covexpid, covmbaid, covimporte, covauto, covcriterio, covusucrea) VALUES (?, ?, ?, ?, ?, ?);",
                PreparedStatement.RETURN_GENERATED_KEYS)) {
            stmt.setLong(1, expid);
            stmt.setLong(2, mbaid);
            stmt.setBigDecimal(3, importe);
            stmt.setBoolean(4, auto);
            stmt.setString(5, criterio);
            stmt.setObject(6, usu);
            stmt.execute();
            try (ResultSet rs = stmt.getGeneratedKeys()) { rs.next(); return rs.getLong("covid"); }
        }
    }

    private ConciliacionVinculo mapVinculo(ResultSet rs) throws SQLException {
        ConciliacionVinculo v = new ConciliacionVinculo();
        v.setCovid(rs.getLong("covid"));
        v.setCovexpid(rs.getLong("covexpid"));
        v.setCovmbaid(rs.getLong("covmbaid"));
        v.setCovimporte(rs.getBigDecimal("covimporte"));
        v.setCovauto(rs.getBoolean("covauto"));
        v.setCovcriterio(rs.getString("covcriterio"));
        Timestamp c = rs.getTimestamp("covcreated");
        v.setCovcreated(c != null ? c.toLocalDateTime() : null);
        v.setCovusucrea((Integer) rs.getObject("covusucrea"));
        return v;
    }

    private static LocalDate toLocal(Date d) { return d != null ? d.toLocalDate() : null; }

    private void rollback(Connection conn) { if (conn != null) try { conn.rollback(); } catch (SQLException ex) { log.error("rollback: ", ex); } }
    private void close(Connection conn) { if (conn != null) try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ex) { log.error("close: ", ex); } }
}
