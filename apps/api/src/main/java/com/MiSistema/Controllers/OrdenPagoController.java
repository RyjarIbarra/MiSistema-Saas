package com.MiSistema.Controllers;

import com.MiSistema.Modelos.OrdenPago;
import com.MiSistema.Modelos.OrdenPagoMedio;
import com.MiSistema.ModelsDto.Banco.ChequeFiltro;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.Services.OrdenPagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@CrossOrigin
@RestController
@RequestMapping("/orden-pago")
@RequiredArgsConstructor
public class OrdenPagoController {

    private final OrdenPagoService ordenPagoService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<OrdenPago>> lista(@RequestBody ChequeFiltro filtro) {
        return ordenPagoService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<OrdenPago>> getById(@RequestParam(name = "id", defaultValue = "0") long id) {
        return ordenPagoService.getById(id);
    }

    @PostMapping("/crear")
    public ResponseEntity<DefaultResponse<OrdenPago>> crear(@RequestBody OrdenPago orden) {
        return ordenPagoService.crear(orden);
    }

    @PutMapping("/actualizar")
    public ResponseEntity<DefaultResponse<OrdenPago>> actualizar(@RequestBody OrdenPago orden) {
        return ordenPagoService.actualizar(orden);
    }

    @PutMapping("/aprobar")
    public ResponseEntity<DefaultResponse<String>> aprobar(@RequestParam("id") long id,
                                                           @RequestParam(name = "usu", required = false) Integer usu) {
        return ordenPagoService.aprobar(id, usu);
    }

    @PutMapping("/anular")
    public ResponseEntity<DefaultResponse<String>> anular(@RequestParam("id") long id,
                                                          @RequestParam("motivo") String motivo,
                                                          @RequestParam(name = "usu", required = false) Integer usu) {
        return ordenPagoService.anular(id, motivo, usu);
    }

    @DeleteMapping("/eliminar")
    public ResponseEntity<DefaultResponse<String>> eliminar(@RequestParam(name = "id", defaultValue = "0") long id) {
        return ordenPagoService.eliminar(id);
    }

    @PostMapping("/medio")
    public ResponseEntity<DefaultResponse<OrdenPagoMedio>> agregarMedio(@RequestBody OrdenPagoMedio medio) {
        return ordenPagoService.agregarMedio(medio);
    }

    @DeleteMapping("/medio")
    public ResponseEntity<DefaultResponse<String>> quitarMedio(@RequestParam(name = "opmid", defaultValue = "0") long opmid) {
        return ordenPagoService.quitarMedio(opmid);
    }

    @PutMapping("/pagar")
    public ResponseEntity<DefaultResponse<String>> pagar(@RequestParam("id") long id,
                                                         @RequestParam(name = "fecha", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
                                                         @RequestParam(name = "usu", required = false) Integer usu) {
        return ordenPagoService.pagar(id, fecha, usu);
    }
}
