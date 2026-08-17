package com.MiSistema.Services;

import com.MiSistema.Modelos.Audit_Log;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import org.springframework.http.ResponseEntity;

import java.sql.Connection;

public interface Audit_LogService {
    ResponseEntity<DefaultResponse<Audit_Log>> list(DefaultFilter defaultFilter);
    ResponseEntity<DefaultResponse<Audit_Log>> getById(long id);
    ResponseEntity<DefaultResponse<Audit_Log>> insert(Audit_Log t, Connection conn);
}
