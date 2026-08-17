package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Deposito;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.DepositoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/deposito")
@RequiredArgsConstructor
public class DepositoController {

    private final DepositoService depositoService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Deposito>> lista(@RequestBody DefaultFilter filtro) {
        return depositoService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Deposito>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return depositoService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Deposito>> insert(@RequestBody Deposito deposito) {
        return depositoService.insert(deposito);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Deposito>> update(@RequestBody Deposito deposito) {
        return depositoService.update(deposito);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Deposito>> delete(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return depositoService.delete(id);
    }
}
