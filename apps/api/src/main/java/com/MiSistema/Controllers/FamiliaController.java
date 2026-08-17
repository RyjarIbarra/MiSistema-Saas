package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Familia;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.FamiliaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/familia")
@RequiredArgsConstructor
public class FamiliaController {

    private final FamiliaService familiaService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Familia>> lista(@RequestBody DefaultFilter filtro) {
        return familiaService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Familia>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return familiaService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Familia>> insert(@RequestBody Familia familia) {
        return familiaService.insert(familia);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Familia>> update(@RequestBody Familia familia) {
        return familiaService.update(familia);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Familia>> delete(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return familiaService.delete(id);
    }

}
