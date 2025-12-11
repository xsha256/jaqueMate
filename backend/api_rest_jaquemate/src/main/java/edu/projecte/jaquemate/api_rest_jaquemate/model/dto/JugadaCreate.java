package edu.projecte.jaquemate.api_rest_jaquemate.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class JugadaCreate {
    @NotNull(message = "El usuario_id es obligatorio")
    private Long usuarioId;

    private String moveSan;

    @NotBlank(message = "El move_uci_from es obligatorio")
    private String moveUciFrom;

    @NotBlank(message = "El move_uci_to es obligatorio")
    private String moveUciTo;

    @NotBlank(message = "El FEN es obligatorio")
    private String fen;

    private String pgn;
}
