package com.MiSistemaReport.ModelsDto.Report.Producto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProductoStockDto {
    private long proid;
    private String gtin;
    private String prodesc;
    private String deposito;
    private double cantidad;
    private String unidad;
    private String stockFormateado;
}
