package com.MiSistema.ModelsDto.Banco;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** Filtro para listar movimientos del libro de una cuenta. */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class MovimientoFiltro {
    private long cbaid;          // cuenta obligatoria
    private String texto;
    private long limit;
    private long offset;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaDesde;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaHasta;
}
