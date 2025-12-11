package edu.projecte.jaquemate.api_rest_jaquemate.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.LoginUsuario;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.UsuarioCreate;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.UsuarioInfo;
import edu.projecte.jaquemate.api_rest_jaquemate.services.UsuarioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioRestController {

    private final UsuarioService usuarioService;

    public UsuarioRestController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@Valid @RequestBody UsuarioCreate usuarioCreate) {
        if (usuarioService.existsByUsuario(usuarioCreate.getUsuario())) {
            Map<String, String> error = new HashMap<>();
            error.put("usuario", "El nombre de usuario ya está usado");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
        if (usuarioService.existsByEmail(usuarioCreate.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("email", "El email ya esta registrado");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        UsuarioInfo nuevoUsuario = usuarioService.crearUsuario(usuarioCreate);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginUsuario loginUsuario) {
        if (usuarioService.comprobarLogin(loginUsuario)) {
            Optional<UsuarioInfo> usuarioInfo = usuarioService.getByUsuario(loginUsuario.getUsuario());
            if (usuarioInfo.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login exitoso");
                response.put("usuario", usuarioInfo.get());
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.ok("Login exitoso");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
        }
    }

    @GetMapping("/perfil/{usuario}")
    public ResponseEntity<UsuarioInfo> getPerfilByUsuario(@PathVariable String usuario) {
        Optional<UsuarioInfo> usuarioInfo = usuarioService.getByUsuario(usuario);
        return usuarioInfo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UsuarioInfo> getPerfilByEmail(@PathVariable String email) {
        Optional<UsuarioInfo> usuarioInfo = usuarioService.getByEmail(email);
        return usuarioInfo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioInfo> getPerfilById(@PathVariable Long id) {
        Optional<UsuarioInfo> usuarioInfo = usuarioService.getById(id);
        return usuarioInfo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/existe/usuario/{usuario}")
    public ResponseEntity<Map<String, Boolean>> existeUsuario(@PathVariable String usuario) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("existe", usuarioService.existsByUsuario(usuario));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/existe/email/{email}")
    public ResponseEntity<Map<String, Boolean>> existeEmail(@PathVariable String email) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("existe", usuarioService.existsByEmail(email));
        return ResponseEntity.ok(response);
    }
}
