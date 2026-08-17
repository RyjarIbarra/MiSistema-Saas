package com.MiSistema.Services;

import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.OptionsList;
import org.springframework.http.ResponseEntity;

public interface OptionsService {
    ResponseEntity<DefaultResponse<OptionsList>> listUnidad();
    ResponseEntity<DefaultResponse<OptionsList>> listMoneda();
    ResponseEntity<DefaultResponse<OptionsList>> listTipoPrecio();
    ResponseEntity<DefaultResponse<OptionsList>> listAccess();
    ResponseEntity<DefaultResponse<OptionsList>> listTipoDocumento();
}
