package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Medio con que se cancela la orden: efectivo, cheque propio, transferencia, cheque de tercero o compensación. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrdenPagoMedio {
    private long opmid;
    private long opmopaid;
    private int opmorden;
    private String opmforma;        // EFECTIVO, CHEQUE, TRANSFER, CHEQUE_TER, COMPENSA
    private BigDecimal opmimporte;
    private Long opmchpid;          // cheque propio
    private Long opmchtid;          // cheque de tercero endosado
    private Long opmmbaid;          // movimiento de la transferencia
    private Long opmcajaid;
    private String opmrefext;
    private String opmobserva;

    // Solo lectura para mostrar el instrumento
    private String instrumentoDesc;
}
