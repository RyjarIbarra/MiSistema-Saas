package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Sucursal {
    private String sucest;   // PK (CHAR(3))
    private String sucnom;
    private String sucdir;
    private String suctel;
}
