package com.MiSistema.Implementacion;

import com.MiSistema.Config.SecurityUtils;
import com.MiSistema.Connection.ConnectionU;
import com.MiSistema.Connection.DataSourceManager;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Modelos.Usuarios;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.ModelsDto.Login.UserCredentials;
import com.MiSistema.ModelsDto.Login.UserInfo;
import com.MiSistema.Services.UsuariosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuariosImpl implements UsuariosService {

    private final ConnectionU connectionU;
    private final DataSourceManager dsManager;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ResponseEntity<DefaultResponse<Usuarios>> list(DefaultFilter defaultFilter) {
        UserCredentials userCredentials = SecurityUtils.getUserCredentials();
        List<Usuarios> arrayList = new ArrayList<>();
        long totalRecords = 0;
        try (Connection conn = connectionU.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM usuarios where (username ilike ? or email ilike ?) and id_licencia = ? order by username limit ? offset ?");
             PreparedStatement stmt_count = conn.prepareStatement("SELECT count(*) as totalRecords FROM usuarios where (username ilike ? or email ilike ?) and id_licencia = ?")
        ) {

            stmt.setString(1, "%" + defaultFilter.getTexto() + "%");
            stmt.setString(2, "%" + defaultFilter.getTexto() + "%");
            stmt.setLong(3, userCredentials != null ? userCredentials.getId_licencia() : 0);
            stmt.setLong(4, defaultFilter.getLimit());
            stmt.setLong(5, defaultFilter.getOffset());

            stmt_count.setString(1, "%" + defaultFilter.getTexto() + "%");
            stmt_count.setString(2, "%" + defaultFilter.getTexto() + "%");
            stmt_count.setLong(3, userCredentials != null ? userCredentials.getId_licencia() : 0);
            try(ResultSet rs_count = stmt_count.executeQuery()){
                rs_count.next();
                totalRecords = rs_count.getLong("totalRecords");
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    //Timestamp timestamp = rs.getTimestamp("ultimo_login");
                    arrayList.add(new Usuarios(rs.getLong("id_usuario"), rs.getLong("id_licencia"), rs.getString("username"), "",
                            rs.getString("email"), rs.getString("telefono"), rs.getString("rol"), rs.getInt("nivel"), rs.getBoolean("activo"), null, null, null));
                }
            }
            return ResponseBuilder.ok(arrayList, totalRecords);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Usuarios>> getById(long id) {
        Usuarios usuarios = new Usuarios();
        try (Connection conn = connectionU.getConnection();
             PreparedStatement stmt = conn.prepareStatement("Select * from public.usuarios where id_usuario = ?")
        ) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                rs.next();
                usuarios.setId_usuario(rs.getLong("id_usuario"));
                usuarios.setId_licencia(rs.getLong("id_licencia"));
                usuarios.setUsername(rs.getString("username"));
                usuarios.setPassword_hash("");
                usuarios.setEmail(rs.getString("email"));
                usuarios.setTelefono(rs.getString("telefono"));
                usuarios.setRol(rs.getString("rol"));
                usuarios.setNivel(rs.getInt("nivel"));
                usuarios.setActivo(rs.getBoolean("activo"));
                Timestamp timestamp = rs.getTimestamp("ultimo_login");
                usuarios.setUltimo_login(timestamp != null ? timestamp.toLocalDateTime() : null);
                return ResponseBuilder.ok(usuarios);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Usuarios>> insert(Usuarios usuarios) {
        UserCredentials userCredentials = SecurityUtils.getUserCredentials();
        try (Connection conn = connectionU.getConnection();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.usuarios(id_licencia, username, password_hash, email, telefono, rol, nivel, activo)\n" +
                     "\tVALUES (?, ?, ?, ?, ?, ?, ?, ?);", PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            stmt.setLong(1, userCredentials != null ? userCredentials.getId_licencia() : 0);
            stmt.setString(2, usuarios.getUsername());
            stmt.setString(3, passwordEncoder.encode(usuarios.getPassword_hash()));
            stmt.setString(4, usuarios.getEmail());
            stmt.setString(5, usuarios.getTelefono());
            stmt.setString(6, usuarios.getRol());
            stmt.setInt(7, usuarios.getNivel());
            stmt.setBoolean(8, usuarios.isActivo());
            stmt.execute();

            try(ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                usuarios.setId_usuario(rs.getLong("id_usuario"));
            }

            return ResponseBuilder.ok(usuarios);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Usuarios>> update(Usuarios usuarios) {
        System.out.println(usuarios);
        try (Connection conn = connectionU.getConnection();
             PreparedStatement stmt = conn.prepareStatement("UPDATE public.usuarios set username=?, email=?, telefono=?, rol=?, nivel=?, activo=? \n" +
                     "\twhere id_usuario=?;")
        ) {
            stmt.setString(1, usuarios.getUsername());
            stmt.setString(2, usuarios.getEmail());
            stmt.setString(3, usuarios.getTelefono());
            stmt.setString(4, usuarios.getRol());
            stmt.setInt(5, usuarios.getNivel());
            stmt.setBoolean(6, usuarios.isActivo());
            stmt.setLong(7, usuarios.getId_usuario());
            stmt.execute();

            return ResponseBuilder.ok(usuarios);
        } catch (SQLException e) {
            log.error("SQLException: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<DefaultResponse<Usuarios>> delete(long id) {
        try (Connection conn = connectionU.getConnection();
             PreparedStatement stmt = conn.prepareStatement("DELETE FROM public.usuarios\n" +
                     "WHERE id_usuario = ?;")
        ) {
            stmt.setLong(1, id);
            stmt.execute();
            return ResponseBuilder.ok(null);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public UserInfo userInfo(String email) {
        String queryUser = """
                Select * from usuarios
                where email = ?
                """;
        try (Connection connection = connectionU.getConnection()) {
            PreparedStatement psUser = connection.prepareStatement(queryUser);
            psUser.setString(1, email);
            try(ResultSet rs = psUser.executeQuery()){
                if(rs.next())
                    return new UserInfo(rs.getLong("id_usuario"), rs.getString("username"), rs.getString("rol"), rs.getString("email"));
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String audit_sessions(long usuario_id) {
        try (Connection conn = dsManager.getDataSource();
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO public.audit_sessions(user_id) values (?);", PreparedStatement.RETURN_GENERATED_KEYS)
        ) {
            stmt.setLong(1, usuario_id);
            stmt.execute();
            long id_session = 0;
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                rs.next();
                id_session = rs.getLong("session_id");
            }
            return "Sessión registrada " + id_session;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

}
