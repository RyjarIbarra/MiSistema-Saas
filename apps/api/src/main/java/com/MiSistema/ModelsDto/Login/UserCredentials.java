package com.MiSistema.ModelsDto.Login;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserCredentials {
    private long id_licencia;
    private String db_name;
    private long user_id;
}
