package com.MiSistema.Controllers;

import com.MiSistema.Modelos.EmpresaConfiguracion;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.EmpresaConfiguracionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/empresa")
@RequiredArgsConstructor
public class EmpresaConfiguracionController {

    private final EmpresaConfiguracionService empresaConfiguracionService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<EmpresaConfiguracion>> lista(@RequestBody DefaultFilter filtro) {
        return empresaConfiguracionService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<EmpresaConfiguracion>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return empresaConfiguracionService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<EmpresaConfiguracion>> insert(@RequestBody EmpresaConfiguracion empresa) {
        return empresaConfiguracionService.insert(empresa);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<EmpresaConfiguracion>> update(@RequestBody EmpresaConfiguracion empresa) {
        return empresaConfiguracionService.update(empresa);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<EmpresaConfiguracion>> delete(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return empresaConfiguracionService.delete(id);
    }

}
