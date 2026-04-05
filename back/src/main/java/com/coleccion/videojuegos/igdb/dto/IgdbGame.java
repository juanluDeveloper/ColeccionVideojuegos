package com.coleccion.videojuegos.igdb.dto;

import java.util.List;

/**
 * IGDB Game response — covers, artworks, platforms, genres and release date.
 */
public record IgdbGame(
        long id,
        String name,
        String slug,
        IgdbImageRef cover,
        List<IgdbImageRef> artworks,
        List<IgdbImageRef> screenshots,
        List<IgdbPlatform> platforms,
        List<IgdbGenre> genres,
        Long first_release_date
) {}
