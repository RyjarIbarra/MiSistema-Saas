package com.MiSistema.ModelsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DefaultResponse<T> {
    private boolean success;              // Éxito o error
    private String message;               // Mensaje genérico
    private String error;                 // Detalle del error si aplica
    private int statusCode;               // Código HTTP
    private LocalDateTime timestamp;      // Momento de la respuesta
    private long totalRecords;
    private List<T> objectsList;          // Lista de objetos (para consultas)
    private T data;                       // Un solo objeto (para inserts/updates)
}
