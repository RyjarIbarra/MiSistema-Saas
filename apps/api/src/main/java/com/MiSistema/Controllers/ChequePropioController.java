package com.MiSistema.Controllers;

import com.MiSistema.Modelos.ChequePropio;
import com.MiSistema.ModelsDto.Banco.ChequeAccion;
import com.MiSistema.ModelsDto.Banco.ChequeFiltro;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.Services.ChequePropioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/cheque-propio")
@RequiredArgsConstructor
public class ChequePropioController {

    private final ChequePropioService chequePropioService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<ChequePropio>> lista(@RequestBody ChequeFiltro filtro) {
        return chequePropioService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<ChequePropio>> getById(@RequestParam(name = "id", defaultValue = "0") long id) {
        return chequePropioService.getById(id);
    }

    @PostMapping("/emitir")
    public ResponseEntity<DefaultResponse<ChequePropio>> emitir(@RequestBody ChequePropio ch) {
        return chequePropioService.emitir(ch);
    }

    @PutMapping("/entregar")
    public ResponseEntity<DefaultResponse<String>> entregar(@RequestBody ChequeAccion a) {
        return chequePropioService.entregar(a);
    }

    @PutMapping("/cobrar")
    public ResponseEntity<DefaultResponse<String>> cobrar(@RequestBody ChequeAccion a) {
        return chequePropioService.cobrar(a);
    }

    @PutMapping("/rechazar")
    public ResponseEntity<DefaultResponse<String>> rechazar(@RequestBody ChequeAccion a) {
        return chequePropioService.rechazar(a);
    }

    @PutMapping("/anular")
    public ResponseEntity<DefaultResponse<String>> anular(@RequestBody ChequeAccion a) {
        return chequePropioService.anular(a);
    }
}
