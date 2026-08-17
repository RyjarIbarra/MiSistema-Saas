package com.MiSistema.ModelsDto.Venta;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class VentaPrecioProductoRequestDto {
    private long productoId;
    private int tipoPrecio;   // si viene 0 se asume 1
    private String moneda;    // ej: PYG, USD
}
