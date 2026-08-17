package com.MiSistema.Connection;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

@Service
public class ConnectionU {

    public Connection getConnection(){

        Properties properties = new Properties();

        // Se lee config.properties desde el classpath (funciona empaquetado en el JAR / Docker).
        // Antes se usaba new FileInputStream("src/main/resources/config.properties"), que rompia
        // dentro del contenedor porque esa ruta no existe en runtime.
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("config.properties")) {
            if (in != null) {
                properties.load(in);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        // Las variables de entorno (Docker/compose) pisan al config.properties.
        // Sin variables de entorno se usa el archivo -> se puede correr desde IntelliJ contra localhost.
        String host     = env("DB_HOST",     properties.getProperty("Usu_host"));
        String port     = env("DB_PORT",     properties.getProperty("Usu_port"));
        String database = env("DB_NAME",     properties.getProperty("Usu_database"));
        String usurious = env("DB_USER",     properties.getProperty("Usu_username"));
        String contrast = env("DB_PASSWORD", properties.getProperty("Usu_password"));

        Connection connection = null;

        try {
            String url = "jdbc:postgresql://" + host + ":" + port + "/" + database;
            connection = DriverManager.getConnection(url, usurious, contrast);

        }catch (SQLException e){
            throw new RuntimeException(e.getMessage());
        }

        return connection;

    }

    private static String env(String key, String fallback) {
        String value = System.getenv(key);
        return (value != null && !value.isBlank()) ? value : fallback;
    }

}
