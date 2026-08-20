package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Chequera;
import com.MiSistema.ModelsDto.Banco.ChequeFiltro;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.Services.ChequeraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/chequera")
@RequiredArgsConstructor
public class ChequeraController {

    private final ChequeraService chequeraService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Chequera>> lista(@RequestBody ChequeFiltro filtro) {
        return chequeraService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Chequera>> getById(@RequestParam(name = "id", defaultValue = "0") long id) {
        return chequeraService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Chequera>> insert(@RequestBody Chequera chq) {
        return chequeraService.insert(chq);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Chequera>> update(@RequestBody Chequera chq) {
        return chequeraService.update(chq);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Chequera>> delete(@RequestParam(name = "id", defaultValue = "0") long id) {
        return chequeraService.delete(id);
    }
}
