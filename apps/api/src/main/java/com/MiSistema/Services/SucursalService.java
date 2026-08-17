package com.MiSistema.Services;

import com.MiSistema.Modelos.Sucursal;
import com.MiSistema.ModelsDto.DefaultResponse;
import org.springframework.http.ResponseEntity;

public interface SucursalService extends DefaultService<Sucursal> {
    ResponseEntity<DefaultResponse<Sucursal>> getById(String sucest);
    ResponseEntity<DefaultResponse<Sucursal>> delete(String sucest);
}
