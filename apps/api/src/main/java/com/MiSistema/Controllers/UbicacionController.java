package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Ubicacion;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.UbicacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/ubicacion")
@RequiredArgsConstructor
public class UbicacionController {

    private final UbicacionService ubicacionService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Ubicacion>> lista(@RequestBody DefaultFilter filtro) {
        return ubicacionService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Ubicacion>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return ubicacionService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Ubicacion>> insert(@RequestBody Ubicacion ubicacion) {
        return ubicacionService.insert(ubicacion);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Ubicacion>> update(@RequestBody Ubicacion ubicacion) {
        return ubicacionService.update(ubicacion);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Ubicacion>> delete(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return ubicacionService.delete(id);
    }

}
