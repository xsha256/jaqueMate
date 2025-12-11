package edu.projecte.jaquemate.api_rest_jaquemate.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CustomErrorResponse {
    private String errorCode;
    private String message;
}
