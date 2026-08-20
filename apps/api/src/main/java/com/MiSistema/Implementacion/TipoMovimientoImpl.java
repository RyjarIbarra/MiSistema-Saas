package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.TipoMovimiento;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.TipoMovimientoService;
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
public class TipoMovimientoImpl implements TipoMovimientoService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<TipoMovimiento>> list(DefaultFilter filtro) {
        List<TipoMovimiento> arrayList = new ArrayList<>();
        long totalRecords = 0;
        String texto = filtro.getTexto() != null ? filtro.getTexto() : "";
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(
                     "SELECT * FROM public.tipo_movimiento WHERE (tmocodigo ILIKE ? OR tmodescri ILIKE ?) " +
                     "ORDER BY tmoorden LIMIT ? OFFSET ?");
             PreparedStatement stmtCount = conn.prepareStatement(
                     "SELECT count(*) AS totalRecords FROM public.tipo_movimiento WHERE (tmocodigo ILIKE ? OR tmodescri ILIKE ?)")
        ) {
            stmt.setString(1, "%" + texto + "%");
            stmt.setString(2, "%" + texto + "%");
            stmt.setLong(3, filtro.getLimit());
            stmt.setLong(4, filtro.getOffset());

            stmtCount.setString(1, "%" + texto + "%");
            stmtCount.setString(2, "%" + texto + "%");
            try (ResultSet rsC = stmtCount.executeQuery()) {
                rsC.next();
                totalRecords = rsC.getLong("totalRecords");
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
    public ResponseEntity<DefaultResponse<TipoMovimiento>> getByCodigo(String codigo) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.tipo_movimiento WHERE tmocodigo = ?")
        ) {
            stmt.setString(1, codigo);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return ResponseBuilder.ok(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Tipo de movimiento no encontrado.");
    }

    @Override
    public ResponseEntity<DefaultResponse<TipoMovimiento>> insert(TipoMovimiento t) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.tipo_movimiento(" +
                     "tmocodigo, tmodescri, tmosigno, tmotransfer, tmorefext, tmobenefic, tmomanual, tmoorden, tmoactivo) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);")
        ) {
            bindTipo(stmt, t);
            stmt.execute();
            return ResponseBuilder.ok(t);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<TipoMovimiento>> update(TipoMovimiento t) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.tipo_movimiento SET " +
                     "tmodescri=?, tmosigno=?, tmotransfer=?, tmorefext=?, tmobenefic=?, tmomanual=?, tmoorden=?, tmoactivo=? " +
                     "WHERE tmocodigo=?;")
        ) {
            stmt.setString(1, t.getTmodescri());
            stmt.setInt(2, t.getTmosigno());
            stmt.setBoolean(3, t.isTmotransfer());
            stmt.setBoolean(4, t.isTmorefext());
            stmt.setBoolean(5, t.isTmobenefic());
            stmt.setBoolean(6, t.isTmomanual());
            stmt.setInt(7, t.getTmoorden());
            stmt.setBoolean(8, t.isTmoactivo());
            stmt.setString(9, t.getTmocodigo());
            stmt.execute();
            return ResponseBuilder.ok(t);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    /** Baja lógica: el tipo no se borra, se desactiva (puede estar referenciado por movimientos). */
    @Override
    public ResponseEntity<DefaultResponse<TipoMovimiento>> delete(String codigo) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.tipo_movimiento SET tmoactivo = FALSE WHERE tmocodigo = ?;")
        ) {
            stmt.setString(1, codigo);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    private void bindTipo(PreparedStatement stmt, TipoMovimiento t) throws SQLException {
        stmt.setString(1, t.getTmocodigo());
        stmt.setString(2, t.getTmodescri());
        stmt.setInt(3, t.getTmosigno());
        stmt.setBoolean(4, t.isTmotransfer());
        stmt.setBoolean(5, t.isTmorefext());
        stmt.setBoolean(6, t.isTmobenefic());
        stmt.setBoolean(7, t.isTmomanual());
        stmt.setInt(8, t.getTmoorden());
        stmt.setBoolean(9, t.isTmoactivo());
    }

    private TipoMovimiento mapRow(ResultSet rs) throws SQLException {
        TipoMovimiento t = new TipoMovimiento();
        t.setTmocodigo(rs.getString("tmocodigo"));
        t.setTmodescri(rs.getString("tmodescri"));
        t.setTmosigno(rs.getInt("tmosigno"));
        t.setTmotransfer(rs.getBoolean("tmotransfer"));
        t.setTmorefext(rs.getBoolean("tmorefext"));
        t.setTmobenefic(rs.getBoolean("tmobenefic"));
        t.setTmomanual(rs.getBoolean("tmomanual"));
        t.setTmoorden(rs.getInt("tmoorden"));
        t.setTmoactivo(rs.getBoolean("tmoactivo"));
        return t;
    }
}
