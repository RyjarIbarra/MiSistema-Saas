package com.MiSistema.ModelsDto.View;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ModalProducto {
    private long proid;          // id del producto
    private String gtin;         // codigo de barras
    private String producto;     // descripcion (p.prodesc)
    private double cantidad;     // stock actual del deposito
    private String stock_format; // cantidad + abreviatura concatenada
}
