package com.MiSistemaReport.Controllers;

import com.MiSistemaReport.ModelsDto.Report.ClienteReporteRequest;
import com.MiSistemaReport.Services.ClienteReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/cliente/report")
@RequiredArgsConstructor
public class ClienteReporteController {

    private final ClienteReporteService clienteReporteService;

    @PostMapping(value = "/pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> pdf(@RequestBody(required = false) ClienteReporteRequest request) {
        return clienteReporteService.generarPdf(request);
    }
}
