package com.MiSistemaReport.ModelsDto.Report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ClienteReporteDto {
    private long cliid;
    private String cliruc;
    private String clinom;
    private String clitel;
    private String climail;
    private String clidir;
    private LocalDateTime clifec;
}
