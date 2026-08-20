package com.MiSistema.Controllers;

import com.MiSistema.Modelos.MovimientoBancario;
import com.MiSistema.ModelsDto.Banco.MovimientoFiltro;
import com.MiSistema.ModelsDto.Banco.SaldoCuentaDto;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.Services.MovimientoBancarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/movimiento-bancario")
@RequiredArgsConstructor
public class MovimientoBancarioController {

    private final MovimientoBancarioService movimientoService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<MovimientoBancario>> lista(@RequestBody MovimientoFiltro filtro) {
        return movimientoService.list(filtro);
    }

    @PostMapping("/registrar")
    public ResponseEntity<DefaultResponse<MovimientoBancario>> registrar(@RequestBody MovimientoBancario mov) {
        return movimientoService.registrar(mov);
    }

    @PutMapping("/anular")
    public ResponseEntity<DefaultResponse<String>> anular(@RequestParam("id") long id,
                                                          @RequestParam("motivo") String motivo) {
        return movimientoService.anular(id, motivo);
    }

    @GetMapping("/saldo")
    public ResponseEntity<DefaultResponse<SaldoCuentaDto>> saldo(@RequestParam(name = "cbaid", defaultValue = "0") long cbaid) {
        return movimientoService.saldo(cbaid);
    }
}
