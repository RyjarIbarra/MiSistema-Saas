package com.MiSistema.ModelsDto.Banco;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Parámetros de una operación de cambio de estado sobre un cheque (propio o de tercero). */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ChequeAccion {
    private long id;
    private String motivo;        // rechazo / anulación / devolución
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;       // fecha de la operación (entrega, cobro, depósito, rechazo, endoso)
    private Long cbaid;            // depósito de cheque de tercero: cuenta destino
    private String referencia;     // depósito: referencia externa (boleta) — el tipo DCT la exige
    private String endosado;       // endoso: nombre del endosatario
}
