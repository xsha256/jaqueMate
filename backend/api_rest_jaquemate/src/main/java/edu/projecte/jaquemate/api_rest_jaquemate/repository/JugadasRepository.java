package edu.projecte.jaquemate.api_rest_jaquemate.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import edu.projecte.jaquemate.api_rest_jaquemate.model.db.Jugadas;

@Repository
public interface JugadasRepository extends JpaRepository<Jugadas, Long> {

    Page<Jugadas> findByUsuarioId(Long usuarioId, Pageable pageable);

    @Query("SELECT j FROM Jugadas j WHERE j.usuario.usuario LIKE %:nombre%")
    Page<Jugadas> findByUsuarioNombreContaining(@Param("nombre") String nombre, Pageable pageable);

    List<Jugadas> findByUsuarioId(Long usuarioId);

    List<Jugadas> findByFen(String fen);
}
