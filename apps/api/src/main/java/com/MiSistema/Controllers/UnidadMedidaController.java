package com.MiSistema.Controllers;

import com.MiSistema.Modelos.UnidadMedida;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.UnidadMedidaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/unidadMedida")
@RequiredArgsConstructor
public class UnidadMedidaController {

    private final UnidadMedidaService unidadMedidaService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<UnidadMedida>> lista(@RequestBody DefaultFilter filtro) {
        return unidadMedidaService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<UnidadMedida>> getById(@RequestParam(name = "id", defaultValue = "" ) String id) {
        return unidadMedidaService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<UnidadMedida>> insert(@RequestBody UnidadMedida unidadMedida) {
        return unidadMedidaService.insert(unidadMedida);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<UnidadMedida>> update(@RequestBody UnidadMedida unidadMedida) {
        return unidadMedidaService.update(unidadMedida);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<UnidadMedida>> delete(@RequestParam(name = "id", defaultValue = "" ) String id) {
        return unidadMedidaService.delete(id);
    }

}
