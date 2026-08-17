package com.MiSistemaReport.ModelsDto.Report;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ClienteReporteRequest {

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaDesde;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaHasta;
}
