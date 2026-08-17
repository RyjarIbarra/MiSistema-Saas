package com.MiSistemaReport.Implementacion;

import com.MiSistemaReport.Config.JasperReportLoader;
import com.MiSistemaReport.Connection.DataSourceManager;
import com.MiSistemaReport.ModelsDto.Report.ClienteReporteDto;
import com.MiSistemaReport.ModelsDto.Report.ClienteReporteRequest;
import com.MiSistemaReport.Services.ClienteReporteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClienteReporteImpl implements ClienteReporteService {

    private static final String REPORT_NAME = "Cliente/cliente_reporte";

    private final DataSourceManager dsManager;
    private final JasperReportLoader jasperLoader;

    @Override
    public ResponseEntity<byte[]> generarPdf(ClienteReporteRequest request) {
        LocalDate fechaDesde = request != null ? request.getFechaDesde() : null;
        LocalDate fechaHasta = request != null ? request.getFechaHasta() : null;

        try {
            List<ClienteReporteDto> datos = queryClientes(fechaDesde, fechaHasta);

            JasperReport report = jasperLoader.load(REPORT_NAME);

            Map<String, Object> params = new HashMap<>();
            params.put("fechaDesde", fechaDesde);
            params.put("fechaHasta", fechaHasta);

            JRBeanCollectionDataSource ds = new JRBeanCollectionDataSource(datos);
            JasperPrint print = JasperFillManager.fillReport(report, params, ds);
            byte[] pdf = JasperExportManager.exportReportToPdf(print);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.inline().filename("reporte_clientes.pdf").build());
            headers.setContentLength(pdf.length);
            return ResponseEntity.ok().headers(headers).body(pdf);

        } catch (Exception e) {
            log.error("Error generando reporte de clientes", e);
            throw new RuntimeException("Error generando reporte de clientes: " + e.getMessage(), e);
        }
    }

    private List<ClienteReporteDto> queryClientes(LocalDate fechaDesde, LocalDate fechaHasta) throws SQLException {
        String sql = "SELECT cliid, cliruc, clinom, clitel, climail, clidir, clifec " +
                "FROM public.cliente " +
                "WHERE (?::date IS NULL OR clifec::date >= ?::date) " +
                "  AND (?::date IS NULL OR clifec::date <= ?::date) " +
                "ORDER BY clinom";

        List<ClienteReporteDto> lista = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            Date desde = fechaDesde != null ? Date.valueOf(fechaDesde) : null;
            Date hasta = fechaHasta != null ? Date.valueOf(fechaHasta) : null;

            if (desde != null) {
                stmt.setDate(1, desde);
                stmt.setDate(2, desde);
            } else {
                stmt.setNull(1, java.sql.Types.DATE);
                stmt.setNull(2, java.sql.Types.DATE);
            }
            if (hasta != null) {
                stmt.setDate(3, hasta);
                stmt.setDate(4, hasta);
            } else {
                stmt.setNull(3, java.sql.Types.DATE);
                stmt.setNull(4, java.sql.Types.DATE);
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    ClienteReporteDto dto = new ClienteReporteDto();
                    dto.setCliid(rs.getLong("cliid"));
                    dto.setCliruc(rs.getString("cliruc"));
                    dto.setClinom(rs.getString("clinom"));
                    dto.setClitel(rs.getString("clitel"));
                    dto.setClimail(rs.getString("climail"));
                    dto.setClidir(rs.getString("clidir"));
                    Timestamp fec = rs.getTimestamp("clifec");
                    dto.setClifec(fec != null ? fec.toLocalDateTime() : null);
                    lista.add(dto);
                }
            }
        }
        return lista;
    }
}
