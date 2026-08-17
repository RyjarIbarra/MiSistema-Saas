package com.MiSistemaReport.ModelsDto.Report.Producto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProductoDetalleDto {
    private long proid;
    private String gtin;
    private String prodesc;
    private String tipoProducto;
    private String unidad;
    private String categoria;
    private String familia;
    private String marca;
    private String ubicacion;
    private double tasaIva;
    private boolean ctrlstock;
    private boolean activo;
    private String proobs;
}
