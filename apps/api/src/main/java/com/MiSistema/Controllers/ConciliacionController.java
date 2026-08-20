package com.MiSistema.Controllers;

import com.MiSistema.Modelos.ConciliacionVinculo;
import com.MiSistema.ModelsDto.Banco.ConciliacionReporte;
import com.MiSistema.ModelsDto.Banco.MovimientoConciliar;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.Services.ConciliacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/conciliacion")
@RequiredArgsConstructor
public class ConciliacionController {

    private final ConciliacionService conciliacionService;

    @GetMapping("/reporte")
    public ResponseEntity<DefaultResponse<ConciliacionReporte>> reporte(@RequestParam(name = "extid", defaultValue = "0") long extid) {
        return conciliacionService.reporte(extid);
    }

    @GetMapping("/movimientos")
    public ResponseEntity<DefaultResponse<MovimientoConciliar>> movimientos(@RequestParam(name = "extid", defaultValue = "0") long extid) {
        return conciliacionService.movimientosPeriodo(extid);
    }

    @GetMapping("/vinculos")
    public ResponseEntity<DefaultResponse<ConciliacionVinculo>> vinculos(@RequestParam(name = "expid", defaultValue = "0") long expid) {
        return conciliacionService.listVinculos(expid);
    }

    @PostMapping("/vincular")
    public ResponseEntity<DefaultResponse<ConciliacionVinculo>> vincular(@RequestBody ConciliacionVinculo v) {
        return conciliacionService.vincular(v);
    }

    @DeleteMapping("/desvincular")
    public ResponseEntity<DefaultResponse<String>> desvincular(@RequestParam(name = "covid", defaultValue = "0") long covid) {
        return conciliacionService.desvincular(covid);
    }

    @PostMapping("/auto")
    public ResponseEntity<DefaultResponse<String>> autoMatch(@RequestParam(name = "extid", defaultValue = "0") long extid) {
        return conciliacionService.autoMatch(extid);
    }
}
