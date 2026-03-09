package com.coleccion.videojuegos.igdb.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Simple HTTP client configuration for IGDB/Twitch integration.
 */
@Configuration
public class IgdbRestConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
