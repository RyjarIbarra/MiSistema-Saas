package com.MiSistema.Implementacion;

import com.MiSistema.Modelos.MovimientoStock;
import com.MiSistema.Services.MovimientoStockService;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

@Service
public class MovimientoStockImpl implements MovimientoStockService {

    @Override
    public void insert(MovimientoStock movimiento, String origen, Connection conn) throws SQLException {
        movimiento.setOrigen_movimiento(origen);

        String sql = "INSERT INTO public.movimiento_stock(" +
                "id_producto, id_deposito, origen_movimiento, tipo_movimiento, " +
                "cantidad, id_referencia, documento_referencia, fecha_movimiento, observaciones) " +
                "VALUES (?, ?, ?, ?::tipo_movimiento_enum, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?);";

        try (PreparedStatement stmt = conn.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
            stmt.setLong(1, movimiento.getId_producto());
            stmt.setLong(2, movimiento.getId_deposito());
            stmt.setString(3, movimiento.getOrigen_movimiento());
            stmt.setString(4, movimiento.getTipo_movimiento());
            stmt.setDouble(5, movimiento.getCantidad());
            stmt.setString(6, movimiento.getId_referencia());
            stmt.setString(7, movimiento.getDocumento_referencia());
            stmt.setTimestamp(8, movimiento.getFecha_movimiento() != null
                    ? Timestamp.valueOf(movimiento.getFecha_movimiento()) : null);
            stmt.setString(9, movimiento.getObservaciones());
            stmt.execute();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    movimiento.setId_movimiento(rs.getLong("id_movimiento"));
                }
            }
        }
    }
}
