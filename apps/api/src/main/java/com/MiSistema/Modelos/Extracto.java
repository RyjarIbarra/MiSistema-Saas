package com.MiSistema.Modelos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Cabecera del resumen bancario de un período sobre el que se ejecuta la conciliación. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Extracto {
    private long extid;
    private long extcbaid;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate extfecini;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate extfecfin;
    private BigDecimal extsaldoini;
    private BigDecimal extsaldofin;
    private String extestado;      // ABIERTO, CONCILIADO
    private BigDecimal extdiferenc;
    private LocalDateTime extfeccierre;
    private Integer extusucierre;
    private String extarchivo;
    private String extobserva;
    private LocalDateTime extcreated;

    // Solo lectura (del JOIN)
    private String cbaalias;
    private String cbamoneda;
    private String bannombre;
}
