package com.MiSistema.GlobalExceptionHandler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.sql.SQLException;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Manejo de errores SQL
    @ExceptionHandler(SQLException.class)
    public ResponseEntity<?> handleSQLException(SQLException ex) {
        return ResponseBuilder.error("Error en la base de datos: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // NullPointer, IllegalArgument, etc.
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        return ResponseBuilder.error("Error en la aplicación: " + ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

//    // Cualquier excepción que no hayas previsto
//    @ExceptionHandler(Exception.class)
//    public ResponseEntity<?> handleGeneralException(Exception ex) {
//        return ResponseBuilder.error("Error inesperado: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
//    }

    // Manejo genérico de cualquier otra excepción
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex) {
        return ResponseBuilder.error("Error inesperado: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
