package com.MiSistema.Services;

import com.MiSistema.ModelsDto.AjusteStock.AjusteStockGetByIdDto;
import com.MiSistema.ModelsDto.AjusteStock.AjusteStockListItemDto;
import com.MiSistema.ModelsDto.AjusteStock.AjusteStockRequestDto;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.AjusteStockFilterDto;
import org.springframework.http.ResponseEntity;

public interface AjusteStockService {
    ResponseEntity<DefaultResponse<AjusteStockListItemDto>> list(AjusteStockFilterDto filtro);
    ResponseEntity<DefaultResponse<AjusteStockGetByIdDto>> getById(long id);
    ResponseEntity<DefaultResponse<AjusteStockGetByIdDto>> insert(AjusteStockRequestDto request);
    ResponseEntity<DefaultResponse<String>> anular(long id);
}
