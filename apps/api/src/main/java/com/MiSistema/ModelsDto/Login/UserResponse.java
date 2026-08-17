package com.MiSistema.ModelsDto.Login;

import com.MiSistema.ModelsDto.Menu.MenuModuleDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserResponse {
    private long id_usuario;
    private String username;
    private String rol;
    private String email;
    private String itoken;
    private List<MenuModuleDto> menu;
}
