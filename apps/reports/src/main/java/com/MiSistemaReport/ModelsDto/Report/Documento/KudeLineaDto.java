package com.MiSistemaReport.ModelsDto.Report.Documento;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Una línea (ítem) del detalle del KuDE. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KudeLineaDto {
    private Integer dodorden;
    private String dodcodigo;
    private String doddescri;
    private BigDecimal dodcantidad;
    private BigDecimal dodpreuni;
    private BigDecimal doddescuni;
    private Integer dodtasaiva;
    private BigDecimal dodsubtotal;
}
