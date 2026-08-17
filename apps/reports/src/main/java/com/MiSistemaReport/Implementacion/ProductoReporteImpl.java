package com.MiSistemaReport.Implementacion;

import com.MiSistemaReport.Config.JasperReportLoader;
import com.MiSistemaReport.Connection.DataSourceManager;
import com.MiSistemaReport.ModelsDto.Report.Producto.ProductoDetalleDto;
import com.MiSistemaReport.ModelsDto.Report.Producto.ProductoGeneralDto;
import com.MiSistemaReport.ModelsDto.Report.Producto.ProductoPrecioDto;
import com.MiSistemaReport.ModelsDto.Report.Producto.ProductoReporteRequest;
import com.MiSistemaReport.ModelsDto.Report.Producto.ProductoStockDto;
import com.MiSistemaReport.Services.ProductoReporteService;
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
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductoReporteImpl implements ProductoReporteService {

    private final DataSourceManager dsManager;
    private final JasperReportLoader jasperLoader;

    // =========================================================
    // 1. General
    // =========================================================
    @Override
    public ResponseEntity<byte[]> generalPdf(ProductoReporteRequest req) {
        try {
            List<ProductoGeneralDto> datos = queryGeneral(req);
            Map<String, Object> params = commonParams(req);
            return buildPdf("Producto/producto_general", params, datos, "producto_general.pdf");
        } catch (Exception e) {
            log.error("Error generando reporte general de productos", e);
            throw new RuntimeException("Error generando reporte general: " + e.getMessage(), e);
        }
    }

    private List<ProductoGeneralDto> queryGeneral(ProductoReporteRequest req) throws SQLException {
        String texto = textoFilter(req);
        StringBuilder sql = new StringBuilder(
                "SELECT p.proid, p.gtin, p.prodesc, " +
                        "COALESCE(c.cat_nom, '-') AS categoria, " +
                        "COALESCE(m.mar_nom, '-') AS marca, " +
                        "p.activo " +
                        "FROM public.producto p " +
                        "LEFT JOIN public.categoria c ON c.cat_id = p.categoria " +
                        "LEFT JOIN public.marca m ON m.mar_id = p.marca " +
                        "WHERE (p.prodesc ILIKE ? OR COALESCE(p.gtin, '') ILIKE ?)");
        boolean filterActivo = req != null && req.getActivo() != null;
        if (filterActivo) sql.append(" AND p.activo = ?");
        sql.append(" ORDER BY p.prodesc");

        List<ProductoGeneralDto> lista = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            int i = 1;
            stmt.setString(i++, "%" + texto + "%");
            stmt.setString(i++, "%" + texto + "%");
            if (filterActivo) stmt.setBoolean(i++, req.getActivo());
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    lista.add(new ProductoGeneralDto(
                            rs.getLong("proid"),
                            rs.getString("gtin"),
                            rs.getString("prodesc"),
                            rs.getString("categoria"),
                            rs.getString("marca"),
                            rs.getBoolean("activo")
                    ));
                }
            }
        }
        return lista;
    }

    // =========================================================
    // 2. Detallado
    // =========================================================
    @Override
    public ResponseEntity<byte[]> detallePdf(ProductoReporteRequest req) {
        try {
            List<ProductoDetalleDto> datos = queryDetalle(req);
            Map<String, Object> params = commonParams(req);
            return buildPdf("Producto/producto_detalle", params, datos, "producto_detalle.pdf");
        } catch (Exception e) {
            log.error("Error generando reporte detallado de productos", e);
            throw new RuntimeException("Error generando reporte detallado: " + e.getMessage(), e);
        }
    }

    private List<ProductoDetalleDto> queryDetalle(ProductoReporteRequest req) throws SQLException {
        String texto = textoFilter(req);
        StringBuilder sql = new StringBuilder(
                "SELECT p.proid, p.gtin, p.prodesc, " +
                        "CASE p.tipo_producto WHEN 1 THEN 'Producto' WHEN 2 THEN 'Servicio' ELSE 'Otro' END AS tipo_producto, " +
                        "u.descripcion AS unidad, " +
                        "COALESCE(c.cat_nom, '-') AS categoria, " +
                        "COALESCE(f.fam_nom, '-') AS familia, " +
                        "COALESCE(m.mar_nom, '-') AS marca, " +
                        "COALESCE(ub.ubi_ubicacion, '-') AS ubicacion, " +
                        "p.tasa_iva, p.ctrlstock, p.activo, p.proobs " +
                        "FROM public.producto p " +
                        "JOIN public.unidad_medida u ON u.codigo = p.unidad " +
                        "LEFT JOIN public.categoria c ON c.cat_id = p.categoria " +
                        "LEFT JOIN public.familia f ON f.fam_id = c.fam_id " +
                        "LEFT JOIN public.marca m ON m.mar_id = p.marca " +
                        "LEFT JOIN public.ubicacion ub ON ub.ubi_id = p.ubicacion " +
                        "WHERE (p.prodesc ILIKE ? OR COALESCE(p.gtin, '') ILIKE ?)");
        boolean filterActivo = req != null && req.getActivo() != null;
        if (filterActivo) sql.append(" AND p.activo = ?");
        sql.append(" ORDER BY p.prodesc");

        List<ProductoDetalleDto> lista = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            int i = 1;
            stmt.setString(i++, "%" + texto + "%");
            stmt.setString(i++, "%" + texto + "%");
            if (filterActivo) stmt.setBoolean(i++, req.getActivo());
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    lista.add(new ProductoDetalleDto(
                            rs.getLong("proid"),
                            rs.getString("gtin"),
                            rs.getString("prodesc"),
                            rs.getString("tipo_producto"),
                            rs.getString("unidad"),
                            rs.getString("categoria"),
                            rs.getString("familia"),
                            rs.getString("marca"),
                            rs.getString("ubicacion"),
                            rs.getDouble("tasa_iva"),
                            rs.getBoolean("ctrlstock"),
                            rs.getBoolean("activo"),
                            rs.getString("proobs")
                    ));
                }
            }
        }
        return lista;
    }

    // =========================================================
    // 3. Precios
    // =========================================================
    @Override
    public ResponseEntity<byte[]> preciosPdf(ProductoReporteRequest req) {
        try {
            List<ProductoPrecioDto> datos = queryPrecios(req);
            Map<String, Object> params = commonParams(req);
            return buildPdf("Producto/producto_precios", params, datos, "producto_precios.pdf");
        } catch (Exception e) {
            log.error("Error generando reporte de precios de productos", e);
            throw new RuntimeException("Error generando reporte de precios: " + e.getMessage(), e);
        }
    }

    private List<ProductoPrecioDto> queryPrecios(ProductoReporteRequest req) throws SQLException {
        String texto = textoFilter(req);
        StringBuilder sql = new StringBuilder(
                "SELECT p.proid, p.gtin, p.prodesc, " +
                        "t.tipnom AS tipo_precio, pp.moneda, pp.precio " +
                        "FROM public.producto p " +
                        "INNER JOIN public.precio_producto pp ON pp.id_producto = p.proid " +
                        "INNER JOIN public.tipoprecio t ON t.tipid = pp.tipo " +
                        "WHERE COALESCE(pp.estado, TRUE) = TRUE " +
                        "AND (p.prodesc ILIKE ? OR COALESCE(p.gtin, '') ILIKE ?)");
        boolean filterActivo = req != null && req.getActivo() != null;
        if (filterActivo) sql.append(" AND p.activo = ?");
        sql.append(" ORDER BY p.prodesc, t.tipnom");

        List<ProductoPrecioDto> lista = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            int i = 1;
            stmt.setString(i++, "%" + texto + "%");
            stmt.setString(i++, "%" + texto + "%");
            if (filterActivo) stmt.setBoolean(i++, req.getActivo());
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    lista.add(new ProductoPrecioDto(
                            rs.getLong("proid"),
                            rs.getString("gtin"),
                            rs.getString("prodesc"),
                            rs.getString("tipo_precio"),
                            rs.getString("moneda"),
                            rs.getDouble("precio")
                    ));
                }
            }
        }
        return lista;
    }

    // =========================================================
    // 4. Stock
    // =========================================================
    @Override
    public ResponseEntity<byte[]> stockPdf(ProductoReporteRequest req) {
        try {
            List<ProductoStockDto> datos = queryStock(req);
            Map<String, Object> params = commonParams(req);
            return buildPdf("Producto/producto_stock", params, datos, "producto_stock.pdf");
        } catch (Exception e) {
            log.error("Error generando reporte de stock de productos", e);
            throw new RuntimeException("Error generando reporte de stock: " + e.getMessage(), e);
        }
    }

    private List<ProductoStockDto> queryStock(ProductoReporteRequest req) throws SQLException {
        String texto = textoFilter(req);
        StringBuilder sql = new StringBuilder(
                "SELECT p.proid, p.gtin, p.prodesc, " +
                        "COALESCE(d.depnom, 'Sin deposito') AS deposito, " +
                        "COALESCE(s.cantidad, 0) AS cantidad, " +
                        "u.abreviatura AS unidad, " +
                        "CASE WHEN u.descripcion = 'Servicio' THEN 'N/A' " +
                        "ELSE concat(trim(trailing '.' from trim(trailing '0' from COALESCE(s.cantidad, 0)::text)), " +
                        "' ', u.abreviatura) END AS stock_formateado " +
                        "FROM public.producto p " +
                        "JOIN public.unidad_medida u ON u.codigo = p.unidad " +
                        "LEFT JOIN public.stock s ON s.id_producto = p.proid " +
                        "LEFT JOIN public.deposito d ON d.depid = s.id_deposito " +
                        "WHERE (p.prodesc ILIKE ? OR COALESCE(p.gtin, '') ILIKE ?)");
        boolean filterActivo = req != null && req.getActivo() != null;
        boolean filterDeposito = req != null && req.getIdDeposito() != null;
        boolean soloConStock = req != null && Boolean.TRUE.equals(req.getSoloConStock());
        if (filterActivo) sql.append(" AND p.activo = ?");
        if (filterDeposito) sql.append(" AND s.id_deposito = ?");
        if (soloConStock) sql.append(" AND COALESCE(s.cantidad, 0) > 0");
        sql.append(" ORDER BY p.prodesc, d.depnom");

        List<ProductoStockDto> lista = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            int i = 1;
            stmt.setString(i++, "%" + texto + "%");
            stmt.setString(i++, "%" + texto + "%");
            if (filterActivo) stmt.setBoolean(i++, req.getActivo());
            if (filterDeposito) stmt.setLong(i++, req.getIdDeposito());
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    lista.add(new ProductoStockDto(
                            rs.getLong("proid"),
                            rs.getString("gtin"),
                            rs.getString("prodesc"),
                            rs.getString("deposito"),
                            rs.getDouble("cantidad"),
                            rs.getString("unidad"),
                            rs.getString("stock_formateado")
                    ));
                }
            }
        }
        return lista;
    }

    // =========================================================
    // Helpers
    // =========================================================
    private String textoFilter(ProductoReporteRequest req) {
        return (req != null && req.getTexto() != null) ? req.getTexto() : "";
    }

    private Map<String, Object> commonParams(ProductoReporteRequest req) {
        Map<String, Object> params = new HashMap<>();
        params.put("filtroTexto", req != null && req.getTexto() != null ? req.getTexto() : "");
        params.put("filtroActivo", req != null ? req.getActivo() : null);
        params.put("filtroDeposito", req != null ? req.getIdDeposito() : null);
        return params;
    }

    private ResponseEntity<byte[]> buildPdf(String reportName, Map<String, Object> params,
                                             List<?> datos, String fileName) throws Exception {
        JasperReport report = jasperLoader.load(reportName);
        JRBeanCollectionDataSource ds = new JRBeanCollectionDataSource(datos);
        JasperPrint print = JasperFillManager.fillReport(report, params, ds);
        byte[] pdf = JasperExportManager.exportReportToPdf(print);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename(fileName).build());
        headers.setContentLength(pdf.length);
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
