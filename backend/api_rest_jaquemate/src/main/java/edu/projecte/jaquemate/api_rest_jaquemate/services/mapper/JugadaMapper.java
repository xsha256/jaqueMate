package edu.projecte.jaquemate.api_rest_jaquemate.services.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import edu.projecte.jaquemate.api_rest_jaquemate.model.db.Jugadas;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.JugadaInfo;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.JugadaList;

@Mapper
public interface JugadaMapper {
    JugadaMapper INSTANCE = Mappers.getMapper(JugadaMapper.class);

    @Mapping(target = "usuarioNombre", source = "usuario.usuario")
    @Mapping(target = "moveUci", source = ".", qualifiedByName = "combineUci")
    JugadaList jugadaToJugadaList(Jugadas jugada);

    List<JugadaList> jugadasToJugadaList(List<Jugadas> jugadas);

    @Mapping(target = "usuarioId", source = "usuario.id")
    JugadaInfo jugadaToJugadaInfo(Jugadas jugada);

    List<JugadaInfo> jugadasToJugadaInfo(List<Jugadas> jugadas);

    @Named("combineUci")
    default String combineUci(Jugadas jugada) {
        if (jugada.getMoveUciFrom() != null && jugada.getMoveUciTo() != null) {
            return jugada.getMoveUciFrom() + jugada.getMoveUciTo();
        }
        return null;
    }
}
