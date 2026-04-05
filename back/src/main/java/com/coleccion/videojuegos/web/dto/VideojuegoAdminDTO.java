package com.coleccion.videojuegos.web.dto;

import java.sql.Date;
import java.util.List;
import java.util.Set;

import com.coleccion.videojuegos.entity.Progreso;
import com.coleccion.videojuegos.entity.Soporte;
import com.coleccion.videojuegos.entity.Enums.Genero;
import com.coleccion.videojuegos.entity.Enums.Plataforma;
import com.coleccion.videojuegos.entity.Videojuego;
import com.coleccion.videojuegos.entity.Usuario;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VideojuegoAdminDTO {
    
    private Integer id;
    private String nombre;
    private Float precio;
    private Date fechaLanzamiento;
    private Date fechaCompra;
    private Plataforma plataforma;
    private Set<Genero> generos;
    private List<Progreso> progreso;
    private List<Soporte> soporte;
    private UserDTO usuario;

    /** ✅ Constructor basado en la entidad `Videojuego` */
    public VideojuegoAdminDTO(Videojuego videojuego, Usuario usuario) {
        this.id = videojuego.getId();
        this.nombre = videojuego.getNombre();
        this.precio = videojuego.getPrecio();
        this.fechaLanzamiento = videojuego.getFechaLanzamiento();
        this.fechaCompra = videojuego.getFechaCompra();
        this.plataforma = videojuego.getPlataforma();
        this.generos = videojuego.getGeneros();
        this.progreso = videojuego.getProgreso();
        this.soporte = videojuego.getSoporte();
        this.usuario = new UserDTO(
            usuario.getId(),
            usuario.getUsername(),
            usuario.getEmail(),
            usuario.getRolesAsStrings()
        );
    }
}
