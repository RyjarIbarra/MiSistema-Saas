package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Usuarios {
    private long id_usuario;
    private long id_licencia;
    private String username;
    private String password_hash;
    private String email;
    private String telefono;
    private String rol;
    private int nivel;
    private boolean activo;
    private LocalDateTime ultimo_login;
    private LocalDateTime creado_en;
    private LocalDateTime actualizado_en;
}
