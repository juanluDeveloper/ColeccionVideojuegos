package com.coleccion.videojuegos.igdb.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Builds image URLs for IGDB images using image_id and size.
 */
@Component
public class IgdbImageUrlBuilder {

    private final String imagesBaseUrl;
    private final String defaultCoverSize;
    private final String defaultArtworkSize;

    public IgdbImageUrlBuilder(
            @Value("${igdb.images-base-url}") String imagesBaseUrl,
            @Value("${igdb.default-cover-size:t_cover_big}") String defaultCoverSize,
            @Value("${igdb.default-artwork-size:t_720p}") String defaultArtworkSize
    ) {
        this.imagesBaseUrl = imagesBaseUrl;
        this.defaultCoverSize = defaultCoverSize;
        this.defaultArtworkSize = defaultArtworkSize;
    }

    public String coverUrl(String imageId) {
        return imageUrl(imageId, defaultCoverSize);
    }

    public String artworkUrl(String imageId) {
        return imageUrl(imageId, defaultArtworkSize);
    }

    public String imageUrl(String imageId, String size) {
        if (imageId == null || imageId.isBlank()) {
            return null;
        }
        String safeSize = (size == null || size.isBlank()) ? defaultCoverSize : size;
        return imagesBaseUrl + "/" + safeSize + "/" + imageId + ".jpg";
    }
}
