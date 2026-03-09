package com.coleccion.videojuegos.web.controllers;

import com.coleccion.videojuegos.igdb.dto.IgdbGame;
import com.coleccion.videojuegos.igdb.service.IgdbApiClient;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * IGDB endpoints used by the frontend to search and ...
 */
@RestController
@CrossOrigin(origins = { "*" })
@RequestMapping("/api/v1/igdb")
public class IgdbController {

    private final IgdbApiClient igdbApiClient;

    public IgdbController(IgdbApiClient igdbApiClient) {
        this.igdbApiClient = igdbApiClient;
    }

    /**
     * Search games in IGDB.
     * Example: GET /api/v1/igdb/search?q=Hollow Knight&limit=10
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/search")
    public List<IgdbGame> search(@RequestParam("q") String query,
                                 @RequestParam(value = "limit", defaultValue = "10") int limit) {
        return igdbApiClient.searchGames(query, limit);
    }
}
