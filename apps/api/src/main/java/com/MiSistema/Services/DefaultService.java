package com.MiSistema.Services;

import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import org.springframework.http.ResponseEntity;

public interface DefaultService<T> {
    ResponseEntity<DefaultResponse<T>> list(DefaultFilter defaultFilter);
    ResponseEntity<DefaultResponse<T>> getById(long id);
    ResponseEntity<DefaultResponse<T>> insert(T t);
    ResponseEntity<DefaultResponse<T>> update(T t);
    ResponseEntity<DefaultResponse<T>> delete(long id);
}
