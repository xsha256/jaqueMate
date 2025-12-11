package edu.projecte.jaquemate.api_rest_jaquemate.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class LoginUsuario {
    @NotBlank(message = "El usuario es obligatorio")
    @Size(min = 3, message = "El usuario debe de tener un tamaño mínimo de 3 caracteres")
    private String usuario;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;
}
