package com.coleccion.videojuegos.igdb.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Twitch OAuth2 token response.
 */
public record IgdbTokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("expires_in") long expiresIn,
        @JsonProperty("token_type") String tokenType
) {}
