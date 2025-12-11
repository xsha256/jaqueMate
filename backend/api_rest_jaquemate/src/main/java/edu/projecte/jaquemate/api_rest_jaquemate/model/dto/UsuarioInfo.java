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
public class UsuarioInfo {
    private Long id;
    private String usuario;
    private String email;
    private LocalDateTime creado;
}
