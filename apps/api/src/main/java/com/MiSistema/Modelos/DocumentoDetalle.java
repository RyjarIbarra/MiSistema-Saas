package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DocumentoDetalle {
    private long dodid;
    private long doddocid;
    private int dodorden;
    private Long dodproid;            // nullable — concepto libre
    private String dodcodigo;         // snapshot código producto
    private String doddescri;         // snapshot descripción
    private Integer dodunimed;        // código unidad SIFEN, nullable
    private double dodcantidad;
    private double dodpreuni;         // precio unitario con IVA incluido
    private double doddescuni;        // descuento por unidad
    private int dodafectiva;          // iAfecIVA: 1 grav, 2 exon, 3 exen, 4 parcial
    private int dodtasaiva;           // 0, 5 o 10
    private double dodpropiva;        // proporción gravada 0-100 (default 100)
    private double dodbaseimp;        // base imponible
    private double dodmontoiva;       // IVA de la línea
    private double dodsubtotal;       // total con IVA
    private String dodlote;           // nullable
    private LocalDate dodfecvto;      // vencimiento del lote, nullable
}
