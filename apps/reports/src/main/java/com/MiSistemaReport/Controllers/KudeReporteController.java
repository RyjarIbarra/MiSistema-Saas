package com.MiSistemaReport.Controllers;

import com.MiSistemaReport.ModelsDto.Report.Documento.KudeReporteRequest;
import com.MiSistemaReport.Services.KudeReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/documento/report")
@RequiredArgsConstructor
public class KudeReporteController {

    private final KudeReporteService kudeReporteService;

    /** KuDE (representación gráfica) de un documento electrónico, en PDF. */
    @PostMapping(value = "/kude", produces = "application/pdf")
    public ResponseEntity<byte[]> kude(@RequestBody KudeReporteRequest request) {
        return kudeReporteService.generarPdf(request);
    }
}
