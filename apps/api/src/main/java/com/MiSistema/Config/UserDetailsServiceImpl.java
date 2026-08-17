package com.MiSistema.Config;

import com.MiSistema.Connection.ConnectionU;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final ConnectionU connectionU;

    public UserDetailsServiceImpl(ConnectionU connectionU) {
        this.connectionU = connectionU;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try (Connection connection = connectionU.getConnection()) {
            String sql = "SELECT username, password_hash, rol, activo, email FROM usuarios WHERE email = ?";
            PreparedStatement stmt = connection.prepareStatement(sql);
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();
            boolean RsStatus = rs.next();
            if (!RsStatus) {
                throw new RuntimeException("Usuario no encontrado: " + username);
            }
            if(!rs.getBoolean("activo")) {
                throw new RuntimeException("Usuario bloqueado: " + username);
            }

            String dbUsername = rs.getString("email");
            String dbPassword = rs.getString("password_hash");
            String role = rs.getString("rol");

            // 👇 Lista de roles/authorities
            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority(role));

            // 👇 Devuelve el usuario que Spring Security necesita
            return new User(dbUsername, dbPassword, authorities);

        } catch (SQLException e) {
            throw new UsernameNotFoundException("Error buscando usuario: " + username, e);
        }
    }



}

