package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Sucursal;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.SucursalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/sucursal")
@RequiredArgsConstructor
public class SucursalController {

    private final SucursalService sucursalService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Sucursal>> lista(@RequestBody DefaultFilter filtro) {
        return sucursalService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Sucursal>> getById(@RequestParam(name = "id", defaultValue = "" ) String id) {
        return sucursalService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Sucursal>> insert(@RequestBody Sucursal sucursal) {
        return sucursalService.insert(sucursal);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Sucursal>> update(@RequestBody Sucursal sucursal) {
        return sucursalService.update(sucursal);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Sucursal>> delete(@RequestParam(name = "id", defaultValue = "" ) String id) {
        return sucursalService.delete(id);
    }

}
