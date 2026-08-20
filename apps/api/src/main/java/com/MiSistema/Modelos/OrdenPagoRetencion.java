package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Retención impositiva (IVA/Renta) practicada al proveedor en la orden. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrdenPagoRetencion {
    private long oprid;
    private long opropaid;
    private String oprtipo;         // I (IVA) / R (Renta)
    private String oprconcepto;
    private BigDecimal oprbase;
    private BigDecimal oprtasa;
    private BigDecimal oprmonto;
    private BigDecimal oprmlmonto;
    private Long oprdocid;          // comprobante RET (opcional por ahora)
    private String oprperiodo;      // AAAAMM
}
