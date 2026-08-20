package com.MiSistemaReport.Implementacion;

import com.MiSistemaReport.Config.JasperReportLoader;
import com.MiSistemaReport.Connection.DataSourceManager;
import com.MiSistemaReport.ModelsDto.Report.Documento.KudeLineaDto;
import com.MiSistemaReport.ModelsDto.Report.Documento.KudeReporteRequest;
import com.MiSistemaReport.Services.KudeReporteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Genera el KuDE (Representación Gráfica del Documento Electrónico, SIFEN) de un documento.
 * La cabecera (emisor, receptor, timbrado, totales, CDC, QR) va como parámetros y el
 * detalle de ítems como datasource de beans.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KudeReporteImpl implements KudeReporteService {

    private static final String REPORT_NAME = "Documento/kude";
    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final DataSourceManager dsManager;
    private final JasperReportLoader jasperLoader;

    @Override
    public ResponseEntity<byte[]> generarPdf(KudeReporteRequest request) {
        if (request == null || request.getDocid() == null) {
            throw new IllegalArgumentException("docid es obligatorio para generar el KuDE.");
        }
        long docid = request.getDocid();

        try (Connection conn = dsManager.getDataSource()) {

            Map<String, Object> params = queryCabecera(conn, docid);
            if (params == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            List<KudeLineaDto> lineas = queryDetalle(conn, docid);

            JasperReport report = jasperLoader.load(REPORT_NAME);
            JRBeanCollectionDataSource ds = new JRBeanCollectionDataSource(lineas);
            JasperPrint print = JasperFillManager.fillReport(report, params, ds);
            byte[] pdf = JasperExportManager.exportReportToPdf(print);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.inline()
                    .filename("kude_" + docid + ".pdf").build());
            headers.setContentLength(pdf.length);
            return ResponseEntity.ok().headers(headers).body(pdf);

        } catch (Exception e) {
            log.error("Error generando KuDE del documento {}", docid, e);
            throw new RuntimeException("Error generando KuDE: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> queryCabecera(Connection conn, long docid) throws SQLException {
        String sql = "SELECT d.docnrocompleto, d.docfecemi, d.doccondvta, d.docmoneda, d.doctipdoc, " +
                "       d.docliruc, d.doclirazon, d.doclidirec, " +
                "       d.docexentas, d.docexoneradas, d.docgravada5, d.dociva5, " +
                "       d.docgravada10, d.dociva10, d.doctotiva, d.doctotdesc, d.doctotal, d.docestado, " +
                "       t.timnumero, t.timfecini, " +
                "       e.razon_social, e.ruc AS emi_ruc, e.dv_ruc, e.direccion AS emi_dir, " +
                "       e.telefono AS emi_tel, e.email AS emi_mail, e.ambiente_sifen, " +
                "       s.doscdc, s.dosqr, s.dosestado " +
                "FROM public.documento d " +
                "LEFT JOIN public.timbrado t ON t.timid = d.doctimbrado " +
                "LEFT JOIN public.documento_sifen s ON s.dosdocid = d.docid " +
                "LEFT JOIN public.empresa_configuracion e ON TRUE " +
                "WHERE d.docid = ? " +
                "LIMIT 1";

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, docid);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) return null;

                Map<String, Object> p = new HashMap<>();
                // Emisor
                p.put("emiRazon", nz(rs.getString("razon_social")));
                String ruc = rs.getString("emi_ruc");
                String dv = rs.getString("dv_ruc");
                p.put("emiRuc", ruc == null ? "" : (dv == null || dv.isBlank() ? ruc : ruc + "-" + dv));
                p.put("emiDir", nz(rs.getString("emi_dir")));
                p.put("emiTel", nz(rs.getString("emi_tel")));
                p.put("emiMail", nz(rs.getString("emi_mail")));
                p.put("ambiente", "test".equalsIgnoreCase(nz(rs.getString("ambiente_sifen"))) ? "AMBIENTE DE PRUEBA" : "");
                // Timbrado
                p.put("timNro", nz(rs.getString("timnumero")));
                java.sql.Date timIni = rs.getDate("timfecini");
                p.put("timIni", timIni != null ? timIni.toLocalDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "");
                // Documento
                p.put("docTipo", tipoDocumento(rs.getString("doctipdoc")));
                p.put("docNro", nz(rs.getString("docnrocompleto")));
                Timestamp fecEmi = rs.getTimestamp("docfecemi");
                p.put("docFecEmi", fecEmi != null ? fecEmi.toLocalDateTime().format(FECHA) : "");
                p.put("docCondVta", condicionVenta(rs.getString("doccondvta")));
                String moneda = nz(rs.getString("docmoneda"));
                p.put("docMoneda", moneda.isBlank() ? "PYG" : moneda);
                p.put("docEstado", nz(rs.getString("docestado")));
                // Receptor
                p.put("recRazon", nz(rs.getString("doclirazon")));
                p.put("recRuc", nz(rs.getString("docliruc")));
                p.put("recDir", nz(rs.getString("doclidirec")));
                // Totales
                BigDecimal exentas = nb(rs.getBigDecimal("docexentas")).add(nb(rs.getBigDecimal("docexoneradas")));
                BigDecimal gravada5 = nb(rs.getBigDecimal("docgravada5"));
                BigDecimal iva5 = nb(rs.getBigDecimal("dociva5"));
                BigDecimal gravada10 = nb(rs.getBigDecimal("docgravada10"));
                BigDecimal iva10 = nb(rs.getBigDecimal("dociva10"));
                BigDecimal totIva = nb(rs.getBigDecimal("doctotiva"));
                BigDecimal totDesc = nb(rs.getBigDecimal("doctotdesc"));
                BigDecimal total = nb(rs.getBigDecimal("doctotal"));
                p.put("exentas", exentas);
                p.put("gravada5", gravada5);
                p.put("iva5", iva5);
                p.put("gravada10", gravada10);
                p.put("iva10", iva10);
                p.put("totIva", totIva);
                p.put("totDesc", totDesc);
                p.put("total", total);
                p.put("totalLetras", numeroALetras(total.longValue()) + " " + monedaLetras((String) p.get("docMoneda")));
                // SIFEN
                p.put("cdc", nz(rs.getString("doscdc")));
                p.put("qr", nz(rs.getString("dosqr")));
                p.put("sifenEstado", nz(rs.getString("dosestado")));
                return p;
            }
        }
    }

    private List<KudeLineaDto> queryDetalle(Connection conn, long docid) throws SQLException {
        String sql = "SELECT dodorden, dodcodigo, doddescri, dodcantidad, dodpreuni, doddescuni, " +
                "       dodtasaiva, dodsubtotal " +
                "FROM public.documento_detalle WHERE doddocid = ? ORDER BY dodorden";
        List<KudeLineaDto> lista = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, docid);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    KudeLineaDto l = new KudeLineaDto();
                    l.setDodorden((Integer) rs.getObject("dodorden"));
                    l.setDodcodigo(rs.getString("dodcodigo"));
                    l.setDoddescri(rs.getString("doddescri"));
                    l.setDodcantidad(rs.getBigDecimal("dodcantidad"));
                    l.setDodpreuni(rs.getBigDecimal("dodpreuni"));
                    l.setDoddescuni(rs.getBigDecimal("doddescuni"));
                    l.setDodtasaiva((Integer) rs.getObject("dodtasaiva"));
                    l.setDodsubtotal(rs.getBigDecimal("dodsubtotal"));
                    lista.add(l);
                }
            }
        }
        return lista;
    }

    // ---------- helpers ----------

    private static String nz(String s) { return s == null ? "" : s.trim(); }
    private static BigDecimal nb(BigDecimal b) { return b == null ? BigDecimal.ZERO : b; }

    private static String tipoDocumento(String cod) {
        if (cod == null) return "DOCUMENTO ELECTRÓNICO";
        return switch (cod.trim()) {
            case "1" -> "FACTURA ELECTRÓNICA";
            case "4" -> "AUTOFACTURA ELECTRÓNICA";
            case "5" -> "NOTA DE CRÉDITO ELECTRÓNICA";
            case "6" -> "NOTA DE DÉBITO ELECTRÓNICA";
            case "7" -> "NOTA DE REMISIÓN ELECTRÓNICA";
            default -> "DOCUMENTO ELECTRÓNICO";
        };
    }

    private static String condicionVenta(String cod) {
        if (cod == null) return "";
        return switch (cod.trim()) {
            case "1" -> "Contado";
            case "2" -> "Crédito";
            default -> cod.trim();
        };
    }

    private static String monedaLetras(String moneda) {
        if (moneda == null) return "";
        return switch (moneda.trim().toUpperCase()) {
            case "PYG" -> "GUARANÍES";
            case "USD" -> "DÓLARES";
            case "EUR" -> "EUROS";
            default -> moneda.trim().toUpperCase();
        };
    }

    // Convierte un entero (0..999.999.999.999) a palabras en español.
    private static String numeroALetras(long n) {
        if (n == 0) return "CERO";
        if (n < 0) return "MENOS " + numeroALetras(-n);
        StringBuilder sb = new StringBuilder();
        long millones = n / 1_000_000;
        long resto = n % 1_000_000;
        if (millones > 0) {
            sb.append(millones == 1 ? "UN MILLÓN " : milesYcientos(millones) + "MILLONES ");
        }
        if (resto > 0) sb.append(milesYcientos(resto));
        return sb.toString().trim().replaceAll("\\s+", " ");
    }

    // n en 1..999.999 -> palabras (miles + cientos).
    private static String milesYcientos(long n) {
        StringBuilder sb = new StringBuilder();
        int miles = (int) (n / 1000);
        int cientos = (int) (n % 1000);
        if (miles > 0) sb.append(miles == 1 ? "MIL " : tresCifrasTexto(miles) + "MIL ");
        if (cientos > 0) sb.append(tresCifrasTexto(cientos));
        return sb.toString();
    }

    private static final String[] UNIDADES = {"", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
            "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE",
            "VEINTE", "VEINTIUNO", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO", "VEINTICINCO", "VEINTISÉIS", "VEINTISIETE",
            "VEINTIOCHO", "VEINTINUEVE"};
    private static final String[] DECENAS = {"", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"};
    private static final String[] CENTENAS = {"", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
            "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"};

    private static String tresCifrasTexto(int n) {
        if (n == 0) return "";
        if (n == 100) return "CIEN ";
        StringBuilder sb = new StringBuilder();
        int c = n / 100;
        int d = n % 100;
        if (c > 0) sb.append(CENTENAS[c]).append(" ");
        if (d > 0) {
            if (d < 30) {
                sb.append(UNIDADES[d]).append(" ");
            } else {
                int dec = d / 10;
                int uni = d % 10;
                sb.append(DECENAS[dec]);
                if (uni > 0) sb.append(" Y ").append(UNIDADES[uni]);
                sb.append(" ");
            }
        }
        return sb.toString();
    }
}
