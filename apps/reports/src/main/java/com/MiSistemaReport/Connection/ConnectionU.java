package com.MiSistemaReport.Connection;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

@Service
public class ConnectionU {

    public Connection getConnection() {
        Properties properties = new Properties();

        // config.properties se lee del classpath para funcionar dentro del JAR / Docker.
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("config.properties")) {
            if (in != null) {
                properties.load(in);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        // Las variables de entorno pisan al archivo (Docker); sin ellas se usa config.properties (IntelliJ).
        String host     = env("DB_HOST",     properties.getProperty("Usu_host"));
        String port     = env("DB_PORT",     properties.getProperty("Usu_port"));
        String database = env("DB_NAME",     properties.getProperty("Usu_database"));
        String user     = env("DB_USER",     properties.getProperty("Usu_username"));
        String password = env("DB_PASSWORD", properties.getProperty("Usu_password"));

        try {
            String url = "jdbc:postgresql://" + host + ":" + port + "/" + database;
            return DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    private static String env(String key, String fallback) {
        String value = System.getenv(key);
        return (value != null && !value.isBlank()) ? value : fallback;
    }
}
