package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.MovimientoStock;
import com.MiSistema.ModelsDto.AjusteStock.AjusteStockDetalleItemDto;
import com.MiSistema.ModelsDto.AjusteStock.AjusteStockDetalleRequestDto;
import com.MiSistema.ModelsDto.AjusteStock.AjusteStockGetByIdDto;
import com.MiSistema.ModelsDto.AjusteStock.AjusteStockListItemDto;
import com.MiSistema.ModelsDto.AjusteStock.AjusteStockRequestDto;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.AjusteStockFilterDto;
import com.MiSistema.Services.AjusteStockService;
import com.MiSistema.Services.MovimientoStockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AjusteStockImpl implements AjusteStockService {

    private static final String TIPO_SALIDA  = "SALIDA";
    private static final String TIPO_ENTRADA = "ENTRADA";
    private static final String ESTADO_CONFIRMADO = "CONFIRMADO";
    private static final String ESTADO_ANULADO    = "ANULADO";
    private static final String ORIGEN_AJUSTE    = "AJS";

    private final DataSourceManager dsManager;
    private final MovimientoStockService movimientoStockService;

    // ---------- LIST ----------

    @Override
    public ResponseEntity<DefaultResponse<AjusteStockListItemDto>> list(AjusteStockFilterDto filtro) {
        List<AjusteStockListItemDto> arrayList = new ArrayList<>();
        long totalRecords;
        String texto = filtro.getTexto() != null ? filtro.getTexto() : "";
        Date fecha = filtro.getFecha() != null ? Date.valueOf(filtro.getFecha()) : null;
        Long depositoId = filtro.getDepositoId();

        String whereFiltros = "WHERE a.ajstmotivo ILIKE ? " +
                "  AND (?::date IS NULL OR a.ajstfecha = ?::date) " +
                "  AND (?::bigint IS NULL OR a.ajstdep_id = ?::bigint) ";

        String sql = "SELECT a.ajstid, a.ajstfecha, a.ajstdep_id, dep.depnom AS deposito, " +
                "       a.ajstmotivo AS descripcion, a.ajstestado, " +
                "       COUNT(d.ajstdid) AS cantidad_productos, " +
                "       COALESCE(SUM(d.ajstdcantidad), 0) AS total_movimiento, " +
                "       COUNT(*) FILTER (WHERE d.ajstdtipo = 'SALIDA')  AS salidas, " +
                "       COUNT(*) FILTER (WHERE d.ajstdtipo = 'ENTRADA') AS entradas " +
                "FROM public.ajuste_stock a " +
                "INNER JOIN public.deposito dep ON dep.depid = a.ajstdep_id " +
                "LEFT JOIN public.ajuste_stock_detalle d ON d.ajstdajst_id = a.ajstid " +
                whereFiltros +
                "GROUP BY a.ajstid, a.ajstfecha, a.ajstdep_id, dep.depnom, a.ajstmotivo, a.ajstestado " +
                "ORDER BY a.ajstfecha DESC, a.ajstid DESC " +
                "LIMIT ? OFFSET ?";

        String countSql = "SELECT count(*) AS totalRecords FROM public.ajuste_stock a " + whereFiltros;

        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql);
             PreparedStatement stmtCount = conn.prepareStatement(countSql)
        ) {
            // sql: 5 filtros + 2 paginación
            stmt.setString(1, "%" + texto + "%");
            stmt.setObject(2, fecha);
            stmt.setObject(3, fecha);
            stmt.setObject(4, depositoId);
            stmt.setObject(5, depositoId);
            stmt.setLong(6, filtro.getLimit());
            stmt.setLong(7, filtro.getOffset());

            // count: mismos 5 filtros
            stmtCount.setString(1, "%" + texto + "%");
            stmtCount.setObject(2, fecha);
            stmtCount.setObject(3, fecha);
            stmtCount.setObject(4, depositoId);
            stmtCount.setObject(5, depositoId);
            try (ResultSet rsC = stmtCount.executeQuery()) {
                rsC.next();
                totalRecords = rsC.getLong("totalRecords");
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    AjusteStockListItemDto item = new AjusteStockListItemDto();
                    item.setAjstid(rs.getLong("ajstid"));
                    item.setFecha(rs.getDate("ajstfecha").toLocalDate());
                    item.setDepositoId(rs.getLong("ajstdep_id"));
                    item.setDeposito(rs.getString("deposito"));
                    item.setDescripcion(rs.getString("descripcion"));
                    item.setCantidadProductos(rs.getInt("cantidad_productos"));
                    item.setTotalMovimiento(rs.getDouble("total_movimiento"));
                    item.setSalidas(rs.getInt("salidas"));
                    item.setEntradas(rs.getInt("entradas"));
                    item.setEstado(rs.getString("ajstestado"));
                    arrayList.add(item);
                }
            }
            return ResponseBuilder.ok(arrayList, totalRecords);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // ---------- GET BY ID ----------

    @Override
    public ResponseEntity<DefaultResponse<AjusteStockGetByIdDto>> getById(long id) {
        try (Connection conn = dsManager.getDataSource()) {
            AjusteStockGetByIdDto dto = loadCabecera(conn, id);
            if (dto == null) return ResponseBuilder.error("Ajuste no encontrado.");
            dto.setDetalle(loadDetalle(conn, id));
            return ResponseBuilder.ok(dto);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // ---------- INSERT ----------

    @Override
    public ResponseEntity<DefaultResponse<AjusteStockGetByIdDto>> insert(AjusteStockRequestDto request) {
        // Validaciones básicas
        if (request.getDetalle() == null || request.getDetalle().isEmpty()) {
            return ResponseBuilder.error("El ajuste debe tener al menos un producto en el detalle.", HttpStatus.BAD_REQUEST);
        }
        if (request.getMotivo() == null || request.getMotivo().isBlank()) {
            return ResponseBuilder.error("El motivo es obligatorio.", HttpStatus.BAD_REQUEST);
        }
        if (request.getFecha() == null) {
            return ResponseBuilder.error("La fecha es obligatoria.", HttpStatus.BAD_REQUEST);
        }
        if (request.getDepositoId() <= 0) {
            return ResponseBuilder.error("El depósito es obligatorio.", HttpStatus.BAD_REQUEST);
        }

        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            long ajstid;
            try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.ajuste_stock(" +
                    "ajstfecha, ajstdep_id, ajstmotivo, ajstestado) VALUES (?, ?, ?, ?);",
                    PreparedStatement.RETURN_GENERATED_KEYS)
            ) {
                stmt.setDate(1, Date.valueOf(request.getFecha()));
                stmt.setLong(2, request.getDepositoId());
                stmt.setString(3, request.getMotivo());
                stmt.setString(4, ESTADO_CONFIRMADO);
                stmt.execute();
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    rs.next();
                    ajstid = rs.getLong("ajstid");
                }
            }

            // Procesar cada línea del detalle: validar payload e insertar. El stock queda intacto.
            for (AjusteStockDetalleRequestDto det : request.getDetalle()) {
                if (det.getCantidad() <= 0) {
                    throw new IllegalArgumentException("La cantidad debe ser mayor a 0 (producto " + det.getProductoId() + ").");
                }
                if (!TIPO_SALIDA.equals(det.getTipoMovimiento()) && !TIPO_ENTRADA.equals(det.getTipoMovimiento())) {
                    throw new IllegalArgumentException("Tipo de movimiento inválido para producto " + det.getProductoId() + ". Debe ser ENTRADA o SALIDA.");
                }

                // Snapshot: si el front no manda stock, se guarda 0
                insertDetalle(conn, ajstid, det, det.getStockActual(), det.getStockResultante());

                // Registra el movimiento de stock en la misma transacción
                MovimientoStock mov = new MovimientoStock();
                mov.setId_producto(det.getProductoId());
                mov.setId_deposito(request.getDepositoId());
                mov.setTipo_movimiento(det.getTipoMovimiento());
                mov.setCantidad(det.getCantidad());
                mov.setId_referencia(String.valueOf(ajstid));
                mov.setDocumento_referencia("Ajuste #" + ajstid);
                movimientoStockService.insert(mov, ORIGEN_AJUSTE, conn);
            }

            conn.commit();

            // Devolver el ajuste completo
            AjusteStockGetByIdDto dto = loadCabecera(conn, ajstid);
            assert dto != null;
            dto.setDetalle(loadDetalle(conn, ajstid));
            return ResponseBuilder.ok(dto);
        } catch (IllegalArgumentException e) {
            rollback(conn);
            return ResponseBuilder.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        } finally {
            close(conn);
        }
    }

    // ---------- ANULAR ----------

    @Override
    public ResponseEntity<DefaultResponse<String>> anular(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmtSel = conn.prepareStatement(
                     "SELECT ajstestado FROM public.ajuste_stock WHERE ajstid = ?");
             PreparedStatement stmtUpd = conn.prepareStatement(
                     "UPDATE public.ajuste_stock SET ajstestado = ?, ajstupdated_at = CURRENT_TIMESTAMP WHERE ajstid = ?")
        ) {
            stmtSel.setLong(1, id);
            try (ResultSet rs = stmtSel.executeQuery()) {
                if (!rs.next()) {
                    return ResponseBuilder.error("Ajuste no encontrado.", HttpStatus.NOT_FOUND);
                }
                if (ESTADO_ANULADO.equals(rs.getString("ajstestado"))) {
                    return ResponseBuilder.error("El ajuste ya está anulado.", HttpStatus.BAD_REQUEST);
                }
            }

            stmtUpd.setString(1, ESTADO_ANULADO);
            stmtUpd.setLong(2, id);
            stmtUpd.execute();

            return ResponseBuilder.ok("Ajuste anulado correctamente.");
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // ---------- Helpers ----------

    private void insertDetalle(Connection conn, long ajstid, AjusteStockDetalleRequestDto det,
                               double stockActual, double stockResult) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.ajuste_stock_detalle(" +
                "ajstdajst_id, ajstdpro_id, ajstdtipo, ajstdstock_actual, ajstdcantidad, ajstdstock_result) " +
                "VALUES (?, ?, ?, ?, ?, ?);")
        ) {
            stmt.setLong(1, ajstid);
            stmt.setLong(2, det.getProductoId());
            stmt.setString(3, det.getTipoMovimiento());
            stmt.setDouble(4, stockActual);
            stmt.setDouble(5, det.getCantidad());
            stmt.setDouble(6, stockResult);
            stmt.execute();
        }
    }

    private AjusteStockGetByIdDto loadCabecera(Connection conn, long id) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement(
                "SELECT a.ajstid, a.ajstfecha, a.ajstdep_id, dep.depnom AS deposito, a.ajstmotivo, a.ajstestado " +
                "FROM public.ajuste_stock a " +
                "INNER JOIN public.deposito dep ON dep.depid = a.ajstdep_id " +
                "WHERE a.ajstid = ?")
        ) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) return null;
                AjusteStockGetByIdDto dto = new AjusteStockGetByIdDto();
                dto.setAjstid(rs.getLong("ajstid"));
                dto.setFecha(rs.getDate("ajstfecha").toLocalDate());
                dto.setDepositoId(rs.getLong("ajstdep_id"));
                dto.setDeposito(rs.getString("deposito"));
                dto.setMotivo(rs.getString("ajstmotivo"));
                dto.setEstado(rs.getString("ajstestado"));
                return dto;
            }
        }
    }

    private List<AjusteStockDetalleItemDto> loadDetalle(Connection conn, long ajstid) throws SQLException {
        List<AjusteStockDetalleItemDto> lista = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement(
                "SELECT d.ajstdid, d.ajstdpro_id, p.proid AS codigo, p.prodesc AS producto, " +
                "       d.ajstdtipo, d.ajstdstock_actual, d.ajstdcantidad, d.ajstdstock_result " +
                "FROM public.ajuste_stock_detalle d " +
                "INNER JOIN public.producto p ON p.proid = d.ajstdpro_id " +
                "WHERE d.ajstdajst_id = ? " +
                "ORDER BY d.ajstdid")
        ) {
            stmt.setLong(1, ajstid);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    AjusteStockDetalleItemDto item = new AjusteStockDetalleItemDto();
                    item.setDetalleId(rs.getLong("ajstdid"));
                    item.setProductoId(rs.getLong("ajstdpro_id"));
                    item.setCodigo(rs.getString("codigo"));
                    item.setProducto(rs.getString("producto"));
                    item.setTipoMovimiento(rs.getString("ajstdtipo"));
                    item.setStockActual(rs.getDouble("ajstdstock_actual"));
                    item.setCantidad(rs.getDouble("ajstdcantidad"));
                    item.setStockResultante(rs.getDouble("ajstdstock_result"));
                    lista.add(item);
                }
            }
        }
        return lista;
    }

    private void rollback(Connection conn) {
        if (conn != null) {
            try { conn.rollback(); } catch (SQLException ex) { log.error("Error en rollback: ", ex); }
        }
    }

    private void close(Connection conn) {
        if (conn != null) {
            try { conn.close(); } catch (SQLException ex) { log.error("Error al cerrar conexión: ", ex); }
        }
    }
}
