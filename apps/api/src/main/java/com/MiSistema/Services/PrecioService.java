package com.MiSistema.Services;

import com.MiSistema.Modelos.Precio_Producto;
import java.sql.Connection;
import java.util.List;

public interface PrecioService {
    List<Precio_Producto> list(long id, Connection c);
    boolean insert(List<Precio_Producto> t, Connection c);
}
