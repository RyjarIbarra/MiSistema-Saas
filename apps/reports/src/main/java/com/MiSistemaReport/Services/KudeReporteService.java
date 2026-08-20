package com.MiSistemaReport.Services;

import com.MiSistemaReport.ModelsDto.Report.Documento.KudeReporteRequest;
import org.springframework.http.ResponseEntity;

public interface KudeReporteService {
    ResponseEntity<byte[]> generarPdf(KudeReporteRequest request);
}
