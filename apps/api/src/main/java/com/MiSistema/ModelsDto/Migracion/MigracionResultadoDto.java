package com.MiSistema.ModelsDto.Migracion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MigracionResultadoDto {
    private int totalRegistros;
    private int exitosos;
    private int fallidos;
    private List<Long> idsCreados;
    private List<MigracionFilaError> errores;
}
