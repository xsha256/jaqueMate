package edu.projecte.jaquemate.api_rest_jaquemate.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JugadaInfo {

    private Long id;
    private Long usuarioId;
    private String moveSan;
    private String moveUciFrom;
    private String moveUciTo;
    private String fen;
    private String pgn;
    private LocalDateTime createdAt;
}
