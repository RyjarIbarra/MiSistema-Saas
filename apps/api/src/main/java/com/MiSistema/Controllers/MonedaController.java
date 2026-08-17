package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Moneda;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.MonedaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/moneda")
@RequiredArgsConstructor
public class MonedaController {

    private final MonedaService monedaService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Moneda>> lista(@RequestBody DefaultFilter filtro) {
        return monedaService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Moneda>> getById(@RequestParam(name = "id", defaultValue = "" ) String id) {
        return monedaService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Moneda>> insert(@RequestBody Moneda moneda) {
        return monedaService.insert(moneda);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Moneda>> update(@RequestBody Moneda moneda) {
        return monedaService.update(moneda);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Moneda>> delete(@RequestParam(name = "id", defaultValue = "" ) String id) {
        return monedaService.delete(id);
    }

}
