package com.MiSistemaReport.Services;

import com.MiSistemaReport.ModelsDto.Report.Producto.ProductoReporteRequest;
import org.springframework.http.ResponseEntity;

public interface ProductoReporteService {
    ResponseEntity<byte[]> generalPdf(ProductoReporteRequest req);
    ResponseEntity<byte[]> detallePdf(ProductoReporteRequest req);
    ResponseEntity<byte[]> preciosPdf(ProductoReporteRequest req);
    ResponseEntity<byte[]> stockPdf(ProductoReporteRequest req);
}
