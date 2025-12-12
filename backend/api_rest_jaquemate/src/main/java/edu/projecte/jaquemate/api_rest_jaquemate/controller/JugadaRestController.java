package edu.projecte.jaquemate.api_rest_jaquemate.controller;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import edu.projecte.jaquemate.api_rest_jaquemate.helper.PaginationHelper;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.JugadaCreate;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.JugadaCsvImport;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.JugadaInfo;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.JugadaList;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.ListadoRespuesta;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.PaginaDto;
import edu.projecte.jaquemate.api_rest_jaquemate.services.JugadaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/jugadas")
public class JugadaRestController {

    private final JugadaService jugadaService;

    public JugadaRestController(JugadaService jugadaService) {
        this.jugadaService = jugadaService;
    }

    @GetMapping
    public ResponseEntity<ListadoRespuesta<JugadaList>> getAllJugadas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {

        Pageable pageable = PaginationHelper.createPageable(page, size, sort);
        PaginaDto<JugadaList> paginaJugadaList = jugadaService.findAll(pageable);

        ListadoRespuesta<JugadaList> response = new ListadoRespuesta<>(
                paginaJugadaList.getNumber(),
                paginaJugadaList.getSize(),
                paginaJugadaList.getTotalElements(),
                paginaJugadaList.getTotalPages(),
                paginaJugadaList.getContent());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<ListadoRespuesta<JugadaList>> getJugadasByUsuarioId(
            @PathVariable Long usuarioId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {

        Pageable pageable = PaginationHelper.createPageable(page, size, sort);
        PaginaDto<JugadaList> paginaJugadaList = jugadaService.findByUsuarioId(usuarioId, pageable);

        ListadoRespuesta<JugadaList> response = new ListadoRespuesta<>(
                paginaJugadaList.getNumber(),
                paginaJugadaList.getSize(),
                paginaJugadaList.getTotalElements(),
                paginaJugadaList.getTotalPages(),
                paginaJugadaList.getContent());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/jugador/{nombre}")
    public ResponseEntity<ListadoRespuesta<JugadaList>> getJugadasByJugadorNombre(
            @PathVariable String nombre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {

        Pageable pageable = PaginationHelper.createPageable(page, size, sort);
        PaginaDto<JugadaList> paginaJugadaList = jugadaService.findByUsuarioNombre(nombre, pageable);

        ListadoRespuesta<JugadaList> response = new ListadoRespuesta<>(
                paginaJugadaList.getNumber(),
                paginaJugadaList.getSize(),
                paginaJugadaList.getTotalElements(),
                paginaJugadaList.getTotalPages(),
                paginaJugadaList.getContent());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JugadaInfo> getJugadaById(@PathVariable Long id) {
        Optional<JugadaInfo> jugadaInfo = jugadaService.findById(id);
        return jugadaInfo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<JugadaInfo> crearJugada(@Valid @RequestBody JugadaCreate jugadaCreate) {
        JugadaInfo nuevaJugada = jugadaService.crearJugada(jugadaCreate);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaJugada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarJugada(@PathVariable Long id) {
        jugadaService.eliminarJugada(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/exportar/csv")
    public ResponseEntity<String> exportarCsv() {
        List<JugadaList> jugadas = jugadaService.exportarTodas();

        StringWriter writer = new StringWriter();
        writer.append("usuario,fen,move_uci,move_san,created_at\n");

        for (JugadaList jugada : jugadas) {
            writer.append(escapeCsv(jugada.getUsuarioNombre())).append(",");
            writer.append(escapeCsv(jugada.getFen())).append(",");
            writer.append(escapeCsv(jugada.getMoveUci())).append(",");
            writer.append(escapeCsv(jugada.getMoveSan())).append(",");
            writer.append(jugada.getCreatedAt() != null ? jugada.getCreatedAt().toString() : "").append("\n");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "jugadas_export.csv");

        return new ResponseEntity<>(writer.toString(), headers, HttpStatus.OK);
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    @PostMapping("/importar/csv")
    public ResponseEntity<?> importarCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("usuarioId") Long usuarioId) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("El archivo está vacío");
        }

        List<JugadaCsvImport> preview = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isHeader = true;

            while ((line = reader.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                String[] parts = line.split(",");
                if (parts.length >= 2) {
                    JugadaCsvImport csvRow = new JugadaCsvImport(
                            parts[0].trim(),
                            parts[1].trim());
                    preview.add(csvRow);
                }
            }

            return ResponseEntity.ok(preview);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al procesar el archivo: " + e.getMessage());
        }
    }

    @PostMapping("/importar/confirmar")
    public ResponseEntity<?> confirmarImportacion(
            @RequestParam("usuarioId") Long usuarioId,
            @RequestBody List<JugadaCsvImport> jugadas) {

        List<JugadaCreate> jugadasCreate = new ArrayList<>();

        for (JugadaCsvImport csvRow : jugadas) {
            String bestMove = csvRow.getJugadas();
            String moveFrom = bestMove.length() >= 2 ? bestMove.substring(0, 2) : "";
            String moveTo = bestMove.length() >= 4 ? bestMove.substring(2, 4) : "";

            JugadaCreate jugadaCreate = new JugadaCreate(
                    usuarioId,
                    null,
                    moveFrom,
                    moveTo,
                    csvRow.getFen(),
                    null);
            jugadasCreate.add(jugadaCreate);
        }

        List<JugadaInfo> resultado = jugadaService.crearJugadasBatch(jugadasCreate);
        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }
}
