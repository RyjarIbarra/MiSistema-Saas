package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Proveedor;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.ProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/proveedor")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Proveedor>> lista(@RequestBody DefaultFilter filtro) {
        return proveedorService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Proveedor>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return proveedorService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Proveedor>> insert(@RequestBody Proveedor proveedor) {
        return proveedorService.insert(proveedor);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Proveedor>> update(@RequestBody Proveedor proveedor) {
        return proveedorService.update(proveedor);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Proveedor>> delete(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return proveedorService.delete(id);
    }

}
