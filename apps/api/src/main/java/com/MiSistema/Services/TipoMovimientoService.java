package com.MiSistema.Services;

import com.MiSistema.Modelos.TipoMovimiento;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import org.springframework.http.ResponseEntity;

/** Interfaz propia (no DefaultService) porque la PK de tipo_movimiento es un código String. */
public interface TipoMovimientoService {
    ResponseEntity<DefaultResponse<TipoMovimiento>> list(DefaultFilter filtro);
    ResponseEntity<DefaultResponse<TipoMovimiento>> getByCodigo(String codigo);
    ResponseEntity<DefaultResponse<TipoMovimiento>> insert(TipoMovimiento tipo);
    ResponseEntity<DefaultResponse<TipoMovimiento>> update(TipoMovimiento tipo);
    ResponseEntity<DefaultResponse<TipoMovimiento>> delete(String codigo);
}
