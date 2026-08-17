package com.MiSistemaReport.GlobalExceptionHandler;

import com.MiSistemaReport.ModelsDto.DefaultResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public class ResponseBuilder {

    public static <T> ResponseEntity<DefaultResponse<T>> ok(List<T> dataList, long totalRecords) {
        DefaultResponse<T> response = new DefaultResponse<>();
        response.setSuccess(true);
        response.setMessage("Operación exitosa");
        response.setError(null);
        response.setStatusCode(HttpStatus.OK.value());
        response.setTimestamp(LocalDateTime.now());
        response.setTotalRecords(totalRecords);
        response.setObjectsList(dataList != null ? dataList : Collections.emptyList());
        response.setData(null);
        return ResponseEntity.ok(response);
    }

    public static <T> ResponseEntity<DefaultResponse<T>> ok(T data) {
        DefaultResponse<T> response = new DefaultResponse<>();
        response.setSuccess(true);
        response.setMessage("Operación exitosa");
        response.setError(null);
        response.setStatusCode(HttpStatus.OK.value());
        response.setTimestamp(LocalDateTime.now());
        response.setObjectsList(Collections.emptyList());
        response.setData(data);
        return ResponseEntity.ok(response);
    }

    public static <T> ResponseEntity<DefaultResponse<T>> error(String errorMessage, HttpStatus status) {
        DefaultResponse<T> response = new DefaultResponse<>();
        response.setSuccess(false);
        response.setMessage("Ocurrió un error");
        response.setError(errorMessage);
        response.setStatusCode(status.value());
        response.setTimestamp(LocalDateTime.now());
        response.setObjectsList(Collections.emptyList());
        response.setData(null);
        return ResponseEntity.status(status).body(response);
    }

    public static <T> ResponseEntity<DefaultResponse<T>> error(String errorMessage) {
        return error(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
