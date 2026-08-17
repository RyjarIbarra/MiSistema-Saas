package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Categoria {
    private long cat_id;
    private String cat_nom;
    private String cat_desc;
    private int fam_id;   // FK obligatoria a familia(fam_id)
}
