package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Timbrado {
    private long timid;
    private String timtipdoc;        // FK a tipo_documento.tdocodigo
    private String timnumero;        // 8 dígitos DNIT
    private String timmodalid;       // P preimpreso, A autoimpresor, E electrónico
    private String timestab;
    private String timpunexp;
    private Integer timnrodesde;     // nullable en modalidad E
    private Integer timnrohasta;     // nullable en modalidad E
    private int timnroactual;
    private LocalDate timfecini;
    private LocalDate timfecvto;     // nullable en modalidad E
    private boolean timactivo;
}
