package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Documento;
import com.MiSistema.ModelsDto.Documento.DocumentoListDto;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.DocumentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/documento")
@RequiredArgsConstructor
public class DocumentoController {

    private final DocumentoService documentoService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<DocumentoListDto>> lista(@RequestBody DefaultFilter filtro) {
        return documentoService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Documento>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return documentoService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Documento>> insert(@RequestBody Documento documento) {
        return documentoService.insert(documento);
    }

    @PutMapping("/anular")
    public ResponseEntity<DefaultResponse<String>> anular(
            @RequestParam(name = "id", defaultValue = "0") long id,
            @RequestParam(name = "motivo", defaultValue = "") String motivo) {
        return documentoService.anular(id, motivo);
    }

}
