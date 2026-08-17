package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Categoria;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.DefaultFilter;
import com.MiSistema.Services.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/categoria")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<Categoria>> lista(@RequestBody DefaultFilter filtro) {
        return categoriaService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Categoria>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return categoriaService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Categoria>> insert(@RequestBody Categoria categoria) {
        return categoriaService.insert(categoria);
    }

    @PutMapping("/update")
    public ResponseEntity<DefaultResponse<Categoria>> update(@RequestBody Categoria categoria) {
        return categoriaService.update(categoria);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<Categoria>> delete(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return categoriaService.delete(id);
    }

}
