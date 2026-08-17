package com.MiSistema.Services;

import com.MiSistema.Modelos.Timbrado;
import com.MiSistema.ModelsDto.DefaultResponse;
import org.springframework.http.ResponseEntity;

public interface TimbradoService extends DefaultService<Timbrado> {
    ResponseEntity<DefaultResponse<Timbrado>> actEstadoTim(long id);
}
