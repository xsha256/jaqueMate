package edu.projecte.jaquemate.api_rest_jaquemate.model.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class UsuarioUpdate {

    @Size(min = 3, max = 50, message = "El usuario debe tener entre 3 y 50 caracteres")
    private String usuario;

    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;
}
