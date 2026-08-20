package com.MiSistema.Modelos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Cheque emitido por la empresa contra una cuenta propia. La emisión genera un movimiento de libro. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ChequePropio {
    private long chpid;
    private long chpchqid;        // FK chequera
    private long chpcbaid;        // FK cuenta (denormalizado)
    private int chpnumero;        // número del cheque (lo asigna la función)
    private boolean chpdiferido;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate chpfecemi;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate chpfecpago;  // fecha del movimiento de libro
    private BigDecimal chpimporte; // siempre positivo
    private String chpbenefic;
    private String chpbeneruc;
    private boolean chpalaorden;
    private boolean chpcruzado;
    private String chpconcepto;
    private String chpestado;      // EMITIDO, ENTREGADO, COBRADO, RECHAZADO, ANULADO
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate chpfecentr;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate chpfeccobro;
    private String chpmotivo;
    private Long chpmbaid;         // movimiento de libro de la emisión
    private Long chpmbarech;       // movimiento de reversión (rechazo)
    private Long chpopaid;         // orden de pago (Fase 2d)
    private String chpobserva;
    private LocalDateTime chpcreated;
    private Integer chpusucrea;

    // Solo lectura (del JOIN)
    private String cbaalias;
    private String cbamoneda;
    private String bannombre;
    private String chqserie;
}
