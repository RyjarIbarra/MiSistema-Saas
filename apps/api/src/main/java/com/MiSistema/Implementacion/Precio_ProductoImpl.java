package com.MiSistema.Implementacion;

import com.MiSistema.Modelos.Precio_Producto;
import com.MiSistema.Services.PrecioService;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Service
public class Precio_ProductoImpl implements PrecioService {

    @Override
    public List<Precio_Producto> list(long id, Connection c) {
        List<Precio_Producto> precioList = new ArrayList<>();
        try (PreparedStatement ps = c.prepareStatement("select a.*, b.tipnom " +
                "from public.precio_producto as a " +
                "inner join tipoprecio as b on b.tipid = a.tipo " +
                "where id_producto = ?;")) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    precioList.add(new Precio_Producto(
                            rs.getLong("id_producto"),
                            rs.getLong("tipo"),
                            rs.getString("tipnom"),
                            rs.getString("moneda"),
                            rs.getDouble("precio"),
                            rs.getBoolean("estado")
                    ));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return precioList;
    }

    @Override
    public boolean insert(List<Precio_Producto> t, Connection c) {
        if (t == null || t.isEmpty()) {
            return true;
        }

        // Elimina todos los precios del producto.
        try (PreparedStatement ps = c.prepareStatement("DELETE FROM public.precio_producto WHERE id_producto = ?;")) {
            ps.setLong(1, t.get(0).getId_producto());
            ps.execute();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        // Inserta la lista de precios del producto.
        try (PreparedStatement ps = c.prepareStatement("INSERT INTO public.precio_producto(" +
                "id_producto, tipo, moneda, precio, estado) VALUES (?, ?, ?, ?, ?);")) {
            for (Precio_Producto p : t) {
                ps.setLong(1, p.getId_producto());
                ps.setLong(2, p.getTipo());
                ps.setString(3, p.getMoneda() != null ? p.getMoneda() : "PYG");
                ps.setDouble(4, p.getPrecio());
                ps.setBoolean(5, p.isEstado());
                ps.addBatch();
            }
            ps.executeBatch();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return true;
    }
}
