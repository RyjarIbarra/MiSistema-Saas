package com.MiSistema.Implementacion;

import com.MiSistema.Modelos.Audit_Log;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.Audit_LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.sql.Connection;

@RequiredArgsConstructor
@Service
public class Audit_LogImpl implements Audit_LogService {

    @Override
    public ResponseEntity<DefaultResponse<Audit_Log>> list(DefaultFilter defaultFilter) {
        return null;
    }

    @Override
    public ResponseEntity<DefaultResponse<Audit_Log>> getById(long id) {
        return null;
    }

    @Override
    public ResponseEntity<DefaultResponse<Audit_Log>> insert(Audit_Log t, Connection conn) {
        return null;
    }
}
