package com.MiSistema.ModelsDto.AjusteStock;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AjusteStockDetalleRequestDto {
    private long productoId;
    private String tipoMovimiento;   // DESCUENTO | AUMENTO
    private double cantidad;
    private double stockActual;      // snapshot opcional (default 0)
    private double stockResultante;  // snapshot opcional (default 0)
}
