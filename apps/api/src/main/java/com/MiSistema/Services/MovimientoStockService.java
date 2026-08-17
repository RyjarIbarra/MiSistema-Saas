package com.MiSistema.Services;

import com.MiSistema.Modelos.MovimientoStock;

import java.sql.Connection;
import java.sql.SQLException;

public interface MovimientoStockService {
    /**
     * Inserta un movimiento de stock reutilizando la conexión del método que lo llama
     * (para que forme parte de la misma transacción). El origen se pasa por parámetro
     * para que cada módulo lo defina (ej: "AJS" para Ajuste de Stock).
     */
    void insert(MovimientoStock movimiento, String origen, Connection conn) throws SQLException;
}
