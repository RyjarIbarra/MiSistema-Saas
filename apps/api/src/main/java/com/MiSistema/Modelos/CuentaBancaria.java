package com.MiSistema.Modelos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Cuenta bancaria de la empresa. La moneda define la de todos sus movimientos. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class CuentaBancaria {
    private long cbaid;
    private long cbabanid;          // FK banco
    private String cbanumero;
    private String cbaalias;
    private String cbatipo;         // C corriente, A ahorro
    private String cbamoneda;       // FK moneda(codigo)
    private String cbatitular;
    private String cbasucursal;     // FK sucursal(sucest), opcional
    private BigDecimal cbasaldoini;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate cbafecini;
    private BigDecimal cbasobregiro;
    private String cbaobserva;
    private boolean cbaactivo;
    private LocalDateTime cbacreated;
    private Integer cbausucrea;

    // Campos de solo lectura para mostrar en la grilla (vienen de los JOIN)
    private String bannombre;
    private String monedadesc;
}
