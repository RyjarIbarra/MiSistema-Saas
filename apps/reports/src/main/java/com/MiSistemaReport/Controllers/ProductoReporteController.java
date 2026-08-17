package com.MiSistemaReport.Controllers;

import com.MiSistemaReport.ModelsDto.Report.Producto.ProductoReporteRequest;
import com.MiSistemaReport.Services.ProductoReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/producto/report")
@RequiredArgsConstructor
public class ProductoReporteController {

    private final ProductoReporteService productoReporteService;

    @PostMapping(value = "/general/pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> general(@RequestBody(required = false) ProductoReporteRequest req) {
        return productoReporteService.generalPdf(req);
    }

    @PostMapping(value = "/detalle/pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> detalle(@RequestBody(required = false) ProductoReporteRequest req) {
        return productoReporteService.detallePdf(req);
    }

    @PostMapping(value = "/precios/pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> precios(@RequestBody(required = false) ProductoReporteRequest req) {
        return productoReporteService.preciosPdf(req);
    }

    @PostMapping(value = "/stock/pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> stock(@RequestBody(required = false) ProductoReporteRequest req) {
        return productoReporteService.stockPdf(req);
    }
}
