package com.MiSistemaReport.Services;

import com.MiSistemaReport.ModelsDto.Report.ClienteReporteRequest;
import org.springframework.http.ResponseEntity;

public interface ClienteReporteService {
    ResponseEntity<byte[]> generarPdf(ClienteReporteRequest request);
}
