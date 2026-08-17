package com.MiSistema.Config;

import com.MiSistema.Connection.ConnectionU;
import com.MiSistema.ModelsDto.Login.UserCredentials;
import com.MiSistema.ModelsDto.Login.BDetails;
import com.MiSistema.ModelsDto.Login.UserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@Service
@RequiredArgsConstructor
public class LicenciaServiceImpl {

    private final ConnectionU connectionU;

    public UserCredentials userCredentials(String user) {
        String queryUser = """
                Select usu.id_licencia, empresa_ruc, id_usuario
                from usuarios as usu
                inner join licencias as lic on lic.id_licencia = usu.id_licencia
                where usu.email = ?
                """;
        try (Connection connection = connectionU.getConnection()) {
            PreparedStatement psUser = connection.prepareStatement(queryUser);
            psUser.setString(1, user);
            try(ResultSet rs = psUser.executeQuery()) {
                if(rs.next())
                    return new UserCredentials(rs.getLong("id_licencia"), rs.getString("empresa_ruc"), rs.getLong("id_usuario"));
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public BDetails BDetails(String user) {
        String queryUser = """
                Select * from licencias
                where db_name = ?
                """;
        try (Connection connection = connectionU.getConnection()) {
            PreparedStatement psUser = connection.prepareStatement(queryUser);
            psUser.setString(1, user);
            try(ResultSet rs = psUser.executeQuery()){
                if(rs.next())
                    return new BDetails(rs.getString("db_host"), rs.getLong("db_port"), rs.getString("db_user"), rs.getString("db_password"));
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

}
