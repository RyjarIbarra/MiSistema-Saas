package com.MiSistema.Controllers;

import com.MiSistema.Modelos.TipoMovimiento;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.TipoMovimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/tipo-movimiento")
@RequiredArgsConstructor
public class TipoMovimientoController {

    private final TipoMovimientoService tipoMovimientoService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<TipoMovimiento>> lista(@RequestBody DefaultFilter filtro) {
        return tipoMovimientoService.list(filtro);
    }

    @GetMapping("/getByCodigo")
    public ResponseEntity<DefaultResponse<TipoMovimiento>> getByCodigo(@RequestParam(name = "codigo", defaultValue = "") String codigo) {
        return tipoMovimientoService.getByCodigo(codigo);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<TipoMovimiento>> insert(@RequestBody TipoMovimiento tipo) {
        return tipoMovimientoService.insert(tipo);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<TipoMovimiento>> update(@RequestBody TipoMovimiento tipo) {
        return tipoMovimientoService.update(tipo);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<TipoMovimiento>> delete(@RequestParam(name = "codigo", defaultValue = "") String codigo) {
        return tipoMovimientoService.delete(codigo);
    }
}
