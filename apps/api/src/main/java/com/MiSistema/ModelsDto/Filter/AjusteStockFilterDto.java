package com.MiSistema.ModelsDto.Filter;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Data
public class AjusteStockFilterDto extends DefaultFilter {
    private LocalDate fecha;      // nullable — si null no filtra por fecha
    private Long depositoId;      // nullable — si null no filtra por depósito
}
