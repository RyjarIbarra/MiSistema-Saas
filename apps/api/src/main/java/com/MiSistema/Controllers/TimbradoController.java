package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Timbrado;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.TimbradoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/timbrado")
@RequiredArgsConstructor
public class TimbradoController {

    private final TimbradoService timbradoService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Timbrado>> lista(@RequestBody DefaultFilter filtro) {
        return timbradoService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Timbrado>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return timbradoService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Timbrado>> insert(@RequestBody Timbrado timbrado) {
        return timbradoService.insert(timbrado);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Timbrado>> update(@RequestBody Timbrado timbrado) {
        return timbradoService.update(timbrado);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Timbrado>> delete(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return timbradoService.delete(id);
    }

    @GetMapping("/actestado")
    public ResponseEntity<DefaultResponse<Timbrado>> actestado(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return timbradoService.actEstadoTim(id);
    }

}
