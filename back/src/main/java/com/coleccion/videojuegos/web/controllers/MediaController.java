package com.coleccion.videojuegos.web.controllers;

import com.coleccion.videojuegos.entity.Videojuego;
import com.coleccion.videojuegos.igdb.service.IgdbImageCacheService;
import com.coleccion.videojuegos.service.VideojuegosUsuarioService;
import com.coleccion.videojuegos.utils.AuthorizationUtils;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * Serves cached IGDB images (Phase 3: local backend proxy).
 */
@RestController
@CrossOrigin(origins = { "*" })
@RequestMapping("/api/v1/media")
public class MediaController {

    private final VideojuegosUsuarioService videojuegosService;
    private final IgdbImageCacheService imageCache;
    private final AuthorizationUtils authorizationUtils;

    public MediaController(VideojuegosUsuarioService videojuegosService,
                           IgdbImageCacheService imageCache,
                           AuthorizationUtils authorizationUtils) {
        this.videojuegosService = videojuegosService;
        this.imageCache = imageCache;
        this.authorizationUtils = authorizationUtils;
    }

    /**
     * Returns the cached cover for a local videojuego.
     * If not cached, it will be downloaded once and stored locally.
     */
    @PreAuthorize("@authorizationUtils.isOwner(#id, authentication.name)")
    @GetMapping(value = "/videojuegos/{id}/cover", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> getCover(@PathVariable("id") Integer id, Authentication authentication) throws IOException {
        Videojuego v = videojuegosService.getVideojuego(id);
        if (v.getIgdbGameId() == null) {
            return ResponseEntity.notFound().build();
        }

        imageCache.ensureCoverCached(v);
        long igdbId = v.getIgdbGameId();
        if (!imageCache.coverExists(igdbId)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS))
                .body(imageCache.readCover(igdbId));
    }

    /**
     * Returns the cached artwork for a local videojuego.
     */
    @PreAuthorize("@authorizationUtils.isOwner(#id, authentication.name)")
    @GetMapping(value = "/videojuegos/{id}/artwork", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> getArtwork(@PathVariable("id") Integer id, Authentication authentication) throws IOException {
        Videojuego v = videojuegosService.getVideojuego(id);
        if (v.getIgdbGameId() == null) {
            return ResponseEntity.notFound().build();
        }

        imageCache.ensureArtworkCached(v);
        long igdbId = v.getIgdbGameId();
        if (!imageCache.artworkExists(igdbId)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS))
                .body(imageCache.readArtwork(igdbId));
    }
}
