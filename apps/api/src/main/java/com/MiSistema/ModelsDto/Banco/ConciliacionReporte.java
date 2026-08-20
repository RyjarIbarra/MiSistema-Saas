package com.MiSistema.ModelsDto.Banco;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Informe de conciliación de un extracto (vista v_conciliacion). */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ConciliacionReporte {
    private long extid;
    private long extcbaid;
    private String cbaalias;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate extfecini;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate extfecfin;
    private String extestado;
    private BigDecimal extsaldoini;
    private BigDecimal saldoBanco;          // extsaldofin
    private BigDecimal sumaPartidas;
    private BigDecimal errorCarga;          // (saldoini + suma) - saldofin
    private long partidasTotal;
    private long partidasConc;
    private long partidasAbiertas;
    private long movimAbiertos;
    private BigDecimal movimNoEnBanco;      // Σ movimientos sin vincular (cheques emitidos no cobrados, etc.)
    private BigDecimal partidasNoEnLibro;   // Σ partidas sin registrar en el libro
    private boolean completa;
}
