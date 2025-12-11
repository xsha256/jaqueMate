package edu.projecte.jaquemate.api_rest_jaquemate.services.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import edu.projecte.jaquemate.api_rest_jaquemate.exceptions.UsuarioNotFoundException;
import edu.projecte.jaquemate.api_rest_jaquemate.model.db.Jugadas;
import edu.projecte.jaquemate.api_rest_jaquemate.model.db.Usuario;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.JugadaCreate;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.JugadaInfo;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.JugadaList;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.PaginaDto;
import edu.projecte.jaquemate.api_rest_jaquemate.repository.JugadasRepository;
import edu.projecte.jaquemate.api_rest_jaquemate.repository.UsuarioRepository;
import edu.projecte.jaquemate.api_rest_jaquemate.services.JugadaService;
import edu.projecte.jaquemate.api_rest_jaquemate.services.mapper.JugadaMapper;

@Service
public class JugadaServiceImpl implements JugadaService {

    private final JugadasRepository jugadasRepository;
    private final UsuarioRepository usuarioRepository;

    public JugadaServiceImpl(JugadasRepository jugadasRepository, UsuarioRepository usuarioRepository) {
        this.jugadasRepository = jugadasRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public PaginaDto<JugadaList> findAll(@NonNull Pageable paging) {
        Page<Jugadas> paginaJugadasDb = jugadasRepository.findAll(paging);
        return new PaginaDto<>(
                paginaJugadasDb.getNumber(),
                paginaJugadasDb.getSize(),
                paginaJugadasDb.getTotalElements(),
                paginaJugadasDb.getTotalPages(),
                JugadaMapper.INSTANCE.jugadasToJugadaList(paginaJugadasDb.getContent()),
                paginaJugadasDb.getSort());
    }

    @Override
    public PaginaDto<JugadaList> findByUsuarioId(@NonNull Long usuarioId, @NonNull Pageable paging) {
        Page<Jugadas> paginaJugadasDb = jugadasRepository.findByUsuarioId(usuarioId, paging);
        return new PaginaDto<>(
                paginaJugadasDb.getNumber(),
                paginaJugadasDb.getSize(),
                paginaJugadasDb.getTotalElements(),
                paginaJugadasDb.getTotalPages(),
                JugadaMapper.INSTANCE.jugadasToJugadaList(paginaJugadasDb.getContent()),
                paginaJugadasDb.getSort());
    }

    @Override
    public PaginaDto<JugadaList> findByUsuarioNombre(@NonNull String nombre, @NonNull Pageable paging) {
        Page<Jugadas> paginaJugadasDb = jugadasRepository.findByUsuarioNombreContaining(nombre, paging);
        return new PaginaDto<>(
                paginaJugadasDb.getNumber(),
                paginaJugadasDb.getSize(),
                paginaJugadasDb.getTotalElements(),
                paginaJugadasDb.getTotalPages(),
                JugadaMapper.INSTANCE.jugadasToJugadaList(paginaJugadasDb.getContent()),
                paginaJugadasDb.getSort());
    }

    @Override
    public Optional<JugadaInfo> findById(@NonNull Long id) {
        Optional<Jugadas> jugadaDb = jugadasRepository.findById(id);
        if (jugadaDb.isPresent()) {
            return jugadaDb.map(JugadaMapper.INSTANCE::jugadaToJugadaInfo);
        }
        return Optional.empty();
    }

    @Override
    public JugadaInfo crearJugada(@NonNull JugadaCreate jugadaCreate) {
        Usuario usuario = usuarioRepository.findById(jugadaCreate.getUsuarioId())
                .orElseThrow(() -> new UsuarioNotFoundException("USUARIO_NOT_FOUND",
                        "Usuario con id " + jugadaCreate.getUsuarioId() + " no encontrado"));

        Jugadas jugada = Jugadas.builder()
                .usuario(usuario)
                .moveSan(jugadaCreate.getMoveSan())
                .moveUciFrom(jugadaCreate.getMoveUciFrom())
                .moveUciTo(jugadaCreate.getMoveUciTo())
                .fen(jugadaCreate.getFen())
                .pgn(jugadaCreate.getPgn())
                .build();

        Jugadas jugadaGuardada = jugadasRepository.save(jugada);
        return JugadaMapper.INSTANCE.jugadaToJugadaInfo(jugadaGuardada);
    }

    @Override
    public List<JugadaInfo> crearJugadasBatch(@NonNull List<JugadaCreate> jugadas) {
        List<JugadaInfo> resultado = new ArrayList<>();
        for (JugadaCreate jugadaCreate : jugadas) {
            resultado.add(crearJugada(jugadaCreate));
        }
        return resultado;
    }

    @Override
    public void eliminarJugada(@NonNull Long id) {
        jugadasRepository.deleteById(id);
    }

    @Override
    public Optional<JugadaInfo> actualizarJugada(@NonNull Long id, @NonNull JugadaCreate jugadaCreate) {
        Optional<Jugadas> jugadaExistente = jugadasRepository.findById(id);
        if (jugadaExistente.isEmpty()) {
            return Optional.empty();
        }

        Usuario usuario = usuarioRepository.findById(jugadaCreate.getUsuarioId())
                .orElseThrow(() -> new UsuarioNotFoundException("USUARIO_NOT_FOUND",
                        "Usuario con id " + jugadaCreate.getUsuarioId() + " no encontrado"));

        Jugadas jugada = jugadaExistente.get();
        jugada.setUsuario(usuario);
        jugada.setMoveSan(jugadaCreate.getMoveSan());
        jugada.setMoveUciFrom(jugadaCreate.getMoveUciFrom());
        jugada.setMoveUciTo(jugadaCreate.getMoveUciTo());
        jugada.setFen(jugadaCreate.getFen());
        jugada.setPgn(jugadaCreate.getPgn());

        Jugadas jugadaActualizada = jugadasRepository.save(jugada);
        return Optional.of(JugadaMapper.INSTANCE.jugadaToJugadaInfo(jugadaActualizada));
    }

    @Override
    public List<JugadaList> exportarTodas() {
        List<Jugadas> todasLasJugadas = jugadasRepository.findAll();
        return JugadaMapper.INSTANCE.jugadasToJugadaList(todasLasJugadas);
    }
}
