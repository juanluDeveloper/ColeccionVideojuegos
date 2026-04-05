package com.coleccion.videojuegos.web.dto;

import com.coleccion.videojuegos.entity.Progreso;
import com.coleccion.videojuegos.entity.Soporte;
import com.coleccion.videojuegos.entity.Enums.Genero;
import com.coleccion.videojuegos.entity.Enums.Plataforma;

import java.sql.Date;
import java.util.List;
import java.util.Set;

/**
 * Extended detail DTO used when we want IGDB data.
 */
public record VideojuegoDetalleDTO(
        Integer id,
        String nombre,
        Float precio,
        Date fechaLanzamiento,
        Date fechaCompra,
        Plataforma plataforma,
        Set<Genero> generos,
        List<Progreso> progreso,
        List<Soporte> soporte,

        Long igdbGameId,
        String igdbUrl,
        String coverUrl,
        String artworkUrl
) {}
