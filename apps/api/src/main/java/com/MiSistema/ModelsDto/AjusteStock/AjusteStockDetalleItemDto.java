package com.MiSistema.ModelsDto.AjusteStock;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AjusteStockDetalleItemDto {
    private long detalleId;
    private long productoId;
    private String codigo;              // producto.gtin
    private String producto;            // producto.prodesc
    private String tipoMovimiento;
    private double stockActual;
    private double cantidad;
    private double stockResultante;
}
