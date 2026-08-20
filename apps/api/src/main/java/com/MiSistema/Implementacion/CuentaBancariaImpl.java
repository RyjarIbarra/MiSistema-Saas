package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.CuentaBancaria;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.CuentaBancariaService;
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
public class CuentaBancariaImpl implements CuentaBancariaService {

    private final DataSourceManager dsManager;

    private static final String SELECT_BASE =
            "SELECT c.*, b.bannombre, m.descripcion AS monedadesc " +
            "FROM public.cuenta_bancaria c " +
            "INNER JOIN public.banco b ON b.banid = c.cbabanid " +
            "LEFT JOIN public.moneda m ON m.codigo = c.cbamoneda ";

    @Override
    public ResponseEntity<DefaultResponse<CuentaBancaria>> list(DefaultFilter filtro) {
        List<CuentaBancaria> arrayList = new ArrayList<>();
        long totalRecords = 0;
        String texto = filtro.getTexto() != null ? filtro.getTexto() : "";
        String sql = SELECT_BASE +
                "WHERE (c.cbaalias ILIKE ? OR c.cbanumero ILIKE ? OR b.bannombre ILIKE ?) " +
                "ORDER BY c.cbaalias LIMIT ? OFFSET ?";
        String countSql = "SELECT count(*) AS totalRecords FROM public.cuenta_bancaria c " +
                "INNER JOIN public.banco b ON b.banid = c.cbabanid " +
                "WHERE (c.cbaalias ILIKE ? OR c.cbanumero ILIKE ? OR b.bannombre ILIKE ?)";
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql);
             PreparedStatement stmtCount = conn.prepareStatement(countSql)
        ) {
            stmt.setString(1, "%" + texto + "%");
            stmt.setString(2, "%" + texto + "%");
            stmt.setString(3, "%" + texto + "%");
            stmt.setLong(4, filtro.getLimit());
            stmt.setLong(5, filtro.getOffset());

            stmtCount.setString(1, "%" + texto + "%");
            stmtCount.setString(2, "%" + texto + "%");
            stmtCount.setString(3, "%" + texto + "%");
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
    public ResponseEntity<DefaultResponse<CuentaBancaria>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(SELECT_BASE + "WHERE c.cbaid = ?")
        ) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return ResponseBuilder.ok(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Cuenta bancaria no encontrada.");
    }

    @Override
    public ResponseEntity<DefaultResponse<CuentaBancaria>> insert(CuentaBancaria cba) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.cuenta_bancaria(" +
                     "cbabanid, cbanumero, cbaalias, cbatipo, cbamoneda, cbatitular, cbasucursal, " +
                     "cbasaldoini, cbafecini, cbasobregiro, cbaobserva, cbaactivo, cbausucrea) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            int idx = bindCuenta(stmt, cba);
            stmt.setObject(idx, cba.getCbausucrea());   // 13ª columna: cbausucrea
            stmt.execute();
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                cba.setCbaid(rs.getLong("cbaid"));
            }
            return ResponseBuilder.ok(cba);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<CuentaBancaria>> update(CuentaBancaria cba) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.cuenta_bancaria SET " +
                     "cbabanid=?, cbanumero=?, cbaalias=?, cbatipo=?, cbamoneda=?, cbatitular=?, cbasucursal=?, " +
                     "cbasaldoini=?, cbafecini=?, cbasobregiro=?, cbaobserva=?, cbaactivo=? WHERE cbaid=?;")
        ) {
            int idx = bindCuenta(stmt, cba);   // idx = 13, el UPDATE no toca cbausucrea
            stmt.setLong(idx, cba.getCbaid()); // WHERE cbaid = ?
            stmt.execute();
            return ResponseBuilder.ok(cba);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    /** Baja lógica: la cuenta no se borra, se desactiva (tiene movimientos históricos). */
    @Override
    public ResponseEntity<DefaultResponse<CuentaBancaria>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.cuenta_bancaria SET cbaactivo = FALSE WHERE cbaid = ?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // Vincula las 13 columnas comunes (insert) / 12 (update usa el mismo orden sin cbausucrea al final).
    private int bindCuenta(PreparedStatement stmt, CuentaBancaria c) throws SQLException {
        int i = 1;
        stmt.setLong(i++, c.getCbabanid());
        stmt.setString(i++, c.getCbanumero());
        stmt.setString(i++, c.getCbaalias());
        stmt.setString(i++, c.getCbatipo() != null ? c.getCbatipo() : "C");
        stmt.setString(i++, c.getCbamoneda());
        stmt.setString(i++, c.getCbatitular());
        stmt.setString(i++, c.getCbasucursal());
        stmt.setBigDecimal(i++, c.getCbasaldoini());
        stmt.setDate(i++, c.getCbafecini() != null ? Date.valueOf(c.getCbafecini()) : null);
        stmt.setBigDecimal(i++, c.getCbasobregiro());
        stmt.setString(i++, c.getCbaobserva());
        stmt.setBoolean(i++, c.isCbaactivo());
        return i;
    }

    private CuentaBancaria mapRow(ResultSet rs) throws SQLException {
        CuentaBancaria c = new CuentaBancaria();
        c.setCbaid(rs.getLong("cbaid"));
        c.setCbabanid(rs.getLong("cbabanid"));
        c.setCbanumero(rs.getString("cbanumero"));
        c.setCbaalias(rs.getString("cbaalias"));
        c.setCbatipo(rs.getString("cbatipo"));
        c.setCbamoneda(rs.getString("cbamoneda"));
        c.setCbatitular(rs.getString("cbatitular"));
        c.setCbasucursal(rs.getString("cbasucursal"));
        c.setCbasaldoini(rs.getBigDecimal("cbasaldoini"));
        Date fecini = rs.getDate("cbafecini");
        c.setCbafecini(fecini != null ? fecini.toLocalDate() : null);
        c.setCbasobregiro(rs.getBigDecimal("cbasobregiro"));
        c.setCbaobserva(rs.getString("cbaobserva"));
        c.setCbaactivo(rs.getBoolean("cbaactivo"));
        Timestamp created = rs.getTimestamp("cbacreated");
        c.setCbacreated(created != null ? created.toLocalDateTime() : null);
        c.setCbausucrea((Integer) rs.getObject("cbausucrea"));
        c.setBannombre(rs.getString("bannombre"));
        c.setMonedadesc(rs.getString("monedadesc"));
        return c;
    }
}
