package com.MiSistema.Services;

import com.MiSistema.Modelos.Caja;
import com.MiSistema.ModelsDto.DefaultResponse;
import org.springframework.http.ResponseEntity;

public interface CajaService extends DefaultService<Caja> {
    ResponseEntity<DefaultResponse<Caja>> getById(String sucest, String puntoexp);
    ResponseEntity<DefaultResponse<Caja>> delete(String sucest, String puntoexp);
    ResponseEntity<DefaultResponse<Caja>> actEstadoCaj(String sucest, String puntoexp);
}
