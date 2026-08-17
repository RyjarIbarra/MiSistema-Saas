package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Cliente;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/cli")
@RequiredArgsConstructor
public class ClientesController {

    private final ClienteService clienteService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Cliente>> lista(@RequestBody DefaultFilter filtro) {
        return clienteService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Cliente>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return clienteService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Cliente>> insert(@RequestBody Cliente cliente) {
        return clienteService.insert(cliente);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Cliente>> update(@RequestBody Cliente cliente) {
        return clienteService.update(cliente);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Cliente>> delete(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return clienteService.delete(id);
    }

}
