package com.MiSistema.ModelsDto.Migracion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MigracionFilaError {
    private int fila;         // 1-indexed (incluye header)
    private String prodesc;   // descripción del producto si está disponible
    private String error;     // mensaje de error
}
