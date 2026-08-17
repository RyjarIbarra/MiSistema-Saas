package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Caja;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.CajaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/caja")
@RequiredArgsConstructor
public class CajaController {

    private final CajaService cajaService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Caja>> lista(@RequestBody DefaultFilter filtro) {
        return cajaService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Caja>> getById(
            @RequestParam(name = "sucest", defaultValue = "") String sucest,
            @RequestParam(name = "puntoexp", defaultValue = "") String puntoexp) {
        return cajaService.getById(sucest, puntoexp);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Caja>> insert(@RequestBody Caja caja) {
        return cajaService.insert(caja);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Caja>> update(@RequestBody Caja caja) {
        return cajaService.update(caja);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Caja>> delete(
            @RequestParam(name = "sucest", defaultValue = "") String sucest,
            @RequestParam(name = "puntoexp", defaultValue = "") String puntoexp) {
        return cajaService.delete(sucest, puntoexp);
    }

    @GetMapping("/actestado")
    public ResponseEntity<DefaultResponse<Caja>> actestado(
            @RequestParam(name = "sucest", defaultValue = "") String sucest,
            @RequestParam(name = "puntoexp", defaultValue = "") String puntoexp) {
        return cajaService.actEstadoCaj(sucest, puntoexp);
    }

}
