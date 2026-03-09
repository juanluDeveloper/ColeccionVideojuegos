package com.coleccion.videojuegos.web.requests;

import jakarta.validation.constraints.NotNull;

/**
 * Request payload to link a local Videojuego with an IGDB game.
 */
public class LinkIgdbRequest {

    @NotNull
    private Long igdbGameId;

    public Long getIgdbGameId() {
        return igdbGameId;
    }

    public void setIgdbGameId(Long igdbGameId) {
        this.igdbGameId = igdbGameId;
    }
}
