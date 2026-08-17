package com.MiSistema.Controllers;

import com.MiSistema.Config.SecurityUtils;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Login.UserCredentials;
import com.MiSistema.ModelsDto.Menu.MenuModuleDto;
import com.MiSistema.Services.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/byUser")
    public ResponseEntity<DefaultResponse<MenuModuleDto>> byUser() {
        UserCredentials credentials = SecurityUtils.getUserCredentials();
        if (credentials == null) {
            return ResponseBuilder.error("Usuario no autenticado.", HttpStatus.UNAUTHORIZED);
        }
        List<MenuModuleDto> menu = menuService.byUser(credentials.getUser_id());
        return ResponseBuilder.ok(menu, menu.size());
    }

}
