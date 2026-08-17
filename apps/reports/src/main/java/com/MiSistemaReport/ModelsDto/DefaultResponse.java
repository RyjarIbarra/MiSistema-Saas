package com.MiSistemaReport.ModelsDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DefaultResponse<T> {
    private boolean success;
    private String message;
    private String error;
    private int statusCode;
    private LocalDateTime timestamp;
    private long totalRecords;
    private List<T> objectsList;
    private T data;
}
