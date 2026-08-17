package com.MiSistemaReport.Config;

import com.MiSistemaReport.Connection.ConnectionU;
import com.MiSistemaReport.ModelsDto.Login.BDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Resuelve datos de la BD del tenant a partir del db_name que viene en el token.
 * Solo se usa desde DataSourceManager. No hay generación de tokens en este proyecto.
 */
@Service
@RequiredArgsConstructor
public class LicenciaServiceImpl {

    private final ConnectionU connectionU;

    public BDetails BDetails(String dbName) {
        String query = """
                Select * from licencias
                where db_name = ?
                """;
        try (Connection connection = connectionU.getConnection()) {
            PreparedStatement ps = connection.prepareStatement(query);
            ps.setString(1, dbName);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next())
                    return new BDetails(rs.getString("db_host"), rs.getLong("db_port"),
                            rs.getString("db_user"), rs.getString("db_password"));
            }
            return null;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
