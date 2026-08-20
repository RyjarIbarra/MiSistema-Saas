package com.MiSistema.Modelos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Comprobante del proveedor que la orden cancela (total o parcialmente). */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrdenPagoImputacion {
    private long opiid;
    private long opiopaid;
    private int opiorden;
    private Long opidocid;          // FK futura a compras
    private String opitipdoc;
    private String opitimbrado;
    private String opiestab;
    private String opipunexp;
    private Integer opinumero;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate opifecemi;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate opifecvto;
    private BigDecimal opitotdoc;
    private BigDecimal opiimporte;
    private boolean opiacuenta;
    private String opiobserva;
}
