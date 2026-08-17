package com.MiSistema.Services;

import com.MiSistema.Modelos.Usuarios;
import com.MiSistema.ModelsDto.Login.UserInfo;

public interface UsuariosService extends DefaultService<Usuarios> {
    UserInfo userInfo(String email);
    String audit_sessions(long usuario_id);
}
