package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Marca;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.MarcaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/marca")
@RequiredArgsConstructor
public class MarcaController {

    private final MarcaService marcaService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Marca>> lista(@RequestBody DefaultFilter filtro) {
        return marcaService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Marca>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return marcaService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Marca>> insert(@RequestBody Marca marca) {
        return marcaService.insert(marca);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Marca>> update(@RequestBody Marca marca) {
        return marcaService.update(marca);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Marca>> delete(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return marcaService.delete(id);
    }

}
