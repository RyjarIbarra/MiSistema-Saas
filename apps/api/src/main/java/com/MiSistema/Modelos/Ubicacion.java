package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Ubicacion {
    private long ubi_id;
    private String ubi_codigo;
    private String ubi_ubicacion;
    private String ubi_referencia;
}
