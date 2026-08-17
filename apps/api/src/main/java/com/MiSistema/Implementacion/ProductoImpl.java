package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Precio_Producto;
import com.MiSistema.Modelos.Producto;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.ModelsDto.Filter.VStockDetalladoFilter;
import com.MiSistema.ModelsDto.Venta.VentaPrecioProductoDto;
import com.MiSistema.ModelsDto.Venta.VentaPrecioProductoRequestDto;
import com.MiSistema.ModelsDto.View.ModalProducto;
import com.MiSistema.Services.PrecioService;
import com.MiSistema.Services.ProductoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductoImpl implements ProductoService {

    private final DataSourceManager dsManager;
    private final PrecioService precioService;

    @Override
    public ResponseEntity<DefaultResponse<Producto>> list(DefaultFilter defaultFilter) {
        List<Producto> arrayList = new ArrayList<>();
        long totalRecords = 0;
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.producto " +
                     "WHERE (prodesc ilike ? or gtin ilike ?) ORDER BY prodesc LIMIT ? OFFSET ?");
             PreparedStatement stmtCount = conn.prepareStatement("SELECT count(*) AS totalRecords FROM public.producto " +
                     "WHERE (prodesc ilike ? or gtin ilike ?)")
        ) {
            stmt.setString(1, "%" + defaultFilter.getTexto() + "%");
            stmt.setString(2, "%" + defaultFilter.getTexto() + "%");
            stmt.setLong(3, defaultFilter.getLimit());
            stmt.setLong(4, defaultFilter.getOffset());

            stmtCount.setString(1, "%" + defaultFilter.getTexto() + "%");
            stmtCount.setString(2, "%" + defaultFilter.getTexto() + "%");
            try (ResultSet rs = stmtCount.executeQuery()) {
                rs.next();
                totalRecords = rs.getLong("totalRecords");
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    arrayList.add(mapRow(rs));
                }
            }
            return ResponseBuilder.ok(arrayList, totalRecords);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Producto>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.producto WHERE proid = ?")
        ) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Producto producto = mapRow(rs);
                    producto.setPrecioList(precioService.list(producto.getProid(), conn));
                    return ResponseBuilder.ok(producto);
                }
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Producto no encontrado.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Producto>> insert(Producto producto) {
        long id;
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.producto(" +
                     "gtin, gtin_paquete, prodesc, " +
                     "tipo_producto, unidad, categoria, marca, ubicacion, " +
                     "afectacion_iva, tasa_iva, proporcion_iva, " +
                     "aplica_isc, tasa_isc, proporcion_isc, " +
                     "ncm, partida_arancelaria, pais_origen, " +
                     "dncp_nivel_general, dncp_nivel_especifico, " +
                     "ctrlstock, moddesc, modprec, stocknegativo, activo, proobs) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
                     PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            bindProducto(stmt, producto);
            stmt.execute();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                id = rs.getLong("proid");
                producto.setProid(id);
            }

            if (producto.getPrecioList() != null && !producto.getPrecioList().isEmpty()) {
                for (Precio_Producto precio : producto.getPrecioList()) {
                    precio.setId_producto(id);
                }
                precioService.insert(producto.getPrecioList(), conn);
            }

            return ResponseBuilder.ok(producto);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Producto>> update(Producto producto) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.producto SET " +
                     "gtin=?, gtin_paquete=?, prodesc=?, " +
                     "tipo_producto=?, unidad=?, categoria=?, marca=?, ubicacion=?, " +
                     "afectacion_iva=?, tasa_iva=?, proporcion_iva=?, " +
                     "aplica_isc=?, tasa_isc=?, proporcion_isc=?, " +
                     "ncm=?, partida_arancelaria=?, pais_origen=?, " +
                     "dncp_nivel_general=?, dncp_nivel_especifico=?, " +
                     "ctrlstock=?, moddesc=?, modprec=?, stocknegativo=?, activo=?, proobs=? " +
                     "WHERE proid=?;")
        ) {
            int idx = bindProducto(stmt, producto);
            stmt.setLong(idx, producto.getProid());
            stmt.execute();

            if (producto.getPrecioList() != null && !producto.getPrecioList().isEmpty()) {
                for (Precio_Producto precio : producto.getPrecioList()) {
                    precio.setId_producto(producto.getProid());
                }
                precioService.insert(producto.getPrecioList(), conn);
            }
            return ResponseBuilder.ok(producto);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Producto>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.producto WHERE proid=?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // Vincula las 25 columnas del INSERT/UPDATE en orden y devuelve el siguiente índice libre.
    private int bindProducto(PreparedStatement stmt, Producto p) throws SQLException {
        int i = 1;
        stmt.setString(i++, p.getGtin());
        stmt.setString(i++, p.getGtin_paquete());
        stmt.setString(i++, p.getProdesc());
        stmt.setInt(i++, p.getTipo_producto());
        stmt.setString(i++, p.getUnidad());
        stmt.setObject(i++, p.getCategoria());
        stmt.setObject(i++, p.getMarca());
        stmt.setObject(i++, p.getUbicacion());
        stmt.setInt(i++, p.getAfectacion_iva());
        stmt.setDouble(i++, p.getTasa_iva());
        stmt.setDouble(i++, p.getProporcion_iva());
        stmt.setBoolean(i++, p.isAplica_isc());
        stmt.setDouble(i++, p.getTasa_isc());
        stmt.setDouble(i++, p.getProporcion_isc());
        stmt.setString(i++, p.getNcm());
        stmt.setString(i++, p.getPartida_arancelaria());
        stmt.setString(i++, p.getPais_origen());
        stmt.setString(i++, p.getDncp_nivel_general());
        stmt.setString(i++, p.getDncp_nivel_especifico());
        stmt.setBoolean(i++, p.isCtrlstock());
        stmt.setBoolean(i++, p.isModdesc());
        stmt.setBoolean(i++, p.isModprec());
        stmt.setBoolean(i++, p.isStocknegativo());
        stmt.setBoolean(i++, p.isActivo());
        stmt.setString(i++, p.getProobs());
        return i;
    }

    private Producto mapRow(ResultSet rs) throws SQLException {
        Producto p = new Producto();
        p.setProid(rs.getLong("proid"));
        p.setGtin(rs.getString("gtin"));
        p.setGtin_paquete(rs.getString("gtin_paquete"));
        p.setProdesc(rs.getString("prodesc"));
        p.setTipo_producto(rs.getInt("tipo_producto"));
        p.setUnidad(rs.getString("unidad"));
        p.setCategoria((Integer) rs.getObject("categoria"));
        p.setMarca((Integer) rs.getObject("marca"));
        p.setUbicacion((Integer) rs.getObject("ubicacion"));
        p.setAfectacion_iva(rs.getInt("afectacion_iva"));
        p.setTasa_iva(rs.getDouble("tasa_iva"));
        p.setProporcion_iva(rs.getDouble("proporcion_iva"));
        p.setAplica_isc(rs.getBoolean("aplica_isc"));
        p.setTasa_isc(rs.getDouble("tasa_isc"));
        p.setProporcion_isc(rs.getDouble("proporcion_isc"));
        p.setNcm(rs.getString("ncm"));
        p.setPartida_arancelaria(rs.getString("partida_arancelaria"));
        p.setPais_origen(rs.getString("pais_origen"));
        p.setDncp_nivel_general(rs.getString("dncp_nivel_general"));
        p.setDncp_nivel_especifico(rs.getString("dncp_nivel_especifico"));
        p.setCtrlstock(rs.getBoolean("ctrlstock"));
        p.setModdesc(rs.getBoolean("moddesc"));
        p.setModprec(rs.getBoolean("modprec"));
        p.setStocknegativo(rs.getBoolean("stocknegativo"));
        p.setActivo(rs.getBoolean("activo"));
        p.setProobs(rs.getString("proobs"));
        Timestamp fReg = rs.getTimestamp("f_registro");
        p.setF_registro(fReg != null ? fReg.toLocalDateTime() : null);
        return p;
    }

    // ---------- Vista stock detallado ----------

    @Override
    public ResponseEntity<DefaultResponse<ModalProducto>> listModalProducto(VStockDetalladoFilter filtro) {
        List<ModalProducto> arrayList = new ArrayList<>();
        long totalRecords = 0;
        String texto = filtro.getTexto() != null ? filtro.getTexto() : "";

        String sql = """
        SELECT p.proid, p.gtin, p.prodesc AS producto, COALESCE(s.cantidad, 0) AS cantidad,\s
        case when p.tipo_producto = 2 then 'SERV' else concat(trim_scale(COALESCE(s.cantidad, 0)::numeric)::text, ' ', u.abreviatura) end AS stock_format\s
        FROM producto p\s
        JOIN unidad_medida u ON p.unidad = u.codigo\s
        LEFT JOIN stock s ON s.id_producto = p.proid\s
        AND s.id_deposito = ?
        WHERE p.activo = true
        AND p.prodesc ILIKE ?
        ORDER BY p.prodesc\s
        LIMIT ? OFFSET ?
        """;

        String countSql = "SELECT count(*) AS totalRecords FROM producto p " +
                "JOIN unidad_medida u ON p.unidad = u.codigo " +
                "WHERE p.activo = true " +
                "AND p.prodesc ILIKE ?";

        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql);
             PreparedStatement stmtCount = conn.prepareStatement(countSql)
        ) {
            stmt.setLong(1, filtro.getIdDeposito());
            stmt.setString(2, "%" + texto + "%");
            stmt.setLong(3, filtro.getLimit());
            stmt.setLong(4, filtro.getOffset());

            stmtCount.setString(1, "%" + texto + "%");
            try (ResultSet rsC = stmtCount.executeQuery()) {
                rsC.next();
                totalRecords = rsC.getLong("totalRecords");
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    ModalProducto v = new ModalProducto();
                    v.setProid(rs.getLong("proid"));
                    v.setGtin(rs.getString("gtin"));
                    v.setProducto(rs.getString("producto"));
                    v.setCantidad(rs.getDouble("cantidad"));
                    v.setStock_format(rs.getString("stock_format"));
                    arrayList.add(v);
                }
            }
            return ResponseBuilder.ok(arrayList, totalRecords);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // ---------- Precio de venta ----------

    @Override
    public ResponseEntity<DefaultResponse<VentaPrecioProductoDto>> precioVenta(VentaPrecioProductoRequestDto request) {
        if (request.getProductoId() <= 0) {
            return ResponseBuilder.error("productoId es obligatorio.");
        }
        if (request.getMoneda() == null || request.getMoneda().isBlank()) {
            return ResponseBuilder.error("moneda es obligatoria.");
        }

        // Si tipoPrecio = 0 → no filtra por tipo (devuelve todos los precios del producto/moneda).
        // Si tipoPrecio > 0 → filtra por ese tipo específico.
        String sql = "SELECT pp.id_producto AS producto_id, " +
                "       pp.tipo         AS tipo_precio, " +
                "       pp.moneda, " +
                "       pp.precio, " +
                "       p.tasa_iva      AS iva " +
                "FROM public.producto p " +
                "INNER JOIN public.precio_producto pp ON pp.id_producto = p.proid " +
                "WHERE p.proid = ? " +
                "  AND (? = 0 OR pp.tipo = ?) " +
                "  AND pp.moneda = ? " +
                "  AND COALESCE(pp.estado, TRUE) = TRUE " +
                "ORDER BY pp.tipo";

        List<VentaPrecioProductoDto> arrayList = new ArrayList<>();
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql)
        ) {
            stmt.setLong(1, request.getProductoId());
            stmt.setInt(2, request.getTipoPrecio());
            stmt.setInt(3, request.getTipoPrecio());
            stmt.setString(4, request.getMoneda());

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    VentaPrecioProductoDto dto = new VentaPrecioProductoDto();
                    dto.setProductoId(rs.getLong("producto_id"));
                    dto.setTipoPrecio(rs.getInt("tipo_precio"));
                    dto.setMoneda(rs.getString("moneda"));
                    dto.setPrecio(rs.getDouble("precio"));
                    dto.setIva(rs.getDouble("iva"));
                    arrayList.add(dto);
                }
            }

            if (arrayList.isEmpty()) {
                return ResponseBuilder.error("No existe precio configurado para el producto, tipo de precio y moneda seleccionados.");
            }
            return ResponseBuilder.ok(arrayList, arrayList.size());
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }
}
