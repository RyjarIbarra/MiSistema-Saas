package com.MiSistema.Controllers;

import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.OptionsList;
import com.MiSistema.Services.OptionsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/options")
@RequiredArgsConstructor
public class OptionsController {

    private final OptionsService optionsService;

    @GetMapping("/unidad")
    public ResponseEntity<DefaultResponse<OptionsList>> listUnidad() {
        return optionsService.listUnidad();
    }

    @GetMapping("/moneda")
    public ResponseEntity<DefaultResponse<OptionsList>> listMoneda() {
        return optionsService.listMoneda();
    }

    @GetMapping("/tipoPrecio")
    public ResponseEntity<DefaultResponse<OptionsList>> listTipPrecio() {
        return optionsService.listTipoPrecio();
    }

    @GetMapping("/access")
    public ResponseEntity<DefaultResponse<OptionsList>> listAccess() {
        return optionsService.listAccess();
    }

    @GetMapping("/tipoDocumento")
    public ResponseEntity<DefaultResponse<OptionsList>> listTipoDocumento() {
        return optionsService.listTipoDocumento();
    }

}
