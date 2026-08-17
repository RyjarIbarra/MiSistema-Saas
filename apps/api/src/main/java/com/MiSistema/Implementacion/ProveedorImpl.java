package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Proveedor;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.ProveedorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProveedorImpl implements ProveedorService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<Proveedor>> list(DefaultFilter defaultFilter) {
        List<Proveedor> arrayList = new ArrayList<>();
        long totalRecords;
        String texto = defaultFilter.getTexto() != null ? defaultFilter.getTexto() : "";

        String sql = "SELECT * FROM public.proveedor " +
                "WHERE (prvrazon ILIKE ? OR prvruc ILIKE ?) " +
                "ORDER BY prvrazon " +
                "LIMIT ? OFFSET ?";
        String countSql = "SELECT count(*) AS totalRecords FROM public.proveedor " +
                "WHERE (prvrazon ILIKE ? OR prvruc ILIKE ?)";

        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement(sql);
             PreparedStatement stmtCount = conn.prepareStatement(countSql)
        ) {
            stmt.setString(1, "%" + texto + "%");
            stmt.setString(2, "%" + texto + "%");
            stmt.setLong(3, defaultFilter.getLimit());
            stmt.setLong(4, defaultFilter.getOffset());

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
    public ResponseEntity<DefaultResponse<Proveedor>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM public.proveedor WHERE prvid = ?")
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
        return ResponseBuilder.error("Proveedor no encontrado.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Proveedor>> insert(Proveedor proveedor) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.proveedor(" +
                     "prvrazon, prvruc, prv_contrib, prv_naturaleza, tipo_documento, " +
                     "prvtelefono, prvemail, prvcontacto, prvobserva) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            bindProveedor(stmt, proveedor);
            stmt.execute();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                proveedor.setPrvid(rs.getLong("prvid"));
            }
            return ResponseBuilder.ok(proveedor);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Proveedor>> update(Proveedor proveedor) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.proveedor SET " +
                     "prvrazon=?, prvruc=?, prv_contrib=?, prv_naturaleza=?, tipo_documento=?, " +
                     "prvtelefono=?, prvemail=?, prvcontacto=?, prvobserva=? " +
                     "WHERE prvid=?;")
        ) {
            int idx = bindProveedor(stmt, proveedor);
            stmt.setLong(idx, proveedor.getPrvid());
            stmt.execute();
            return ResponseBuilder.ok(proveedor);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Proveedor>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.proveedor WHERE prvid=?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // Vincula las 9 columnas del INSERT/UPDATE en orden y devuelve el siguiente índice libre.
    private int bindProveedor(PreparedStatement stmt, Proveedor p) throws SQLException {
        int i = 1;
        stmt.setString(i++, p.getPrvrazon());
        stmt.setString(i++, p.getPrvruc());
        stmt.setInt(i++, p.getPrv_contrib());
        stmt.setInt(i++, p.getPrv_naturaleza());
        stmt.setObject(i++, p.getTipo_documento());
        stmt.setString(i++, p.getPrvtelefono());
        stmt.setString(i++, p.getPrvemail());
        stmt.setString(i++, p.getPrvcontacto());
        stmt.setString(i++, p.getPrvobserva());
        return i;
    }

    private Proveedor mapRow(ResultSet rs) throws SQLException {
        Proveedor p = new Proveedor();
        p.setPrvid(rs.getLong("prvid"));
        p.setPrvrazon(rs.getString("prvrazon"));
        p.setPrvruc(rs.getString("prvruc"));
        p.setPrv_contrib(rs.getInt("prv_contrib"));
        p.setPrv_naturaleza(rs.getInt("prv_naturaleza"));
        p.setTipo_documento((Integer) rs.getObject("tipo_documento"));
        p.setPrvtelefono(rs.getString("prvtelefono"));
        p.setPrvemail(rs.getString("prvemail"));
        p.setPrvcontacto(rs.getString("prvcontacto"));
        p.setPrvobserva(rs.getString("prvobserva"));
        Timestamp created = rs.getTimestamp("prvcreated");
        p.setPrvcreated(created != null ? created.toLocalDateTime() : null);
        return p;
    }
}
