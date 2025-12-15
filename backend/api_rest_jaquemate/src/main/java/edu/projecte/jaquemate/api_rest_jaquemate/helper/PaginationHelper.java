package edu.projecte.jaquemate.api_rest_jaquemate.helper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.domain.Sort.Order;

public class PaginationHelper {

    private PaginationHelper() {
    }

    /**
     * @param page
     * @param size
     * @param sort
     * @return
     */
    public static Pageable createPageable(int page, int size, String[] sort) {

        List<Order> criteriosOrdenacion = new ArrayList<>();
        if (sort[0].contains(",")) {
            for (String criterioOrdenacion : sort) {
                String[] orden = criterioOrdenacion.split(",");
                if (orden.length > 1) {
                    criteriosOrdenacion.add(new Order(Direction.fromString(orden[1]), orden[0]));
                } else {
                    criteriosOrdenacion.add(new Order(Direction.fromString("asc"), orden[0]));
                }
            }
        } else {
            criteriosOrdenacion.add(new Order(Direction.fromString(sort[1]), sort[0]));
        }

        Sort sorts = Sort.by(criteriosOrdenacion);
        return PageRequest.of(page, size, sorts);
    }
}
