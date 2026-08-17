package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AjusteStock {
    private long ajstid;
    private LocalDate ajstfecha;
    private long ajstdep_id;
    private String ajstmotivo;
    private String ajstestado;
    private LocalDateTime ajstcreated_at;
    private LocalDateTime ajstupdated_at;
}
