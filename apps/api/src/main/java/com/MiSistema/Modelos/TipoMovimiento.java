package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Catálogo de tipos de movimiento bancario. Centraliza el signo y las reglas de captura. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class TipoMovimiento {
    private String tmocodigo;     // PK, código de hasta 3 caracteres
    private String tmodescri;
    private int tmosigno;         // 1 acredita, -1 debita
    private boolean tmotransfer;  // traspaso entre cuentas propias
    private boolean tmorefext;    // exige referencia externa
    private boolean tmobenefic;   // exige contraparte
    private boolean tmomanual;    // admite carga manual
    private int tmoorden;
    private boolean tmoactivo;
}
