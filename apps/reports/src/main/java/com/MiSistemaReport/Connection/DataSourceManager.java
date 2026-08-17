package com.MiSistemaReport.Connection;

import com.MiSistemaReport.Config.LicenciaServiceImpl;
import com.MiSistemaReport.Config.SecurityUtils;
import com.MiSistemaReport.ModelsDto.Login.BDetails;
import com.MiSistemaReport.ModelsDto.Login.UserCredentials;
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
        assert creeds != null;
        if (dataSources.containsKey(creeds.getDb_name())) {
            return dataSources.get(creeds.getDb_name()).getConnection();
        }

        HikariDataSource dataSource = getHikariDataSource(creeds);
        dataSources.put(creeds.getDb_name(), dataSource);
        return dataSource.getConnection();
    }

    private HikariDataSource getHikariDataSource(UserCredentials creeds) {
        BDetails bDetails = licenciaService.BDetails(creeds.getDb_name());
        HikariConfig config = new HikariConfig();
        String url = "jdbc:postgresql://" + bDetails.getHost() + ":" + bDetails.getPort() + "/" + creeds.getDb_name();
        config.setJdbcUrl(url);
        config.setUsername(bDetails.getUser());
        config.setPassword(bDetails.getPassword());

        config.setMaximumPoolSize(5);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(1800000);

        return new HikariDataSource(config);
    }
}
