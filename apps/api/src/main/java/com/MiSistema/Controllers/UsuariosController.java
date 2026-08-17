package com.MiSistema.Controllers;


import com.MiSistema.Modelos.Cliente;
import com.MiSistema.Modelos.Usuarios;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.UsuariosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/usu")
@RequiredArgsConstructor
public class UsuariosController {

    private final UsuariosService usuariosService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Usuarios>> lista(@RequestBody DefaultFilter filtro) {
        return usuariosService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Usuarios>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return usuariosService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Usuarios>> insert(@RequestBody Usuarios usuarios) {
        return usuariosService.insert(usuarios);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Usuarios>> update(@RequestBody Usuarios usuarios) {
        System.out.println("Viene aca");
        return usuariosService.update(usuarios);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Usuarios>> delete(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return usuariosService.delete(id);
    }

}
