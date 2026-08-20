package com.MiSistema.Controllers;

import com.MiSistema.Modelos.ChequeTercero;
import com.MiSistema.ModelsDto.Banco.ChequeAccion;
import com.MiSistema.ModelsDto.Banco.ChequeFiltro;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.Services.ChequeTerceroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/cheque-tercero")
@RequiredArgsConstructor
public class ChequeTerceroController {

    private final ChequeTerceroService chequeTerceroService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<ChequeTercero>> lista(@RequestBody ChequeFiltro filtro) {
        return chequeTerceroService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<ChequeTercero>> getById(@RequestParam(name = "id", defaultValue = "0") long id) {
        return chequeTerceroService.getById(id);
    }

    @PostMapping("/recibir")
    public ResponseEntity<DefaultResponse<ChequeTercero>> recibir(@RequestBody ChequeTercero ch) {
        return chequeTerceroService.recibir(ch);
    }

    @PutMapping("/depositar")
    public ResponseEntity<DefaultResponse<String>> depositar(@RequestBody ChequeAccion a) {
        return chequeTerceroService.depositar(a);
    }

    @PutMapping("/acreditar")
    public ResponseEntity<DefaultResponse<String>> acreditar(@RequestBody ChequeAccion a) {
        return chequeTerceroService.acreditar(a);
    }

    @PutMapping("/endosar")
    public ResponseEntity<DefaultResponse<String>> endosar(@RequestBody ChequeAccion a) {
        return chequeTerceroService.endosar(a);
    }

    @PutMapping("/rechazar")
    public ResponseEntity<DefaultResponse<String>> rechazar(@RequestBody ChequeAccion a) {
        return chequeTerceroService.rechazar(a);
    }

    @PutMapping("/devolver")
    public ResponseEntity<DefaultResponse<String>> devolver(@RequestBody ChequeAccion a) {
        return chequeTerceroService.devolver(a);
    }
}
