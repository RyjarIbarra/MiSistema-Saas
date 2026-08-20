package com.MiSistema.ModelsDto.Banco;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Movimiento del libro dentro del período de un extracto, con lo ya imputado por vínculos. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class MovimientoConciliar {
    private long mbaid;
    private int mbanumero;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate mbafecha;
    private String mbatipo;
    private String tmodescri;
    private int tmosigno;           // +1 crédito, -1 débito
    private String mbaconcepto;
    private String mbarefext;
    private String mbaorigen;
    private BigDecimal mbaimporte;
    private BigDecimal imputado;    // ya vinculado
    private BigDecimal pendiente;   // mbaimporte - imputado
}
