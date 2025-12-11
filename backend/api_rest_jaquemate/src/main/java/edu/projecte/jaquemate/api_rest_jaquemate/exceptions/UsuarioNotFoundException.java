package edu.projecte.jaquemate.api_rest_jaquemate.exceptions;

import lombok.Getter;

@Getter
public class UsuarioNotFoundException extends RuntimeException {
    private final String errorCode;
    private final String message;

    public UsuarioNotFoundException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.message = message;
    }
}
