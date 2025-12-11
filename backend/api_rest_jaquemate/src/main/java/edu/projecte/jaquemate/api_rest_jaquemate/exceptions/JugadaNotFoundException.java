package edu.projecte.jaquemate.api_rest_jaquemate.exceptions;

import lombok.Getter;

@Getter
public class JugadaNotFoundException extends RuntimeException {
    private final String errorCode;
    private final String message;

    public JugadaNotFoundException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.message = message;
    }
}
