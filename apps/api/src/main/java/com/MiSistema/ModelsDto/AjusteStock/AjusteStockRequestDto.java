package com.MiSistema.ModelsDto.AjusteStock;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AjusteStockRequestDto {
    private Long ajstid;                // opcional, no se usa en insert
    private LocalDate fecha;
    private long depositoId;
    private String motivo;
    private List<AjusteStockDetalleRequestDto> detalle;
}
