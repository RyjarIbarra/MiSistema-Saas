package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MovimientoStock {
    private long id_movimiento;
    private long id_producto;
    private long id_deposito;
    private String origen_movimiento;
    private String tipo_movimiento;      // 'ENTRADA' | 'SALIDA' (ENUM en BD)
    private double cantidad;
    private String id_referencia;        // ej: id del ajuste, factura, etc.
    private String documento_referencia; // ej: "Ajuste #15"
    private LocalDateTime fecha_movimiento;
    private String observaciones;
}
