package com.coleccion.videojuegos.igdb.service;

import com.coleccion.videojuegos.entity.Videojuego;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Phase 3: Local caching/proxying of IGDB images.
 *
 * IGDB recommended this approach for performance...
 */
@Service
public class IgdbImageCacheService {

    private final RestTemplate restTemplate;
    private final IgdbImageUrlBuilder urlBuilder;
    private final Path baseDir;

    public IgdbImageCacheService(RestTemplate restTemplate,
                                IgdbImageUrlBuilder urlBuilder,
                                @Value("${igdb.storage.dir:storage/igdb}") String storageDir) {
        this.restTemplate = restTemplate;
        this.urlBuilder = urlBuilder;
        this.baseDir = Paths.get(storageDir);
        try {
            Files.createDirectories(this.baseDir);
        } catch (IOException e) {
            throw new RuntimeException("Unable to create IGDB storage directory: " + this.baseDir, e);
        }
    }

    public Path coverPath(long igdbGameId) {
        return baseDir.resolve("covers").resolve(igdbGameId + ".jpg");
    }

    public Path artworkPath(long igdbGameId) {
        return baseDir.resolve("artworks").resolve(igdbGameId + ".jpg");
    }

    public void ensureCoverCached(Videojuego videojuego) {
        if (videojuego == null || videojuego.getIgdbGameId() == null) return;
        long igdbId = videojuego.getIgdbGameId();
        String imageId = videojuego.getIgdbCoverImageId();
        if (imageId == null || imageId.isBlank()) return;

        Path path = coverPath(igdbId);
        if (Files.exists(path)) return;

        try {
            Files.createDirectories(path.getParent());
            byte[] bytes = download(urlBuilder.coverUrl(imageId));
            if (bytes != null && bytes.length > 0) {
                Files.write(path, bytes);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed caching IGDB cover for igdbGameId=" + igdbId, e);
        }
    }

    public void ensureArtworkCached(Videojuego videojuego) {
        if (videojuego == null || videojuego.getIgdbGameId() == null) return;
        long igdbId = videojuego.getIgdbGameId();
        String imageId = videojuego.getIgdbArtworkImageId();
        if (imageId == null || imageId.isBlank()) return;

        Path path = artworkPath(igdbId);
        if (Files.exists(path)) return;

        try {
            Files.createDirectories(path.getParent());
            byte[] bytes = download(urlBuilder.artworkUrl(imageId));
            if (bytes != null && bytes.length > 0) {
                Files.write(path, bytes);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed caching IGDB artwork for igdbGameId=" + igdbId, e);
        }
    }

    public byte[] readCover(long igdbGameId) throws IOException {
        return Files.readAllBytes(coverPath(igdbGameId));
    }

    public byte[] readArtwork(long igdbGameId) throws IOException {
        return Files.readAllBytes(artworkPath(igdbGameId));
    }

    public boolean coverExists(long igdbGameId) {
        return Files.exists(coverPath(igdbGameId));
    }

    public boolean artworkExists(long igdbGameId) {
        return Files.exists(artworkPath(igdbGameId));
    }

    private byte[] download(String url) {
        if (url == null || url.isBlank()) return null;
        ResponseEntity<byte[]> res = restTemplate.getForEntity(url, byte[].class);
        return res.getBody();
    }
}
