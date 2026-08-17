package com.MiSistemaReport.ModelsDto.Report.Producto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProductoReporteRequest {
    private String texto;
    private Boolean activo;
    private Long idDeposito;
    private Boolean soloConStock;
}
