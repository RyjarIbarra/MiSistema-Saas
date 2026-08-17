package com.MiSistema.ModelsDto.Documento;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DocumentoListDto {
    private long docid;
    private LocalDateTime fecha;      // docfecemi
    private String comprobante;       // docnrocompleto (001-001-0000001)
    private String timbrado;          // timbrado.timnumero
    private String ruc;               // docliruc (snapshot)
    private String cliente;           // doclirazon (snapshot)
    private String condicion;         // C = Contado, R = Crédito
    private String moneda;            // código ISO (PYG, USD, EUR)
    private double total;             // doctotal
    private String estado;            // EMITIDO / ANULADO
}
