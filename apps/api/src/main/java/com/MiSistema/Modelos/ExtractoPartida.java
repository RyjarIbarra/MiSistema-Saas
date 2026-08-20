package com.MiSistema.Modelos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Una línea del resumen bancario, tal como la informa la entidad. No se edita. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ExtractoPartida {
    private long expid;
    private long expextid;
    private int exporden;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expfecha;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expfecvalor;
    private String expdescri;
    private String expreferen;
    private BigDecimal expdebito;
    private BigDecimal expcredito;
    private BigDecimal expsaldo;
    private Integer expchecknro;
    private boolean expconcilia;
    private boolean expignorar;

    // Solo lectura: total imputado por vínculos
    private BigDecimal imputado;
}
