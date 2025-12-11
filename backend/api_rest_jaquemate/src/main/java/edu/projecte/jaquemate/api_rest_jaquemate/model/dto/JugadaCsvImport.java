package edu.projecte.jaquemate.api_rest_jaquemate.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class JugadaCsvImport {
    private String fen;
    private String jugadas;
}
