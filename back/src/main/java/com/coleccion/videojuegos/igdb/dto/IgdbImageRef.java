package com.coleccion.videojuegos.igdb.dto;

/**
 * Minimal representation of an IGDB image reference.
 * IGDB returns an image_id which can be used to build URLs.
 */
public record IgdbImageRef(String image_id) {}
