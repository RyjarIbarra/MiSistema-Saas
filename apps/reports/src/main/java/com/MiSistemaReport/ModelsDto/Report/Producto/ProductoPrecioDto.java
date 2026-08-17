package com.MiSistemaReport.ModelsDto.Report.Producto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProductoPrecioDto {
    private long proid;
    private String gtin;
    private String prodesc;
    private String tipoPrecio;
    private String moneda;
    private double precio;
}
