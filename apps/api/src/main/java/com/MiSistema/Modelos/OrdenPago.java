package com.MiSistema.Modelos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** Orden de pago a un proveedor: imputa documentos, practica retenciones y define los medios de pago. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrdenPago {
    private long opaid;
    private int opanumero;
    private int opaejercicio;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate opafecha;
    private long opaprvid;
    private String opaprvrazon;
    private String opaprvruc;
    private Integer opaprvdv;
    private String opasucid;        // sucursal.sucest CHAR(3)
    private String opamoneda;
    private BigDecimal opatipcambio;
    private BigDecimal opatotimput;
    private BigDecimal opatotreten;
    private BigDecimal opatotneto;
    private BigDecimal opamltotneto;
    private String opaconcepto;
    private String opaestado;       // BORRADOR, APROBADA, PAGADA, ANULADA
    private LocalDateTime opafecaprob;
    private Integer opausuaprob;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate opafecpago;
    private String opamotanul;
    private LocalDateTime opafecanul;
    private Integer opausuanul;
    private String opaobserva;
    private LocalDateTime opacreated;
    private Integer opausucrea;

    // Detalle (transient, para alta/consulta)
    private List<OrdenPagoImputacion> imputaciones;
    private List<OrdenPagoRetencion> retenciones;
    private List<OrdenPagoMedio> medios;
}
