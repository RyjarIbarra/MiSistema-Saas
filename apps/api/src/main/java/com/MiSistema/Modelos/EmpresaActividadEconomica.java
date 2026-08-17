package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class EmpresaActividadEconomica {
    private String codigo;
    private String descripcion;
    private boolean es_principal;
}
