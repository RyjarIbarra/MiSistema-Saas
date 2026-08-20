package com.MiSistema.Controllers;

import com.MiSistema.Modelos.CuentaBancaria;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.CuentaBancariaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/cuenta-bancaria")
@RequiredArgsConstructor
public class CuentaBancariaController {

    private final CuentaBancariaService cuentaBancariaService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<CuentaBancaria>> lista(@RequestBody DefaultFilter filtro) {
        return cuentaBancariaService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<CuentaBancaria>> getById(@RequestParam(name = "id", defaultValue = "0") long id) {
        return cuentaBancariaService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<CuentaBancaria>> insert(@RequestBody CuentaBancaria cuenta) {
        return cuentaBancariaService.insert(cuenta);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<CuentaBancaria>> update(@RequestBody CuentaBancaria cuenta) {
        return cuentaBancariaService.update(cuenta);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<CuentaBancaria>> delete(@RequestParam(name = "id", defaultValue = "0") long id) {
        return cuentaBancariaService.delete(id);
    }
}
