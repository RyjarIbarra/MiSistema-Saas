package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Cliente {
    private long cliid;
    private String cliruc;
    private String clinom;
    private int tipo_documento;
    private String clitel;
    private String climail;
    private String clidir;
    private Integer tipoprecio;
    private LocalDateTime clifec;
    private String cliobs;

    // Tipos de operación / contribuyente (SIFEN)
    private Integer tipo_operacion;       // 1=B2B, 2=B2C, 3=B2G, 4=B2F
    private Integer tipo_contribuyente;   // 1=Persona Física, 2=Persona Jurídica
    private Integer naturaleza_receptor;

    // País y ubicación
    private String pais_codigo;           // ISO alfa-3 SIFEN (PRY, ARG, BRA, USA...)
    private String pais_descripcion;
    private String pais_prefijo;          // +595, +54, ...
    private Integer departamento_codigo;
    private String departamento_descripcion;
    private Integer distrito_codigo;
    private String distrito_descripcion;
    private Integer ciudad_codigo;
    private String ciudad_descripcion;
}
