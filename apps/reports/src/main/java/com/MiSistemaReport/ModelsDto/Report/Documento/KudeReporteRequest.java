package com.MiSistemaReport.ModelsDto.Report.Documento;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Pide el KuDE de un documento por su id. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KudeReporteRequest {
    private Long docid;
}
