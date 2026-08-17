package com.MiSistemaReport;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

/**
 * Excluye UserDetailsServiceAutoConfiguration para que Spring NO genere
 * el usuario/password por defecto — este proyecto autentica solo por JWT.
 */
@SpringBootApplication(exclude = { UserDetailsServiceAutoConfiguration.class })
public class MiSistemaReportApplication {

	public static void main(String[] args) {
		SpringApplication.run(MiSistemaReportApplication.class, args);
	}

}
