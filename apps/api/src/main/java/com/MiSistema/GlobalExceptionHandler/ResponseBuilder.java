package com.MiSistema.GlobalExceptionHandler;

import com.MiSistema.ModelsDto.DefaultResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public class ResponseBuilder {

    // Éxito con lista
    public static <T> ResponseEntity<DefaultResponse<T>> ok(List<T> dataList, long totalRecords) {
        DefaultResponse<T> response = new DefaultResponse<>();
        response.setSuccess(true);
        response.setMessage("Operación exitosa");
        response.setError(null);
        response.setStatusCode(HttpStatus.OK.value());
        response.setTimestamp(LocalDateTime.now());
        response.setTotalRecords(totalRecords);
        response.setObjectsList(dataList != null ? dataList : Collections.emptyList());
        response.setData(null); // no aplica en este caso
        return ResponseEntity.ok(response);
    }

    // Éxito con un solo objeto
    public static <T> ResponseEntity<DefaultResponse<T>> ok(T data) {
        DefaultResponse<T> response = new DefaultResponse<>();
        response.setSuccess(true);
        response.setMessage("Operación exitosa");
        response.setError(null);
        response.setStatusCode(HttpStatus.OK.value());
        response.setTimestamp(LocalDateTime.now());
        response.setObjectsList(Collections.emptyList()); // no aplica en este caso
        response.setData(data);
        return ResponseEntity.ok(response);
    }

    // Error con status específico
    public static <T> ResponseEntity<DefaultResponse<T>> error(String errorMessage, HttpStatus status) {
        DefaultResponse<T> response = new DefaultResponse<>();
        response.setSuccess(false);
        response.setMessage("Ocurrió un error");
        response.setError(errorMessage);
        response.setStatusCode(status.value());
        response.setTimestamp(LocalDateTime.now());
        response.setObjectsList(Collections.emptyList()); // vacío por defecto
        response.setData(null); // no aplica en error
        return ResponseEntity.status(status).body(response);
    }

    // Error genérico 500
    public static <T> ResponseEntity<DefaultResponse<T>> error(String errorMessage) {
        return error(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
