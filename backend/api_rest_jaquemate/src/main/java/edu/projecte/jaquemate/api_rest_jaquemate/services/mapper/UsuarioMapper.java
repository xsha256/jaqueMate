package edu.projecte.jaquemate.api_rest_jaquemate.services.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import edu.projecte.jaquemate.api_rest_jaquemate.model.db.Usuario;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.UsuarioCreate;
import edu.projecte.jaquemate.api_rest_jaquemate.model.dto.UsuarioInfo;

@Mapper
public interface UsuarioMapper {
    UsuarioMapper INSTANCE = Mappers.getMapper(UsuarioMapper.class);

    UsuarioInfo usuarioToUserInfo(Usuario usuario);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creado", ignore = true)
    Usuario usuarioCreateToUsuario(UsuarioCreate usuarioCreate);
}
