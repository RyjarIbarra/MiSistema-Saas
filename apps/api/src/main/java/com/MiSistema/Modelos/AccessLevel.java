package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AccessLevel {
    private String key;       // se persiste como module_key
    private String module;    // se persiste como module_name
    private String option;    // se persiste como option_name
    private boolean view;
    private boolean create;
    private boolean update;
    private boolean delete;
}
