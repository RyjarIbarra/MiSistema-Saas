package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Deposito {
    private long depid;
    private String depnom;
    private String depdir;
    private String deptel;
}
