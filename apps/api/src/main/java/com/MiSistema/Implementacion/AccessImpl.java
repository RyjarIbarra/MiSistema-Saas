package com.MiSistema.Implementacion;

import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Access;
import com.MiSistema.Modelos.AccessLevel;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.AccessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccessImpl implements AccessService {

    private final DataSourceManager dsManager;

    @Override
    public ResponseEntity<DefaultResponse<Access>> list(DefaultFilter defaultFilter) {
        List<Access> arrayList = new ArrayList<>();
        long totalRecords = 0;
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT id, name, description, active FROM public.access " +
                     "WHERE (name ilike ? or description ilike ?) ORDER BY name LIMIT ? OFFSET ?");
             PreparedStatement stmtCount = conn.prepareStatement("SELECT count(*) AS totalRecords FROM public.access " +
                     "WHERE (name ilike ? or description ilike ?)")
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
                    Access a = new Access();
                    a.setId(rs.getLong("id"));
                    a.setName(rs.getString("name"));
                    a.setDescription(rs.getString("description"));
                    a.setActive(rs.getBoolean("active"));
                    // permissions queda en null — el front solo necesita la cabecera en /list
                    arrayList.add(a);
                }
            }
            return ResponseBuilder.ok(arrayList, totalRecords);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Access>> getById(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("SELECT id, name, description, active FROM public.access WHERE id = ?")
        ) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Access a = new Access();
                    a.setId(rs.getLong("id"));
                    a.setName(rs.getString("name"));
                    a.setDescription(rs.getString("description"));
                    a.setActive(rs.getBoolean("active"));
                    a.setPermissions(loadPermissions(conn, a.getId()));
                    return ResponseBuilder.ok(a);
                }
            }
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
        return ResponseBuilder.error("Acceso no encontrado.");
    }

    @Override
    public ResponseEntity<DefaultResponse<Access>> insert(Access access) {
        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.access(name, description, active) " +
                    "VALUES (?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS)
            ) {
                stmt.setString(1, access.getName());
                stmt.setString(2, access.getDescription());
                stmt.setBoolean(3, access.isActive());
                stmt.execute();
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    rs.next();
                    access.setId(rs.getLong("id"));
                }
            }

            insertPermissions(conn, access.getId(), access.getPermissions());
            access.setPermissions(loadPermissions(conn, access.getId()));

            conn.commit();
            return ResponseBuilder.ok(access);
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        } finally {
            close(conn);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Access>> update(Access access) {
        Connection conn = null;
        try {
            conn = dsManager.getDataSource();
            conn.setAutoCommit(false);

            try (PreparedStatement stmt = conn.prepareStatement("UPDATE public.access SET " +
                    "name=?, description=?, active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?;")
            ) {
                stmt.setString(1, access.getName());
                stmt.setString(2, access.getDescription());
                stmt.setBoolean(3, access.isActive());
                stmt.setLong(4, access.getId());
                stmt.execute();
            }

            // Replace total: borro los permisos actuales y reinserto la lista recibida
            deletePermissions(conn, access.getId());
            insertPermissions(conn, access.getId(), access.getPermissions());
            access.setPermissions(loadPermissions(conn, access.getId()));

            conn.commit();
            return ResponseBuilder.ok(access);
        } catch (SQLException e) {
            rollback(conn);
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        } finally {
            close(conn);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Access>> delete(long id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.access WHERE id=?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    // ---------- Permisos (hijos) ----------

    private void insertPermissions(Connection conn, long accessId, List<AccessLevel> permissions) throws SQLException {
        if (permissions == null || permissions.isEmpty()) {
            return;
        }
        try (PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.access_level(" +
                "access_id, module_key, module_name, option_name, can_view, can_create, can_update, can_delete) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?);")
        ) {
            for (AccessLevel p : permissions) {
                stmt.setLong(1, accessId);
                stmt.setString(2, p.getKey());
                stmt.setString(3, p.getModule());
                stmt.setString(4, p.getOption());
                stmt.setBoolean(5, p.isView());
                stmt.setBoolean(6, p.isCreate());
                stmt.setBoolean(7, p.isUpdate());
                stmt.setBoolean(8, p.isDelete());
                stmt.addBatch();
            }
            stmt.executeBatch();
        }
    }

    private void deletePermissions(Connection conn, long accessId) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.access_level WHERE access_id=?;")) {
            stmt.setLong(1, accessId);
            stmt.execute();
        }
    }

    private List<AccessLevel> loadPermissions(Connection conn, long accessId) throws SQLException {
        List<AccessLevel> permissions = new ArrayList<>();
        try (PreparedStatement stmt = conn.prepareStatement("SELECT module_key, module_name, option_name, " +
                "can_view, can_create, can_update, can_delete FROM public.access_level " +
                "WHERE access_id = ? ORDER BY module_name, option_name")
        ) {
            stmt.setLong(1, accessId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    AccessLevel p = new AccessLevel();
                    p.setKey(rs.getString("module_key"));
                    p.setModule(rs.getString("module_name"));
                    p.setOption(rs.getString("option_name"));
                    p.setView(rs.getBoolean("can_view"));
                    p.setCreate(rs.getBoolean("can_create"));
                    p.setUpdate(rs.getBoolean("can_update"));
                    p.setDelete(rs.getBoolean("can_delete"));
                    permissions.add(p);
                }
            }
        }
        return permissions;
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
