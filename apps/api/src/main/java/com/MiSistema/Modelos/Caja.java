package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Caja {
    private String cajsucest;    // PK compuesta parte 1 (FK a sucursal.sucest)
    private String cajpuntoexp;  // PK compuesta parte 2
    private String cajnombre;
    private boolean cajactivo;
}
