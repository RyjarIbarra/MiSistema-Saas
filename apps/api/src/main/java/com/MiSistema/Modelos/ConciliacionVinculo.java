package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Vínculo entre una partida del extracto y un movimiento del libro. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ConciliacionVinculo {
    private long covid;
    private long covexpid;
    private long covmbaid;
    private BigDecimal covimporte;
    private boolean covauto;
    private String covcriterio;   // REFERENCIA, CHEQUE, IMPORTE_FECHA, MANUAL
    private LocalDateTime covcreated;
    private Integer covusucrea;
}
