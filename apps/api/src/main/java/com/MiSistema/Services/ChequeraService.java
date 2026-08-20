package com.MiSistema.Services;

import com.MiSistema.Modelos.Chequera;
import com.MiSistema.ModelsDto.Banco.ChequeFiltro;
import com.MiSistema.ModelsDto.DefaultResponse;
import org.springframework.http.ResponseEntity;

public interface ChequeraService {
    ResponseEntity<DefaultResponse<Chequera>> list(ChequeFiltro filtro);
    ResponseEntity<DefaultResponse<Chequera>> getById(long id);
    ResponseEntity<DefaultResponse<Chequera>> insert(Chequera chq);
    ResponseEntity<DefaultResponse<Chequera>> update(Chequera chq);
    ResponseEntity<DefaultResponse<Chequera>> delete(long id);
}
