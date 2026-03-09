package com.coleccion.videojuegos.igdb.dto;

import java.util.List;

/**
 * Minimal IGDB Game response for our use case (covers/artworks).
 */
public record IgdbGame(
        long id,
        String name,
        String slug,
        IgdbImageRef cover,
        List<IgdbImageRef> artworks,
        List<IgdbImageRef> screenshots
) {}
