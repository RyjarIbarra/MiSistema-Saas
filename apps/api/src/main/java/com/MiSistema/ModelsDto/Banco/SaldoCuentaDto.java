package com.MiSistema.ModelsDto.Banco;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Saldo de libro de una cuenta (de la vista v_saldo_cuenta). */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class SaldoCuentaDto {
    private long cbaid;
    private String cbaalias;
    private String bannombre;
    private String cbanumero;
    private String cbamoneda;
    private BigDecimal cbasaldoini;
    private BigDecimal movimientos;
    private BigDecimal saldo;
    private BigDecimal cbasobregiro;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ultimoMovimiento;
}
