package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Banco;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.BancoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/banco")
@RequiredArgsConstructor
public class BancoController {

    private final BancoService bancoService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Banco>> lista(@RequestBody DefaultFilter filtro) {
        return bancoService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Banco>> getById(@RequestParam(name = "id", defaultValue = "0") long id) {
        return bancoService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Banco>> insert(@RequestBody Banco banco) {
        return bancoService.insert(banco);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Banco>> update(@RequestBody Banco banco) {
        return bancoService.update(banco);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Banco>> delete(@RequestParam(name = "id", defaultValue = "0") long id) {
        return bancoService.delete(id);
    }
}
