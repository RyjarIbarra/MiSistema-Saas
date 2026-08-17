package com.MiSistema.Services;

import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Migracion.MigracionResultadoDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface ProductoMigracionService {
    ResponseEntity<DefaultResponse<MigracionResultadoDto>> migrate(MultipartFile file);
    ResponseEntity<byte[]> downloadTemplate();
}
