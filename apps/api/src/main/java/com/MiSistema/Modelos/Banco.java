package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Catálogo de entidades financieras (bancos, financieras, cooperativas). */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Banco {
    private long banid;
    private String bancodigo;
    private String bannombre;
    private String bantipo;        // B banco, F financiera, C cooperativa
    private String banruc;
    private Integer bandv;
    private String banswift;
    private String banbcp;
    private String bantelefono;
    private String banejecutivo;
    private String banobserva;
    private boolean banactivo;
}
