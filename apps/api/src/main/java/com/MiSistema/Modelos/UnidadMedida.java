package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UnidadMedida {
    private String codigo;     // PK
    private String descripcion;
    private String abreviatura;
}
