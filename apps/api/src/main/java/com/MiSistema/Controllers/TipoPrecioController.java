package com.MiSistema.Controllers;

import com.MiSistema.Modelos.TipoPrecio;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.TipoPrecioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/tipoPrecio")
@RequiredArgsConstructor
public class TipoPrecioController {

    private final TipoPrecioService tipoPrecioService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<TipoPrecio>> lista(@RequestBody DefaultFilter filtro) {
        return tipoPrecioService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<TipoPrecio>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return tipoPrecioService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<TipoPrecio>> insert(@RequestBody TipoPrecio tipoPrecio) {
        return tipoPrecioService.insert(tipoPrecio);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<TipoPrecio>> update(@RequestBody TipoPrecio tipoPrecio) {
        return tipoPrecioService.update(tipoPrecio);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<TipoPrecio>> delete(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return tipoPrecioService.delete(id);
    }

}
