package com.MiSistema.ModelsDto.Login;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserInfo {
    private long id_usuario;
    private String username;
    private String rol;
    private String email;
}
