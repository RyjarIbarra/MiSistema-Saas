package com.MiSistema.Services;

import com.MiSistema.Modelos.Moneda;
import com.MiSistema.ModelsDto.DefaultResponse;
import org.springframework.http.ResponseEntity;

public interface MonedaService extends DefaultService<Moneda> {
    ResponseEntity<DefaultResponse<Moneda>> getById(String codigo);
    ResponseEntity<DefaultResponse<Moneda>> delete(String codigo);
}
