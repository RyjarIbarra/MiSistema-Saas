package com.MiSistema.ModelsDto.Venta;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class VentaPrecioProductoDto {
    private long productoId;
    private int tipoPrecio;
    private String moneda;
    private double precio;
    private double iva;      // producto.tasa_iva
}
