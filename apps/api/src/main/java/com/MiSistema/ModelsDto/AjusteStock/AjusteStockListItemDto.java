package com.MiSistema.ModelsDto.AjusteStock;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AjusteStockListItemDto {
    private long ajstid;
    private LocalDate fecha;
    private long depositoId;
    private String deposito;
    private String descripcion;         // ajstmotivo
    private int cantidadProductos;
    private double totalMovimiento;
    private int salidas;                // count de líneas tipo SALIDA
    private int entradas;               // count de líneas tipo ENTRADA
    private String estado;              // 'CONFIRMADO' | 'BORRADOR' | 'ANULADO'
}
