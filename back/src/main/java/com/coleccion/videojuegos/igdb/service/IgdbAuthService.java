package com.coleccion.videojuegos.igdb.service;

import com.coleccion.videojuegos.igdb.dto.IgdbTokenResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;

/**
 * Handles Twitch OAuth2 client_credentials for IGDB.
 * Caches the token in-memory to avoid requesting it on every call.
 */
@Service
public class IgdbAuthService {

    private final RestTemplate restTemplate;
    private final String tokenUrl;
    private final String clientId;
    private final String clientSecret;

    private String accessToken;
    private Instant expiresAt;

    public IgdbAuthService(
            RestTemplate restTemplate,
            @Value("${igdb.token-url}") String tokenUrl,
            @Value("${igdb.client-id}") String clientId,
            @Value("${igdb.client-secret}") String clientSecret
    ) {
        this.restTemplate = restTemplate;
        this.tokenUrl = tokenUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public synchronized String getAccessToken() {
        if (accessToken != null && expiresAt != null && Instant.now().isBefore(expiresAt.minusSeconds(30))) {
            return accessToken;
        }

        if (clientId == null || clientId.isBlank() || clientSecret == null || clientSecret.isBlank()) {
            throw new IllegalStateException("IGDB client-id/client-secret not configured. Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET.");
        }

        String url = tokenUrl
                + "?client_id=" + clientId
                + "&client_secret=" + clientSecret
                + "&grant_type=client_credentials";

        IgdbTokenResponse response = restTemplate.postForObject(url, null, IgdbTokenResponse.class);
        if (response == null || response.accessToken() == null || response.accessToken().isBlank()) {
            throw new IllegalStateException("Failed to obtain Twitch OAuth token for IGDB.");
        }

        this.accessToken = response.accessToken();
        this.expiresAt = Instant.now().plusSeconds(response.expiresIn());
        return accessToken;
    }

    public String getClientId() {
        return clientId;
    }
}
