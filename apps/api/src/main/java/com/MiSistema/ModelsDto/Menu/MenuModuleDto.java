package com.MiSistema.ModelsDto.Menu;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MenuModuleDto {
    private String module;                 // modulo.modulo_nombre
    private long sort_order;               // modulo.sort_order
    private List<MenuOptionDto> children;
}
