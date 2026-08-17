package com.MiSistema.ModelsDto.Filter;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Data
public class VStockDetalladoFilter extends DefaultFilter {
    private long idDeposito;
}
