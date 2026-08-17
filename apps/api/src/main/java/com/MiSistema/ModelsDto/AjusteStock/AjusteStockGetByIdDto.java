package com.MiSistema.ModelsDto.AjusteStock;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AjusteStockGetByIdDto {
    private long ajstid;
    private LocalDate fecha;
    private long depositoId;
    private String deposito;
    private String motivo;
    private String estado;
    private List<AjusteStockDetalleItemDto> detalle;
}
