package edu.projecte.jaquemate.api_rest_jaquemate.model.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ListadoRespuesta<T> {
    private int number;
    private int size;
    private long totalElements;
    private int totalPages;
    private List<T> content;
}
