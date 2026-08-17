package com.MiSistema.Controllers;

import com.MiSistema.ModelsDto.AjusteStock.AjusteStockGetByIdDto;
import com.MiSistema.ModelsDto.AjusteStock.AjusteStockListItemDto;
import com.MiSistema.ModelsDto.AjusteStock.AjusteStockRequestDto;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Filter.AjusteStockFilterDto;
import com.MiSistema.Services.AjusteStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/ajusteStock")
@RequiredArgsConstructor
public class AjusteStockController {

    private final AjusteStockService ajusteStockService;

    @PostMapping("/list")
    public ResponseEntity<DefaultResponse<AjusteStockListItemDto>> lista(@RequestBody AjusteStockFilterDto filtro) {
        return ajusteStockService.list(filtro);
    }

    @GetMapping("/getById")
    public ResponseEntity<DefaultResponse<AjusteStockGetByIdDto>> getById(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return ajusteStockService.getById(id);
    }

    @PostMapping("/insert")
    public ResponseEntity<DefaultResponse<AjusteStockGetByIdDto>> insert(@RequestBody AjusteStockRequestDto request) {
        return ajusteStockService.insert(request);
    }

    @PutMapping("/anular")
    public ResponseEntity<DefaultResponse<String>> anular(@RequestParam(name = "id", defaultValue = "0" ) long id) {
        return ajusteStockService.anular(id);
    }

}
