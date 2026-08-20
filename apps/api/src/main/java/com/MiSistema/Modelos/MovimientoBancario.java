package com.MiSistema.Modelos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Un movimiento del libro bancario (lo que la empresa registró en una cuenta). */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class MovimientoBancario {
    private long mbaid;
    private long mbacbaid;        // FK cuenta
    private String mbatipo;       // FK tipo_movimiento
    private int mbanumero;        // correlativo por cuenta (lo asigna la función)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate mbafecha;
    private BigDecimal mbaimporte; // siempre positivo
    private String mbaconcepto;
    private String mbarefext;
    private String mbacontrapar;
    private String mbacontraruc;
    private String mbaorigen;
    private String mbaestado;
    private String mbamotanul;
    private LocalDateTime mbafecanul;
    private String mbaobserva;
    private Integer mbausucrea;

    // Solo lectura (del JOIN con tipo_movimiento)
    private String tmodescri;
    private int tmosigno;
}
