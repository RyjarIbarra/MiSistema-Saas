package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Moneda {
    private String codigo;       // PK — PYG, USD, EUR
    private String descripcion;
    private String simbolo;
    private int decimales;
    private boolean activo;
}
