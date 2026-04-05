package com.coleccion.videojuegos.igdb.service;

import com.coleccion.videojuegos.igdb.dto.IgdbGame;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Thin client for IGDB API v4.
 * We use it for:
 * - searching games when a user wants to link a local videojuego
 * - fetching one game by IGDB id to retrieve cover/artworks
 */
@Service
public class IgdbApiClient {

    private final RestTemplate restTemplate;
    private final IgdbAuthService auth;
    private final String apiUrl;

    public IgdbApiClient(RestTemplate restTemplate, IgdbAuthService auth,
                         @Value("${igdb.api-url}") String apiUrl) {
        this.restTemplate = restTemplate;
        this.auth = auth;
        this.apiUrl = apiUrl;
    }

    public List<IgdbGame> searchGames(String query, int limit) {
        String safeQuery = query == null ? "" : query.replace("\"", "");
        int safeLimit = Math.max(1, Math.min(limit, 50));

        String body = """
                search \"%s\";
                fields id,name,slug,cover.image_id,artworks.image_id,screenshots.image_id,platforms.name,genres.name,first_release_date;
                limit %d;
                """.formatted(safeQuery, safeLimit);

        IgdbGame[] res = post("/games", body, IgdbGame[].class);
        return res == null ? List.of() : List.of(res);
    }

    public IgdbGame getGameById(long igdbGameId) {
        String body = """
                fields id,name,slug,cover.image_id,artworks.image_id,screenshots.image_id,platforms.name,genres.name,first_release_date;
                where id = %d;
                limit 1;
                """.formatted(igdbGameId);

        IgdbGame[] res = post("/games", body, IgdbGame[].class);
        if (res == null || res.length == 0) return null;
        return res[0];
    }

    private <T> T post(String path, String body, Class<T> type) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Client-ID", auth.getClientId());
        headers.setBearerAuth(auth.getAccessToken());
        headers.setContentType(MediaType.TEXT_PLAIN);

        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        ResponseEntity<T> response = restTemplate.exchange(apiUrl + path, HttpMethod.POST, entity, type);
        return response.getBody();
    }
}
