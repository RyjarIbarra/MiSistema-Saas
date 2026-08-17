package com.MiSistema.Connection;

import com.MiSistema.Config.LicenciaServiceImpl;
import com.MiSistema.Config.SecurityUtils;
import com.MiSistema.ModelsDto.Login.UserCredentials;
import com.MiSistema.ModelsDto.Login.BDetails;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class DataSourceManager {
    private static final ConcurrentHashMap<String, DataSource> dataSources = new ConcurrentHashMap<>();
    private final LicenciaServiceImpl licenciaService;

    public Connection getDataSource() throws SQLException {

        UserCredentials creeds = SecurityUtils.getUserCredentials();
        // Si ya existe un pool para ese dbName, lo reutilizamos
        assert creeds != null;
        if (dataSources.containsKey(creeds.getDb_name())) {
            return dataSources.get(creeds.getDb_name()).getConnection();
        }

        // Crear un nuevo pool HikariConfig
        HikariDataSource dataSource = getHikariDataSource(creeds);

        dataSources.put(creeds.getDb_name(), dataSource);
        return dataSource.getConnection();
    }

    private HikariDataSource getHikariDataSource(UserCredentials creeds) {
        BDetails BDetails = licenciaService.BDetails(creeds.getDb_name());
        HikariConfig config = new HikariConfig();
        String url = "jdbc:postgresql://"+ BDetails.getHost()+":"+ BDetails.getPort()+"/" + creeds.getDb_name();
        config.setJdbcUrl(url);
        config.setUsername(BDetails.getUser());
        config.setPassword(BDetails.getPassword());

        config.setMaximumPoolSize(5);   // número máximo de conexiones
        config.setMinimumIdle(2);        // mínimo de conexiones ociosas
        config.setIdleTimeout(300000);   // 5 minutos
        config.setMaxLifetime(1800000);  // 30 minutos

        return new HikariDataSource(config);
    }
}
