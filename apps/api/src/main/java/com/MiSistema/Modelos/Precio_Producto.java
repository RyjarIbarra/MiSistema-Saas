package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Precio_Producto {
    private long id_producto;
    private long tipo;
    private String tipoText;
    private String moneda;
    private double precio;
    private boolean estado;
}
