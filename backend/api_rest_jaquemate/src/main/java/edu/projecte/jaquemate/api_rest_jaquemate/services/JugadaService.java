package edu.projecte.jaquemate.api_rest_jaquemate.services;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;

import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.JugadaCreate;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.JugadaInfo;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.JugadaList;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.PaginaDto;

public interface JugadaService {

    PaginaDto<JugadaList> findAll(@NonNull Pageable paging);

    PaginaDto<JugadaList> findByUsuarioId(@NonNull Long usuarioId, @NonNull Pageable paging);

    PaginaDto<JugadaList> findByUsuarioNombre(@NonNull String nombre, @NonNull Pageable paging);

    Optional<JugadaInfo> findById(@NonNull Long id);

    JugadaInfo crearJugada(@NonNull JugadaCreate jugadaCreate);

    List<JugadaInfo> crearJugadasBatch(@NonNull List<JugadaCreate> jugadas);

    void eliminarJugada(@NonNull Long id);

    Optional<JugadaInfo> actualizarJugada(@NonNull Long id, @NonNull JugadaCreate jugadaCreate);

    List<JugadaList> exportarTodas();
}
