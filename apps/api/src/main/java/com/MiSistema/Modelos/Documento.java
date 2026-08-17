package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Documento {
    private long docid;

    // Identificación fiscal
    private String doctipdoc;          // FK tipo_documento.tdocodigo
    private long doctimbrado;          // FK timbrado.timid
    private String docestab;           // snapshot del timbrado
    private String docpunexp;          // snapshot del timbrado
    private int docnumero;             // asignado por fn_timbrado_siguiente_numero
    private String docnrocompleto;     // GENERATED: 001-001-0000123 (solo lectura)
    private String docmodalid;         // snapshot: P/A/E
    private boolean doccontingen;

    // Fechas
    private LocalDateTime docfecemi;
    private LocalDate docfecvto;

    // Relaciones internas
    private long doccliid;
    private Long doccajaap;            // nullable

    // Snapshot fiscal de la contraparte
    private String doclirazon;
    private String docliruc;
    private String doclidirec;

    // Condición comercial
    private String doccondvta;         // C contado, R crédito
    private int doccuotas;

    // Moneda
    private String docmoneda;
    private double doctipcambio;       // default 1

    // Totales
    private double docexentas;
    private double docexoneradas;
    private double docgravada5;
    private double docgravada10;
    private double dociva5;
    private double dociva10;
    private double doctotiva;
    private double doctotdesc;
    private double doctotal;

    // Estado
    private String docestado;          // EMITIDO / ANULADO
    private String docmotanul;
    private LocalDateTime docfecanul;
    private Integer docusuanul;

    // Varios y auditoría
    private String docobserva;
    private LocalDateTime doccreated;  // solo lectura
    private LocalDateTime docupdated;  // solo lectura
    private Integer docusucrea;

    // Detalle
    private List<DocumentoDetalle> detalle;
}
