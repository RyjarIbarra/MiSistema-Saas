package com.MiSistema.Controllers;

import com.MiSistema.Modelos.Extracto;
import com.MiSistema.Modelos.ExtractoPartida;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Migracion.MigracionResultadoDto;
import com.MiSistema.Services.ExtractoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/extracto")
@RequiredArgsConstructor
public class ExtractoController {

    private final ExtractoService extractoService;

    @GetMapping("/list")
    public ResponseEntity<DefaultResponse<Extracto>> lista(@RequestParam(name = "cbaid", defaultValue = "0") long cbaid) {
        return extractoService.list(cbaid);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<Extracto>> getById(@RequestParam(name = "id", defaultValue = "0") long id) {
        return extractoService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<Extracto>> insert(@RequestBody Extracto e) {
        return extractoService.insert(e);
    }

    @PutMapping("/cerrar")
    public ResponseEntity<DefaultResponse<Extracto>> cerrar(@RequestParam("id") long id,
                                                            @RequestParam(name = "usu", required = false) Integer usu) {
        return extractoService.cerrar(id, usu);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<DefaultResponse<String>> delete(@RequestParam(name = "id", defaultValue = "0") long id) {
        return extractoService.delete(id);
    }

    // ---- partidas ----
    @GetMapping("/partidas")
    public ResponseEntity<DefaultResponse<ExtractoPartida>> partidas(@RequestParam(name = "extid", defaultValue = "0") long extid) {
        return extractoService.listPartidas(extid);
    }

    @PostMapping("/partida")
    public ResponseEntity<DefaultResponse<ExtractoPartida>> addPartida(@RequestBody ExtractoPartida p) {
        return extractoService.addPartida(p);
    }

    @PostMapping("/partidas/bulk")
    public ResponseEntity<DefaultResponse<String>> addBulk(@RequestBody List<ExtractoPartida> partidas) {
        return extractoService.addPartidasBulk(partidas);
    }

    @DeleteMapping("/partida")
    public ResponseEntity<DefaultResponse<String>> deletePartida(@RequestParam(name = "expid", defaultValue = "0") long expid) {
        return extractoService.deletePartida(expid);
    }

    @PutMapping("/partida/ignorar")
    public ResponseEntity<DefaultResponse<String>> ignorar(@RequestParam("expid") long expid,
                                                           @RequestParam("ignorar") boolean ignorar) {
        return extractoService.setIgnorar(expid, ignorar);
    }

    @GetMapping("/partidas/plantilla")
    public ResponseEntity<byte[]> plantilla() {
        return extractoService.plantillaPartidas();
    }

    @PostMapping("/partidas/importar")
    public ResponseEntity<DefaultResponse<MigracionResultadoDto>> importar(@RequestParam("extid") long extid,
                                                                           @RequestParam("file") MultipartFile file) {
        return extractoService.importarPartidas(extid, file);
    }
}
