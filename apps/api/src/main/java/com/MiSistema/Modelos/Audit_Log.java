package com.MiSistema.Modelos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tools.jackson.databind.JsonNode;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class Audit_Log {
    private long log_id;
    private long user_id;
    private long session_id;
    private String accion;
    private String entity_type;
    private long entity_id;
    private JsonNode old_data;
    private JsonNode new_data;
    private JsonNode metadata;
    private LocalDateTime created_at;
}
