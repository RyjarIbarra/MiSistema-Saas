package com.MiSistema.Controllers;

import com.MiSistema.Config.JwtService;
import com.MiSistema.Config.LicenciaServiceImpl;
import com.MiSistema.GlobalExceptionHandler.ResponseBuilder;
import com.MiSistema.Implementacion.UsuariosImpl;
import com.MiSistema.ModelsDto.DefaultResponse;
import com.MiSistema.ModelsDto.Login.UserCredentials;
import com.MiSistema.ModelsDto.Login.UserData;
import com.MiSistema.ModelsDto.Login.UserInfo;
import com.MiSistema.ModelsDto.Login.UserResponse;
import com.MiSistema.ModelsDto.Menu.MenuModuleDto;
import com.MiSistema.Services.MenuService;
import com.MiSistema.Services.UsuariosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UsuariosService usuariosService;
    private final MenuService menuService;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, PasswordEncoder passwordEncoder, UsuariosService usuariosService, MenuService menuService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.usuariosService = usuariosService;
        this.menuService = menuService;
    }

    @GetMapping("/version")
    public String version() {
        return "PDV v1.2";
    }

    @GetMapping("/decoder")
    public String encoderUsuarios(@RequestParam(name = "contra", defaultValue = "") String contra) {
        return passwordEncoder.encode(contra);
    }

    @PostMapping("/sign_in")
    public ResponseEntity<DefaultResponse<UserResponse>> login(@RequestBody UserData request) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        // Obtengo al usuario autenticado
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // Genero el token
        String token = jwtService.generateToken(userDetails);
        assert userDetails != null;
        UserInfo userInfo = usuariosService.userInfo(userDetails.getUsername());

        // Resuelvo el menú del usuario en función de su plan
        List<MenuModuleDto> menu = menuService.byUser(userInfo.getId_usuario());

        // Retorno token + menú
        return ResponseBuilder.ok(new UserResponse(userInfo.getId_usuario(), userInfo.getUsername(), userInfo.getRol(), userInfo.getEmail(), token, menu));
    }

    @GetMapping("/insertSession")
    public ResponseEntity<DefaultResponse<String>> insertSession(@RequestParam(name = "users_id", defaultValue = "0" ) long id) {
        return ResponseBuilder.ok(usuariosService.audit_sessions(id));
    }

}
