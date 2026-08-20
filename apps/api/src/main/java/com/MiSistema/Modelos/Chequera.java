package com.MiSistema.Modelos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Talonario de cheques recibido del banco para una cuenta. Controla el rango y el próximo número. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Chequera {
    private long chqid;
    private long chqcbaid;      // FK cuenta_bancaria
    private String chqserie;    // serie impresa (opcional)
    private int chqdesde;       // primer número del talonario
    private int chqhasta;       // último número
    private int chqactual;      // próximo número a utilizar
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate chqfecrec; // fecha de recepción
    private String chqobserva;
    private boolean chqactivo;

    // Solo lectura (del JOIN)
    private String cbaalias;
    private String cbamoneda;
    private String bannombre;
    private Integer disponibles;  // chqhasta - chqactual + 1
}
