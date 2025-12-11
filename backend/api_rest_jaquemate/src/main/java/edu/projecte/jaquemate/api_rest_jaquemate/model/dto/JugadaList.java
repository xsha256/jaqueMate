package edu.projecte.jaquemate.api_rest_jaquemate.model.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class JugadaList implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String usuarioNombre;
    private String fen;
    private String moveUci;
    private String moveSan;
    private LocalDateTime createdAt;
}
