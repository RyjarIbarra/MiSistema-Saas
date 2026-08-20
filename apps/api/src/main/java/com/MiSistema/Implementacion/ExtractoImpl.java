package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Extracto;
import com.MiSistema.Modelos.ExtractoPartida;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Migracion.MigracionFilaError;
import com.MiSistema.ModelsDto.Migracion.MigracionResultadoDto;
import com.MiSistema.Services.ExtractoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExtractoImpl implements ExtractoService {

    private final DataSourceManager dsManager;

    private static final String SELECT_BASE =
            "SELECT e.*, c.cbaalias, c.cbamoneda, b.bannombre " +
            "FROM public.extracto e " +
            "INNER JOIN public.cuenta_bancaria c ON c.cbaid = e.extcbaid " +
            "INNER JOIN public.banco b ON b.banid = c.cbabanid ";

    @Override
    public ResponseEntity<DefaultResponse<Extracto>> list(long cbaid) {
        List<Extracto> lista = new ArrayList<>();
        String sql = SELECT_BASE + "WHERE (?::bigint = 0 OR e.extcbaid = ?) ORDER BY e.extfecfin DESC, e.extid DESC";
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, cbaid);
            stmt.setLong(2, cbaid);
            try (ResultSet rs = stmt.executeQuery()) { while (rs.next()) lista.add(mapRow(rs)); }
            return ResponseBuilder.ok(lista, lista.size());
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Extracto>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(SELECT_BASE + "WHERE e.extid = ?")) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return ResponseBuilder.ok(mapRow(rs));
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Extracto no encontrado.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Extracto>> insert(Extracto e) {
        if (e.getExtcbaid() <= 0 || e.getExtfecini() == null || e.getExtfecfin() == null
                || e.getExtsaldoini() == null || e.getExtsaldofin() == null) {
            return ResponseBuilder.error("Datos incompletos: cuenta, período y saldos inicial/final son obligatorios.", HttpStatus.BAD_REQUEST);
        }
        if (e.getExtfecfin().isBefore(e.getExtfecini())) {
            return ResponseBuilder.error("La fecha final no puede ser anterior a la inicial.", HttpStatus.BAD_REQUEST);
        }
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.extracto(" +
                     "extcbaid, extfecini, extfecfin, extsaldoini, extsaldofin, extarchivo, extobserva) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS)) {
            stmt.setLong(1, e.getExtcbaid());
            stmt.setDate(2, Date.valueOf(e.getExtfecini()));
            stmt.setDate(3, Date.valueOf(e.getExtfecfin()));
            stmt.setBigDecimal(4, e.getExtsaldoini());
            stmt.setBigDecimal(5, e.getExtsaldofin());
            stmt.setString(6, blankToNull(e.getExtarchivo()));
            stmt.setString(7, blankToNull(e.getExtobserva()));
            stmt.execute();
            try (ResultSet rs = stmt.getGeneratedKeys()) { rs.next(); e.setExtid(rs.getLong("extid")); }
            e.setExtestado("ABIERTO");
            return ResponseBuilder.ok(e);
        } catch (SQLException ex) {
            log.error("SQLException insert extracto: ", ex);
            return ResponseBuilder.error("No se pudo registrar el extracto: " + ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /** Cierra la conciliación: persiste como diferencia el error de carga del informe. */
    @Override
    public ResponseEntity<DefaultResponse<Extracto>> cerrar(long id, Integer usuCierre) {
        try (Connection conn = dsManager.getDataSource()) {
            BigDecimal diferencia;
            try (PreparedStatement stmt = conn.prepareStatement(
                    "SELECT (extsaldoini + COALESCE((SELECT SUM(expcredito - expdebito) FROM public.extracto_partida WHERE expextid = ? AND NOT expignorar),0)) - extsaldofin AS dif, extestado " +
                    "FROM public.extracto WHERE extid = ?")) {
                stmt.setLong(1, id);
                stmt.setLong(2, id);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) return ResponseBuilder.error("Extracto no encontrado.", HttpStatus.BAD_REQUEST);
                    if ("CONCILIADO".equals(rs.getString("extestado")))
                        return ResponseBuilder.error("El extracto ya está conciliado.", HttpStatus.BAD_REQUEST);
                    diferencia = rs.getBigDecimal("dif");
                }
            }
            try (PreparedStatement stmt = conn.prepareStatement("UPDATE public.extracto SET " +
                    "extestado = 'CONCILIADO', extdiferenc = ?, extfeccierre = NOW(), extusucierre = ? WHERE extid = ?;")) {
                stmt.setBigDecimal(1, diferencia);
                stmt.setObject(2, usuCierre);
                stmt.setLong(3, id);
                stmt.executeUpdate();
            }
            return getById(id);
        } catch (SQLException e) {
            log.error("SQLException cerrar extracto: ", e);
            return ResponseBuilder.error("No se pudo cerrar la conciliación: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.extracto WHERE extid = ? AND extestado = 'ABIERTO';")) {
            stmt.setLong(1, id);
            if (stmt.executeUpdate() == 0) return ResponseBuilder.error("Solo se puede eliminar un extracto ABIERTO.", HttpStatus.BAD_REQUEST);
            return ResponseBuilder.ok("Extracto eliminado.");
        } catch (SQLException e) {
            log.error("SQLException delete extracto: ", e);
            return ResponseBuilder.error("No se pudo eliminar el extracto: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ---------------- partidas ----------------
    @Override
    public ResponseEntity<DefaultResponse<ExtractoPartida>> listPartidas(long extid) {
        List<ExtractoPartida> lista = new ArrayList<>();
        String sql = "SELECT p.*, COALESCE(v.imputado, 0) AS imputado " +
                "FROM public.extracto_partida p " +
                "LEFT JOIN (SELECT covexpid, SUM(covimporte) AS imputado FROM public.conciliacion_vinculo GROUP BY covexpid) v ON v.covexpid = p.expid " +
                "WHERE p.expextid = ? ORDER BY p.exporden";
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, extid);
            try (ResultSet rs = stmt.executeQuery()) { while (rs.next()) lista.add(mapPartida(rs)); }
            return ResponseBuilder.ok(lista, lista.size());
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<ExtractoPartida>> addPartida(ExtractoPartida p) {
        String err = validarPartida(p);
        if (err != null) return ResponseBuilder.error(err, HttpStatus.BAD_REQUEST);
        try (Connection conn = dsManager.getDataSource()) {
            if (!extractoAbierto(conn, p.getExpextid()))
                return ResponseBuilder.error("El extracto está conciliado; no admite nuevas partidas.", HttpStatus.BAD_REQUEST);
            long id = insertPartida(conn, p, siguienteOrden(conn, p.getExpextid()));
            p.setExpid(id);
            return ResponseBuilder.ok(p);
        } catch (SQLException e) {
            log.error("SQLException add partida: ", e);
            return ResponseBuilder.error("No se pudo agregar la partida: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> addPartidasBulk(List<ExtractoPartida> partidas) {
        if (partidas == null || partidas.isEmpty()) return ResponseBuilder.error("No hay partidas para cargar.", HttpStatus.BAD_REQUEST);
        long extid = partidas.get(0).getExpextid();
        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);
            if (!extractoAbierto(conn, extid)) { rollback(conn); return ResponseBuilder.error("El extracto está conciliado.", HttpStatus.BAD_REQUEST); }
            int orden = siguienteOrden(conn, extid);
            int n = 0;
            for (ExtractoPartida p : partidas) {
                p.setExpextid(extid);
                String err = validarPartida(p);
                if (err != null) { rollback(conn); return ResponseBuilder.error("Partida " + (n + 1) + ": " + err, HttpStatus.BAD_REQUEST); }
                insertPartida(conn, p, orden++);
                n++;
            }
            conn.commit();
            return ResponseBuilder.ok("Se cargaron " + n + " partidas.");
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException bulk partidas: ", e);
            return ResponseBuilder.error("No se pudieron cargar las partidas: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> deletePartida(long expid) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(
                     "DELETE FROM public.extracto_partida p USING public.extracto e " +
                     "WHERE p.expid = ? AND e.extid = p.expextid AND e.extestado = 'ABIERTO';")) {
            stmt.setLong(1, expid);
            if (stmt.executeUpdate() == 0) return ResponseBuilder.error("No se puede eliminar (extracto conciliado o partida inexistente).", HttpStatus.BAD_REQUEST);
            return ResponseBuilder.ok("Partida eliminada.");
        } catch (SQLException e) {
            log.error("SQLException delete partida: ", e);
            return ResponseBuilder.error("No se pudo eliminar la partida: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<String>> setIgnorar(long expid, boolean ignorar) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.extracto_partida SET expignorar = ? WHERE expid = ?;")) {
            stmt.setBoolean(1, ignorar);
            stmt.setLong(2, expid);
            if (stmt.executeUpdate() == 0) return ResponseBuilder.error("Partida no encontrada.", HttpStatus.BAD_REQUEST);
            return ResponseBuilder.ok(ignorar ? "Partida marcada como ignorada." : "Partida reactivada.");
        } catch (SQLException e) {
            log.error("SQLException ignorar partida: ", e);
            return ResponseBuilder.error("No se pudo actualizar la partida: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // ---------------- importación Excel ----------------
    private static final String[] CABECERAS = {"Fecha (AAAA-MM-DD)", "Descripción", "Débito", "Crédito", "Referencia", "Nº Cheque"};

    @Override
    public ResponseEntity<byte[]> plantillaPartidas() {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Partidas");
            CellStyle header = wb.createCellStyle();
            Font bold = wb.createFont(); bold.setBold(true); header.setFont(bold);
            header.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            header.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row h = sheet.createRow(0);
            for (int i = 0; i < CABECERAS.length; i++) {
                Cell c = h.createCell(i); c.setCellValue(CABECERAS[i]); c.setCellStyle(header);
                sheet.setColumnWidth(i, (i == 1 ? 40 : 18) * 256);
            }
            // Dos filas de ejemplo (débito o crédito, uno de los dos).
            Row e1 = sheet.createRow(1);
            e1.createCell(0).setCellValue("2026-08-05");
            e1.createCell(1).setCellValue("PAGO CHEQUE 1001");
            e1.createCell(2).setCellValue(150000);
            e1.createCell(4).setCellValue("");
            e1.createCell(5).setCellValue(1001);
            Row e2 = sheet.createRow(2);
            e2.createCell(0).setCellValue("2026-08-07");
            e2.createCell(1).setCellValue("TRANSFERENCIA RECIBIDA");
            e2.createCell(3).setCellValue(500000);
            e2.createCell(4).setCellValue("OP-4821");

            wb.write(out);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDisposition(ContentDisposition.attachment().filename("plantilla-extracto.xlsx").build());
            return new ResponseEntity<>(out.toByteArray(), headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error generando plantilla de extracto: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<MigracionResultadoDto>> importarPartidas(long extid, MultipartFile file) {
        if (extid <= 0) return ResponseBuilder.error("Extracto no indicado.", HttpStatus.BAD_REQUEST);
        if (file == null || file.isEmpty()) return ResponseBuilder.error("Archivo vacío o no enviado.", HttpStatus.BAD_REQUEST);
        String fn = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (!fn.endsWith(".xls") && !fn.endsWith(".xlsx")) return ResponseBuilder.error("Formato no soportado. Solo .xls o .xlsx.", HttpStatus.BAD_REQUEST);

        List<ExtractoPartida> validas = new ArrayList<>();
        List<MigracionFilaError> errores = new ArrayList<>();
        int total = 0;
        try (InputStream is = file.getInputStream(); Workbook wb = WorkbookFactory.create(is)) {
            Sheet sheet = wb.getSheetAt(0);
            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null || filaVacia(row)) continue;
                total++;
                String descri = getStr(row, 1);
                try {
                    ExtractoPartida p = new ExtractoPartida();
                    p.setExpextid(extid);
                    LocalDate fecha = getFecha(row, 0);
                    if (fecha == null) throw new IllegalArgumentException("fecha inválida o vacía (usar AAAA-MM-DD).");
                    p.setExpfecha(fecha);
                    if (descri == null || descri.isBlank()) throw new IllegalArgumentException("descripción obligatoria.");
                    p.setExpdescri(descri);
                    BigDecimal deb = getNum(row, 2), cre = getNum(row, 3);
                    if ((deb.signum() > 0) == (cre.signum() > 0))
                        throw new IllegalArgumentException("informar débito o crédito (uno de los dos, positivo).");
                    p.setExpdebito(deb); p.setExpcredito(cre);
                    p.setExpreferen(getStr(row, 4));
                    p.setExpchecknro(getIntNull(row, 5));
                    validas.add(p);
                } catch (Exception ex) {
                    errores.add(new MigracionFilaError(r + 1, descri, ex.getMessage()));
                }
            }
        } catch (Exception e) {
            log.error("Error leyendo Excel de extracto: ", e);
            return ResponseBuilder.error("Error leyendo el archivo: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        // No se carga nada si hay filas con error: el extracto se importa completo o no se importa.
        if (!errores.isEmpty()) {
            return ResponseBuilder.ok(new MigracionResultadoDto(total, 0, errores.size(), new ArrayList<>(), errores));
        }
        if (validas.isEmpty()) return ResponseBuilder.error("El archivo no contiene partidas.", HttpStatus.BAD_REQUEST);

        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);
            if (!extractoAbierto(conn, extid)) { rollback(conn); return ResponseBuilder.error("El extracto está conciliado; no admite nuevas partidas.", HttpStatus.BAD_REQUEST); }
            int orden = siguienteOrden(conn, extid);
            List<Long> ids = new ArrayList<>();
            for (ExtractoPartida p : validas) ids.add(insertPartida(conn, p, orden++));
            conn.commit();
            return ResponseBuilder.ok(new MigracionResultadoDto(total, validas.size(), 0, ids, new ArrayList<>()));
        } catch (SQLException e) {
            rollback(conn);
            log.error("Error insertando partidas importadas: ", e);
            return ResponseBuilder.error("No se pudieron cargar las partidas: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } finally {
            close(conn);
        }
    }

    private boolean filaVacia(Row row) {
        for (int c = 0; c < CABECERAS.length; c++) {
            String s = getStr(row, c);
            if (s != null && !s.isBlank()) return false;
        }
        return true;
    }

    private String getStr(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> { String v = cell.getStringCellValue(); yield v != null && !v.isBlank() ? v.trim() : null; }
            case NUMERIC -> { double d = cell.getNumericCellValue(); yield d == Math.floor(d) ? String.valueOf((long) d) : String.valueOf(d); }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }

    private BigDecimal getNum(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null || cell.getCellType() == CellType.BLANK) return BigDecimal.ZERO;
        if (cell.getCellType() == CellType.NUMERIC) return BigDecimal.valueOf(cell.getNumericCellValue());
        String s = getStr(row, col);
        if (s == null || s.isBlank()) return BigDecimal.ZERO;
        try { return new BigDecimal(s.replace(".", "").replace(",", ".")); }
        catch (Exception e) { throw new IllegalArgumentException("importe inválido: '" + s + "'."); }
    }

    private Integer getIntNull(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null || cell.getCellType() == CellType.BLANK) return null;
        if (cell.getCellType() == CellType.NUMERIC) return (int) cell.getNumericCellValue();
        String s = getStr(row, col);
        if (s == null || s.isBlank()) return null;
        try { return Integer.parseInt(s.trim()); }
        catch (Exception e) { throw new IllegalArgumentException("Nº de cheque inválido: '" + s + "'."); }
    }

    private LocalDate getFecha(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue().toLocalDate();
        }
        String s = getStr(row, col);
        if (s == null || s.isBlank()) return null;
        s = s.trim();
        try { return LocalDate.parse(s); } catch (Exception ignore) { }
        try {
            String[] p = s.split("/");
            if (p.length == 3) return LocalDate.of(Integer.parseInt(p[2]), Integer.parseInt(p[1]), Integer.parseInt(p[0]));
        } catch (Exception ignore) { }
        return null;
    }

    // ---------------- helpers ----------------
    private String validarPartida(ExtractoPartida p) {
        if (p.getExpextid() <= 0 || p.getExpfecha() == null || p.getExpdescri() == null || p.getExpdescri().isBlank())
            return "extracto, fecha y descripción son obligatorios.";
        BigDecimal deb = p.getExpdebito() != null ? p.getExpdebito() : BigDecimal.ZERO;
        BigDecimal cre = p.getExpcredito() != null ? p.getExpcredito() : BigDecimal.ZERO;
        boolean unoSolo = (deb.signum() > 0 && cre.signum() == 0) || (cre.signum() > 0 && deb.signum() == 0);
        if (!unoSolo) return "debe informarse débito o crédito (uno de los dos, positivo).";
        p.setExpdebito(deb); p.setExpcredito(cre);
        return null;
    }

    private boolean extractoAbierto(Connection conn, long extid) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement("SELECT extestado FROM public.extracto WHERE extid = ?")) {
            stmt.setLong(1, extid);
            try (ResultSet rs = stmt.executeQuery()) { return rs.next() && "ABIERTO".equals(rs.getString(1)); }
        }
    }

    private int siguienteOrden(Connection conn, long extid) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement("SELECT COALESCE(MAX(exporden),0)+1 FROM public.extracto_partida WHERE expextid = ?")) {
            stmt.setLong(1, extid);
            try (ResultSet rs = stmt.executeQuery()) { rs.next(); return rs.getInt(1); }
        }
    }

    private long insertPartida(Connection conn, ExtractoPartida p, int orden) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.extracto_partida(" +
                "expextid, exporden, expfecha, expfecvalor, expdescri, expreferen, expdebito, expcredito, expsaldo, expchecknro) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS)) {
            stmt.setLong(1, p.getExpextid());
            stmt.setInt(2, orden);
            stmt.setDate(3, Date.valueOf(p.getExpfecha()));
            stmt.setDate(4, p.getExpfecvalor() != null ? Date.valueOf(p.getExpfecvalor()) : null);
            stmt.setString(5, p.getExpdescri());
            stmt.setString(6, blankToNull(p.getExpreferen()));
            stmt.setBigDecimal(7, p.getExpdebito());
            stmt.setBigDecimal(8, p.getExpcredito());
            stmt.setBigDecimal(9, p.getExpsaldo());
            stmt.setObject(10, p.getExpchecknro());
            stmt.execute();
            try (ResultSet rs = stmt.getGeneratedKeys()) { rs.next(); return rs.getLong("expid"); }
        }
    }

    private static String blankToNull(String s) { return (s == null || s.isBlank()) ? null : s; }

    private Extracto mapRow(ResultSet rs) throws SQLException {
        Extracto e = new Extracto();
        e.setExtid(rs.getLong("extid"));
        e.setExtcbaid(rs.getLong("extcbaid"));
        e.setExtfecini(toLocal(rs.getDate("extfecini")));
        e.setExtfecfin(toLocal(rs.getDate("extfecfin")));
        e.setExtsaldoini(rs.getBigDecimal("extsaldoini"));
        e.setExtsaldofin(rs.getBigDecimal("extsaldofin"));
        e.setExtestado(rs.getString("extestado"));
        e.setExtdiferenc(rs.getBigDecimal("extdiferenc"));
        Timestamp cierre = rs.getTimestamp("extfeccierre");
        e.setExtfeccierre(cierre != null ? cierre.toLocalDateTime() : null);
        e.setExtusucierre((Integer) rs.getObject("extusucierre"));
        e.setExtarchivo(rs.getString("extarchivo"));
        e.setExtobserva(rs.getString("extobserva"));
        Timestamp created = rs.getTimestamp("extcreated");
        e.setExtcreated(created != null ? created.toLocalDateTime() : null);
        e.setCbaalias(rs.getString("cbaalias"));
        e.setCbamoneda(rs.getString("cbamoneda"));
        e.setBannombre(rs.getString("bannombre"));
        return e;
    }

    private ExtractoPartida mapPartida(ResultSet rs) throws SQLException {
        ExtractoPartida p = new ExtractoPartida();
        p.setExpid(rs.getLong("expid"));
        p.setExpextid(rs.getLong("expextid"));
        p.setExporden(rs.getInt("exporden"));
        p.setExpfecha(toLocal(rs.getDate("expfecha")));
        p.setExpfecvalor(toLocal(rs.getDate("expfecvalor")));
        p.setExpdescri(rs.getString("expdescri"));
        p.setExpreferen(rs.getString("expreferen"));
        p.setExpdebito(rs.getBigDecimal("expdebito"));
        p.setExpcredito(rs.getBigDecimal("expcredito"));
        p.setExpsaldo(rs.getBigDecimal("expsaldo"));
        p.setExpchecknro((Integer) rs.getObject("expchecknro"));
        p.setExpconcilia(rs.getBoolean("expconcilia"));
        p.setExpignorar(rs.getBoolean("expignorar"));
        p.setImputado(rs.getBigDecimal("imputado"));
        return p;
    }

    private static java.time.LocalDate toLocal(Date d) { return d != null ? d.toLocalDate() : null; }

    private void rollback(Connection conn) { if (conn != null) try { conn.rollback(); } catch (SQLException ex) { log.error("rollback: ", ex); } }
    private void close(Connection conn) { if (conn != null) try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ex) { log.error("close: ", ex); } }
}
