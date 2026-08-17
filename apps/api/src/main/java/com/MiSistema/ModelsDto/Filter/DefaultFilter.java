package com.MiSistema.ModelsDto.Filter;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DefaultFilter {
    private String texto;
    private long limit;
    private long offset;
}
