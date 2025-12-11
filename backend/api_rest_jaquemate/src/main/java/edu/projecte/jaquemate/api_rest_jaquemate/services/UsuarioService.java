package edu.projecte.jaquemate.api_rest_jaquemate.services;

import java.util.Optional;

import org.springframework.lang.NonNull;

import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.LoginUsuario;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.UsuarioCreate;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.UsuarioInfo;

public interface UsuarioService {

    Optional<UsuarioInfo> getByUsuario(@NonNull String usuario);

    Optional<UsuarioInfo> getByEmail(@NonNull String email);

    Optional<UsuarioInfo> getById(@NonNull Long id);

    boolean existsByUsuario(@NonNull String usuario);

    boolean existsByEmail(@NonNull String email);

    boolean comprobarLogin(@NonNull LoginUsuario loginUsuario);

    UsuarioInfo crearUsuario(@NonNull UsuarioCreate usuarioCreate);
}
