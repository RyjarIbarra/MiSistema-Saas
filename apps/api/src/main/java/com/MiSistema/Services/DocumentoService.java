package com.MiSistema.Services;

import com.MiSistema.Modelos.Documento;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Documento.DocumentoListDto;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import org.springframework.http.ResponseEntity;

public interface DocumentoService {
    ResponseEntity<DefaultResponse<DocumentoListDto>> list(DefaultFilter filtro);
    ResponseEntity<DefaultResponse<Documento>> getById(long id);
    ResponseEntity<DefaultResponse<Documento>> insert(Documento documento);
    ResponseEntity<DefaultResponse<String>> anular(long id, String motivo);
}
