package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AjusteStockDetalle {
    private long ajstdid;
    private long ajstdajst_id;
    private long ajstdpro_id;
    private String ajstdtipo;              // 'DESCUENTO' | 'AUMENTO'
    private double ajstdstock_actual;
    private double ajstdcantidad;
    private double ajstdstock_result;
    private LocalDateTime ajstdcreated_at;
}
