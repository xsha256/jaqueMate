package edu.projecte.jaquemate.api_rest_jaquemate.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.projecte.jaquemate.api_rest_jaquemate.model.db.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsuario(String usuario);

    Optional<Usuario> findByEmail(String email);

    boolean existsByUsuario(String usuario);

    boolean existsByEmail(String email);
}
