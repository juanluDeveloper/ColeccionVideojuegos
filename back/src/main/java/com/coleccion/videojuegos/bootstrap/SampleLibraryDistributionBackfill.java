package com.coleccion.videojuegos.bootstrap;

import com.coleccion.videojuegos.entity.Soporte;
import com.coleccion.videojuegos.entity.Videojuego;
import com.coleccion.videojuegos.entity.Enums.Distribucion;
import com.coleccion.videojuegos.entity.Enums.Tipo;
import com.coleccion.videojuegos.repository.VideojuegoRepository;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

@Component
@ConditionalOnProperty(name = "app.backfill.sample-library-distribucion", havingValue = "true")
public class SampleLibraryDistributionBackfill implements CommandLineRunner {

    private final VideojuegoRepository videojuegoRepository;

    public SampleLibraryDistributionBackfill(VideojuegoRepository videojuegoRepository) {
        this.videojuegoRepository = videojuegoRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<Videojuego> videojuegos = videojuegoRepository.findAll();
        int soportesActualizados = 0;

        for (Videojuego videojuego : videojuegos) {
            boolean changed = false;
            for (Soporte soporte : videojuego.getSoporte()) {
                if (soporte.getDistribucion() != null) {
                    continue;
                }
                Distribucion distribucion = resolveDistribucion(videojuego.getNombre(), soporte.getTipo());
                if (distribucion != null) {
                    soporte.setDistribucion(distribucion);
                    soportesActualizados++;
                    changed = true;
                }
            }
            if (changed) {
                videojuegoRepository.save(videojuego);
            }
        }

        System.out.printf("[backfill] Soportes actualizados con distribucion: %d%n", soportesActualizados);
    }

    private Distribucion resolveDistribucion(String nombreJuego, Tipo tipo) {
        String nombre = nombreJuego == null ? "" : nombreJuego.trim().toLowerCase(Locale.ROOT);

        if ("the legend of zelda: tears of the kingdom".equals(nombre)) {
            return tipo == Tipo.Digital ? Distribucion.Nintendo_eShop : Distribucion.Retail;
        }
        if ("hollow knight".equals(nombre)) {
            return Distribucion.Nintendo_eShop;
        }
        if ("chrono trigger".equals(nombre)) {
            return Distribucion.PlayAsia;
        }
        if ("the witcher 3: wild hunt".equals(nombre)) {
            return Distribucion.GOG;
        }

        return switch (nombre) {
            case "super mario odyssey",
                 "metroid dread",
                 "fire emblem: three houses",
                 "xenoblade chronicles 3",
                 "animal crossing: new horizons",
                 "luigi's mansion 3",
                 "mario kart 8 deluxe",
                 "octopath traveler ii",
                 "shadow of the colossus",
                 "final fantasy x",
                 "metal gear solid 3: subsistence",
                 "okami",
                 "gran turismo 4",
                 "god of war ii",
                 "persona 4",
                 "burnout 3: takedown",
                 "pokemon emerald",
                 "castlevania: aria of sorrow",
                 "tetris",
                 "resident evil 4",
                 "sonic adventure",
                 "halo 3",
                 "the last of us remastered",
                 "persona 5 royal",
                 "astro bot",
                 "super mario world" -> Distribucion.Retail;
            default -> null;
        };
    }
}
