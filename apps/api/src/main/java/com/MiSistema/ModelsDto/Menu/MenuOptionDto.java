package com.MiSistema.ModelsDto.Menu;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MenuOptionDto {
    private String key;          // system_option.option_key
    private String module;       // modulo.modulo_nombre
    private String label;        // system_option.option_name
    private String path;         // system_option.route_path (nullable)
    private String icon;         // system_option.icon_name (nullable)
    private int sort_order;      // system_option.sort_order
}
