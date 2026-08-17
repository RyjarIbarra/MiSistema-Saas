package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Access;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.AccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/access")
@RequiredArgsConstructor
public class AccessController {

    private final AccessService accessService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Access>> lista(@RequestBody DefaultFilter filtro) {
        return accessService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Access>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return accessService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Access>> insert(@RequestBody Access access) {
        return accessService.insert(access);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Access>> update(@RequestBody Access access) {
        return accessService.update(access);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Access>> delete(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return accessService.delete(id);
    }

}
