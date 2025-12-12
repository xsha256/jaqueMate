package edu.projecte.jaquemate.api_rest_jaquemate.services.impl;

import java.util.Optional;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import edu.projecte.jaquemate.api_rest_jaquemate.model.db.Usuario;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.LoginUsuario;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.UsuarioCreate;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.UsuarioInfo;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.UsuarioUpdate;
import edu.projecte.jaquemate.api_rest_jaquemate.repository.UsuarioRepository;
import edu.projecte.jaquemate.api_rest_jaquemate.services.UsuarioService;
import edu.projecte.jaquemate.api_rest_jaquemate.services.mapper.UsuarioMapper;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public Optional<UsuarioInfo> getByUsuario(@NonNull String usuario) {
        Optional<Usuario> usuarioDb = usuarioRepository.findByUsuario(usuario);
        if (usuarioDb.isPresent()) {
            return usuarioDb.map(UsuarioMapper.INSTANCE::usuarioToUserInfo);
        }
        return Optional.empty();
    }

    @Override
    public Optional<UsuarioInfo> getByEmail(@NonNull String email) {
        Optional<Usuario> usuarioDb = usuarioRepository.findByEmail(email);
        if (usuarioDb.isPresent()) {
            return usuarioDb.map(UsuarioMapper.INSTANCE::usuarioToUserInfo);
        }
        return Optional.empty();
    }

    @Override
    public Optional<UsuarioInfo> getById(@NonNull Long id) {
        Optional<Usuario> usuarioDb = usuarioRepository.findById(id);
        if (usuarioDb.isPresent()) {
            return usuarioDb.map(UsuarioMapper.INSTANCE::usuarioToUserInfo);
        }
        return Optional.empty();
    }

    @Override
    public boolean existsByUsuario(@NonNull String usuario) {
        return usuarioRepository.existsByUsuario(usuario);
    }

    @Override
    public boolean existsByEmail(@NonNull String email) {
        return usuarioRepository.existsByEmail(email);
    }

    @Override
    public boolean comprobarLogin(@NonNull LoginUsuario loginUsuario) {
        Optional<Usuario> usuarioDbOp = usuarioRepository.findByUsuario(loginUsuario.getUsuario());
        if (usuarioDbOp.isPresent()) {
            Usuario usuarioDb = usuarioDbOp.get();

            if (loginUsuario.getPassword().equals(usuarioDb.getPassword())) {
                return true;
            }
        }
        return false;
    }

    @Override
    public UsuarioInfo crearUsuario(@NonNull UsuarioCreate usuarioCreate) {
        Usuario usuario = UsuarioMapper.INSTANCE.usuarioCreateToUsuario(usuarioCreate);
        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        return UsuarioMapper.INSTANCE.usuarioToUserInfo(usuarioGuardado);
    }

    @Override
    public Optional<UsuarioInfo> actualizarPerfil(@NonNull Long id, @NonNull UsuarioUpdate usuarioUpdate) {
        Optional<Usuario> usuarioDbOp = usuarioRepository.findById(id);
        if (usuarioDbOp.isEmpty()) {
            return Optional.empty();
        }

        Usuario usuarioDb = usuarioDbOp.get();

        // Actualizar solo los campos que no son null
        if (usuarioUpdate.getUsuario() != null && !usuarioUpdate.getUsuario().isBlank()) {
            usuarioDb.setUsuario(usuarioUpdate.getUsuario());
        }
        if (usuarioUpdate.getPassword() != null && !usuarioUpdate.getPassword().isBlank()) {
            usuarioDb.setPassword(usuarioUpdate.getPassword());
        }

        Usuario usuarioActualizado = usuarioRepository.save(usuarioDb);
        return Optional.of(UsuarioMapper.INSTANCE.usuarioToUserInfo(usuarioActualizado));
    }
}
