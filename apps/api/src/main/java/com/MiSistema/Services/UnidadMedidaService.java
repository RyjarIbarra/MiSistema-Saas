package com.MiSistema.Services;

import com.MiSistema.Modelos.UnidadMedida;
import com.MiSistema.ModelsDto.DefaultResponse;
import org.springframework.http.ResponseEntity;

public interface UnidadMedidaService extends DefaultService<UnidadMedida> {
    ResponseEntity<DefaultResponse<UnidadMedida>> getById(String codigo);
    ResponseEntity<DefaultResponse<UnidadMedida>> delete(String codigo);
}
