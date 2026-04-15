package com.coleccion.videojuegos.bootstrap;

import com.coleccion.videojuegos.entity.Progreso;
import com.coleccion.videojuegos.entity.Soporte;
import com.coleccion.videojuegos.entity.Usuario;
import com.coleccion.videojuegos.entity.Videojuego;
import com.coleccion.videojuegos.entity.Enums.Avance;
import com.coleccion.videojuegos.entity.Enums.Distribucion;
import com.coleccion.videojuegos.entity.Enums.Edicion;
import com.coleccion.videojuegos.entity.Enums.Estado;
import com.coleccion.videojuegos.entity.Enums.Genero;
import com.coleccion.videojuegos.entity.Enums.Plataforma;
import com.coleccion.videojuegos.entity.Enums.Region;
import com.coleccion.videojuegos.entity.Enums.Tienda;
import com.coleccion.videojuegos.entity.Enums.Tipo;
import com.coleccion.videojuegos.repository.UserRepository;
import com.coleccion.videojuegos.repository.VideojuegoRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Date;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@ConditionalOnProperty(name = "app.seed.sample-library", havingValue = "true")
public class SampleLibrarySeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VideojuegoRepository videojuegoRepository;

    public SampleLibrarySeeder(UserRepository userRepository, VideojuegoRepository videojuegoRepository) {
        this.userRepository = userRepository;
        this.videojuegoRepository = videojuegoRepository;
    }

    @Override
    public void run(String... args) {
        List<Usuario> usuarios = userRepository.findAll();
        if (usuarios.isEmpty()) {
            System.out.println("[seed] No hay usuarios. Se omite la carga de biblioteca.");
            return;
        }

        List<GameSeed> seeds = buildSeeds();

        for (Usuario usuario : usuarios) {
            Set<String> existentes = videojuegoRepository.findByUsuario(usuario).stream()
                    .map(Videojuego::getNombre)
                    .filter(nombre -> nombre != null && !nombre.isBlank())
                    .map(this::normalizeName)
                    .collect(Collectors.toSet());

            int insertados = 0;
            for (GameSeed seed : seeds) {
                if (existentes.contains(normalizeName(seed.nombre()))) {
                    continue;
                }
                videojuegoRepository.save(toEntity(seed, usuario));
                existentes.add(normalizeName(seed.nombre()));
                insertados++;
            }

            System.out.printf("[seed] Usuario %s: %d videojuegos nuevos insertados.%n", usuario.getUsername(), insertados);
        }
    }

    private String normalizeName(String nombre) {
        return nombre.trim().toLowerCase(Locale.ROOT);
    }

    private Videojuego toEntity(GameSeed seed, Usuario usuario) {
        Videojuego videojuego = Videojuego.builder()
                .nombre(seed.nombre())
                .fechaLanzamiento(seed.fechaLanzamiento())
                .plataforma(seed.plataforma())
                .generos(new HashSet<>(seed.generos()))
                .usuario(usuario)
                .build();

        seed.soportes().forEach(soporteSeed -> videojuego.addSoporte(
                new Soporte(
                        null,
                        soporteSeed.tipo(),
                        soporteSeed.estado(),
                        soporteSeed.edicion(),
                        soporteSeed.distribucion(),
                        soporteSeed.precintado(),
                        soporteSeed.region(),
                        soporteSeed.anyoSalidaDist(),
                        soporteSeed.tienda(),
                        soporteSeed.precio(),
                        soporteSeed.fechaCompra(),
                        videojuego
                )
        ));

        seed.progresos().forEach(progresoSeed -> videojuego.addProgreso(
                new Progreso(
                        null,
                        progresoSeed.anyoJugado(),
                        progresoSeed.avance(),
                        progresoSeed.horasJugadas(),
                        progresoSeed.completadoCien(),
                        progresoSeed.nota(),
                        videojuego
                )
        ));

        return videojuego;
    }

    private List<GameSeed> buildSeeds() {
        List<GameSeed> seeds = new ArrayList<>();

        seeds.add(game(
                "The Legend of Zelda: Tears of the Kingdom",
                "2023-05-12",
                Plataforma.Nintendo_Switch,
                genres(Genero.Accion_Aventura, Genero.Sandbox),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Coleccionista, Distribucion.Retail, false, Region.PAL_ESP, 2023, Tienda.Game, 129.95f, "2023-05-12"),
                        support(Tipo.Digital, Estado.Perfecto, Edicion.Normal, Distribucion.Nintendo_eShop, false, Region.PAL_ESP, 2023, null, 69.99f, "2023-05-12")
                ),
                progress(
                        play(2023, Avance.Completado, 146f, true, 9.8f)
                )
        ));

        seeds.add(game(
                "Super Mario Odyssey",
                "2017-10-27",
                Plataforma.Nintendo_Switch,
                genres(Genero.Plataformas_3D, Genero.Aventuras),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2017, Tienda.Amazon, 42.90f, "2019-06-14")
                ),
                progress(
                        play(2020, Avance.Completado, 32f, false, 9.4f)
                )
        ));

        seeds.add(game(
                "Metroid Dread",
                "2021-10-08",
                Plataforma.Nintendo_Switch,
                genres(Genero.Metroidvania, Genero.Accion),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Limitada, Distribucion.Retail, true, Region.PAL_ESP, 2021, Tienda.Fnac, 79.99f, "2021-10-09")
                ),
                progress(
                        play(2022, Avance.Jugado, 14.5f, false, 8.7f)
                )
        ));

        seeds.add(game(
                "Fire Emblem: Three Houses",
                "2019-07-26",
                Plataforma.Nintendo_Switch,
                genres(Genero.Tactical_RPG, Genero.JRPG),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2019, Tienda.Mediamarkt, 44.95f, "2020-11-28")
                ),
                progress(
                        play(2021, Avance.Completado, 91f, false, 9.1f)
                )
        ));

        seeds.add(game(
                "Xenoblade Chronicles 3",
                "2022-07-29",
                Plataforma.Nintendo_Switch,
                genres(Genero.JRPG, Genero.Action_RPG),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2022, Tienda.Game, 54.95f, "2022-08-04")
                ),
                progress(
                        play(2023, Avance.Jugando, 38f, false, 8.9f)
                )
        ));

        seeds.add(game(
                "Animal Crossing: New Horizons",
                "2020-03-20",
                Plataforma.Nintendo_Switch,
                genres(Genero.Simulacion, Genero.Gestion, Genero.Sandbox),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2020, Tienda.Amazon, 39.90f, "2020-04-18")
                ),
                progress(
                        play(2020, Avance.SinFin, 210f, false, 8.6f)
                )
        ));

        seeds.add(game(
                "Luigi's Mansion 3",
                "2019-10-31",
                Plataforma.Nintendo_Switch,
                genres(Genero.Accion_Aventura, Genero.Puzzle),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2019, Tienda.Game, 36.95f, "2021-02-13")
                ),
                progress(
                        play(2021, Avance.Completado, 19f, false, 8.5f)
                )
        ));

        seeds.add(game(
                "Mario Kart 8 Deluxe",
                "2017-04-28",
                Plataforma.Nintendo_Switch,
                genres(Genero.Carreras, Genero.Party),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2017, Tienda.Mediamarkt, 41.99f, "2018-07-21")
                ),
                progress(
                        play(2022, Avance.Jugado, 68f, false, 8.8f)
                )
        ));

        seeds.add(game(
                "Octopath Traveler II",
                "2023-02-24",
                Plataforma.Nintendo_Switch,
                genres(Genero.JRPG, Genero.RPG),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Deluxe, Distribucion.Retail, false, Region.PAL_ESP, 2023, Tienda.Fnac, 59.99f, "2023-03-01")
                ),
                progress(
                        play(2024, Avance.Backlog, 0f, false, null)
                )
        ));

        seeds.add(game(
                "Hollow Knight",
                "2018-06-12",
                Plataforma.Nintendo_Switch,
                genres(Genero.Metroidvania, Genero.Accion_Aventura),
                supports(
                        support(Tipo.Digital, Estado.Perfecto, Edicion.Normal, Distribucion.Nintendo_eShop, false, Region.PAL_ESP, 2018, null, 14.99f, "2019-09-07")
                ),
                progress(
                        play(2020, Avance.Dropeado, 11.5f, false, 7.7f)
                )
        ));

        seeds.add(game(
                "Super Mario Bros. Wonder",
                "2023-10-20",
                Plataforma.Nintendo_Switch,
                genres(Genero.Plataformas_2D, Genero.Party),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2023, Tienda.Mediamarkt, 49.90f, "2023-10-21")
                ),
                progress(
                        play(2024, Avance.Completado, 15f, false, 8.9f)
                )
        ));

        seeds.add(game(
                "Pikmin 4",
                "2023-07-21",
                Plataforma.Nintendo_Switch,
                genres(Genero.Estrategia, Genero.Puzzle),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2023, Tienda.Fnac, 46.99f, "2023-07-23")
                ),
                progress(
                        play(2024, Avance.Jugando, 24f, false, 8.8f)
                )
        ));

        seeds.add(game(
                "Bayonetta 3",
                "2022-10-28",
                Plataforma.Nintendo_Switch,
                genres(Genero.Hack_and_Slash, Genero.Accion),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Deluxe, Distribucion.Retail, false, Region.PAL_ESP, 2022, Tienda.Game, 39.95f, "2023-01-07")
                ),
                progress(
                        play(2023, Avance.Jugado, 17f, false, 8.3f)
                )
        ));

        seeds.add(game(
                "Triangle Strategy",
                "2022-03-04",
                Plataforma.Nintendo_Switch,
                genres(Genero.Tactical_RPG, Genero.JRPG),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2022, Tienda.Amazon, 41.99f, "2022-03-12")
                ),
                progress(
                        play(2024, Avance.Backlog, 0f, false, null)
                )
        ));

        seeds.add(game(
                "Splatoon 3",
                "2022-09-09",
                Plataforma.Nintendo_Switch,
                genres(Genero.TPS, Genero.Party),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2022, Tienda.Miravia, 34.99f, "2023-06-17")
                ),
                progress(
                        play(2023, Avance.SinFin, 89f, false, 8.4f)
                )
        ));

        seeds.add(game(
                "Kirby and the Forgotten Land",
                "2022-03-25",
                Plataforma.Nintendo_Switch,
                genres(Genero.Plataformas_3D, Genero.Accion_Aventura),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2022, Tienda.Fnac, 43.99f, "2022-11-05")
                ),
                progress(
                        play(2023, Avance.Completado, 18f, true, 8.8f)
                )
        ));

        seeds.add(game(
                "Pokemon Legends: Arceus",
                "2022-01-28",
                Plataforma.Nintendo_Switch,
                genres(Genero.Action_RPG, Genero.JRPG),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2022, Tienda.Amazon, 38.50f, "2022-08-13")
                ),
                progress(
                        play(2022, Avance.Completado, 44f, false, 8.6f)
                )
        ));

        seeds.add(game(
                "Astral Chain",
                "2019-08-30",
                Plataforma.Nintendo_Switch,
                genres(Genero.Accion_Aventura, Genero.Hack_and_Slash),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2019, Tienda.Game, 32.95f, "2021-05-22")
                ),
                progress(
                        play(2022, Avance.Jugado, 21f, false, 8.1f)
                )
        ));

        seeds.add(game(
                "Shadow of the Colossus",
                "2005-10-18",
                Plataforma.PS2,
                genres(Genero.Accion_Aventura, Genero.Puzzle),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2006, Tienda.Wallapop, 18.0f, "2021-05-08")
                ),
                progress(
                        play(2021, Avance.Completado, 16f, false, 9.6f)
                )
        ));

        seeds.add(game(
                "Final Fantasy X",
                "2001-07-19",
                Plataforma.PS2,
                genres(Genero.JRPG),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2002, Tienda.Vinted, 12.5f, "2022-03-11")
                ),
                progress(
                        play(2022, Avance.Completado, 54f, false, 9.2f)
                )
        ));

        seeds.add(game(
                "Metal Gear Solid 3: Subsistence",
                "2005-12-22",
                Plataforma.PS2,
                genres(Genero.Accion_Aventura, Genero.TPS),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Limitada, Distribucion.Retail, false, Region.PAL_UK, 2006, Tienda.Wallapop, 27.0f, "2021-10-02")
                ),
                progress(
                        play(2023, Avance.Jugado, 22f, false, 9.4f)
                )
        ));

        seeds.add(game(
                "Okami",
                "2006-04-20",
                Plataforma.PS2,
                genres(Genero.Accion_Aventura, Genero.Puzzle),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2007, Tienda.Game, 14.95f, "2020-12-05")
                ),
                progress(
                        play(2021, Avance.Completado, 41f, false, 9.0f)
                )
        ));

        seeds.add(game(
                "Gran Turismo 4",
                "2004-12-28",
                Plataforma.PS2,
                genres(Genero.Carreras, Genero.Simulacion),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2005, Tienda.Vinted, 9.90f, "2020-07-15")
                ),
                progress(
                        play(2020, Avance.Jugado, 34f, false, 8.4f)
                )
        ));

        seeds.add(game(
                "God of War II",
                "2007-03-13",
                Plataforma.PS2,
                genres(Genero.Hack_and_Slash, Genero.Accion_Aventura),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2007, Tienda.Wallapop, 16.0f, "2021-09-18")
                ),
                progress(
                        play(2022, Avance.Completado, 13f, false, 8.8f)
                )
        ));

        seeds.add(game(
                "Persona 4",
                "2008-07-10",
                Plataforma.PS2,
                genres(Genero.JRPG, Genero.Visual_Novel),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_UK, 2009, Tienda.Vinted, 24.0f, "2023-01-14")
                ),
                progress(
                        play(2024, Avance.Backlog, 0f, false, null)
                )
        ));

        seeds.add(game(
                "Burnout 3: Takedown",
                "2004-09-07",
                Plataforma.PS2,
                genres(Genero.Carreras, Genero.Accion),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2004, Tienda.Game, 8.95f, "2019-08-10")
                ),
                progress(
                        play(2020, Avance.Jugado, 26f, false, 8.9f)
                )
        ));

        seeds.add(game(
                "Devil May Cry 3: Special Edition",
                "2005-01-25",
                Plataforma.PS2,
                genres(Genero.Hack_and_Slash, Genero.Accion),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2006, Tienda.Game, 11.95f, "2020-02-01")
                ),
                progress(
                        play(2020, Avance.Completado, 16f, false, 8.7f)
                )
        ));

        seeds.add(game(
                "Silent Hill 2",
                "2001-09-24",
                Plataforma.PS2,
                genres(Genero.Survival_Horror, Genero.Puzzle),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_UK, 2002, Tienda.Vinted, 58.0f, "2023-10-08")
                ),
                progress(
                        play(2024, Avance.Jugando, 7f, false, 8.9f)
                )
        ));

        seeds.add(game(
                "Kingdom Hearts II",
                "2005-12-22",
                Plataforma.PS2,
                genres(Genero.Action_RPG, Genero.JRPG),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2006, Tienda.Game, 10.95f, "2020-09-12")
                ),
                progress(
                        play(2021, Avance.Completado, 31f, false, 8.6f)
                )
        ));

        seeds.add(game(
                "Dragon Quest VIII",
                "2004-11-27",
                Plataforma.PS2,
                genres(Genero.JRPG),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2006, Tienda.Wallapop, 22.0f, "2022-02-26")
                ),
                progress(
                        play(2024, Avance.Backlog, 0f, false, null)
                )
        ));

        seeds.add(game(
                "ICO",
                "2001-12-06",
                Plataforma.PS2,
                genres(Genero.Aventuras, Genero.Puzzle),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2002, Tienda.Vinted, 18.50f, "2021-11-13")
                ),
                progress(
                        play(2022, Avance.Completado, 9f, false, 8.5f)
                )
        ));

        seeds.add(game(
                "Rogue Galaxy",
                "2005-12-08",
                Plataforma.PS2,
                genres(Genero.Action_RPG, Genero.JRPG),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2007, Tienda.Game, 13.95f, "2020-04-04")
                ),
                progress(
                        play(2021, Avance.Dropeado, 12f, false, 7.4f)
                )
        ));

        seeds.add(game(
                "Ratchet & Clank 3",
                "2004-11-02",
                Plataforma.PS2,
                genres(Genero.Plataformas_3D, Genero.TPS),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2004, Tienda.Mediamarkt, 8.99f, "2019-05-11")
                ),
                progress(
                        play(2020, Avance.Completado, 15f, false, 8.4f)
                )
        ));

        seeds.add(game(
                "Yakuza 2",
                "2006-12-07",
                Plataforma.PS2,
                genres(Genero.Accion_Aventura, Genero.Action_RPG),
                supports(
                        support(Tipo.Fisico, Estado.Meh, Edicion.Normal, Distribucion.PlayAsia, false, Region.NTSC_JP, 2006, Tienda.Amazon, 31.0f, "2024-01-20")
                ),
                progress(
                        play(2024, Avance.Backlog, 0f, false, null)
                )
        ));

        seeds.add(game(
                "Pokemon Emerald",
                "2004-09-16",
                Plataforma.Game_Boy_Advance,
                genres(Genero.JRPG),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2005, Tienda.Wallapop, 78.0f, "2022-06-04")
                ),
                progress(
                        play(2022, Avance.Completado, 47f, false, 8.7f)
                )
        ));

        seeds.add(game(
                "Castlevania: Aria of Sorrow",
                "2003-05-06",
                Plataforma.Game_Boy_Advance,
                genres(Genero.Metroidvania, Genero.Accion),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_UK, 2003, Tienda.Vinted, 54.0f, "2024-02-03")
                ),
                progress(
                        play(2024, Avance.Jugando, 6.5f, false, 8.8f)
                )
        ));

        seeds.add(game(
                "Tetris",
                "1989-06-14",
                Plataforma.Game_Boy,
                genres(Genero.Puzzle),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 1990, Tienda.Wallapop, 18.0f, "2021-03-06")
                ),
                progress(
                        play(2021, Avance.SinFin, 73f, false, 8.3f)
                )
        ));

        seeds.add(game(
                "Resident Evil 4",
                "2005-01-11",
                Plataforma.GameCube,
                genres(Genero.Survival_Horror, Genero.TPS, Genero.Accion),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2005, Tienda.Game, 24.95f, "2020-10-17")
                ),
                progress(
                        play(2021, Avance.Completado, 19f, false, 9.5f)
                )
        ));

        seeds.add(game(
                "Sonic Adventure",
                "1998-12-23",
                Plataforma.Sega_Dreamcast,
                genres(Genero.Plataformas_3D, Genero.Accion_Aventura),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_UK, 1999, Tienda.Vinted, 29.0f, "2023-02-10")
                ),
                progress(
                        play(2023, Avance.Jugado, 12f, false, 7.9f)
                )
        ));

        seeds.add(game(
                "Chrono Trigger",
                "2008-11-20",
                Plataforma.Nintendo_DS,
                genres(Genero.JRPG),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Normal, Distribucion.PlayAsia, false, Region.NTSC_USA, 2008, Tienda.Amazon, 44.0f, "2023-09-09")
                ),
                progress(
                        play(2024, Avance.Backlog, 0f, false, null)
                )
        ));

        seeds.add(game(
                "Crisis Core: Final Fantasy VII",
                "2007-09-13",
                Plataforma.PSP,
                genres(Genero.Action_RPG),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2008, Tienda.Game, 18.95f, "2022-09-03")
                ),
                progress(
                        play(2023, Avance.Completado, 22f, false, 8.2f)
                )
        ));

        seeds.add(game(
                "Patapon",
                "2007-12-20",
                Plataforma.PSP,
                genres(Genero.Ritmo_Musical, Genero.Estrategia),
                supports(
                        support(Tipo.Digital, Estado.Perfecto, Edicion.Normal, Distribucion.PlayStation_Store, false, Region.PAL_ESP, 2010, null, 7.99f, "2021-04-30")
                ),
                progress(
                        play(2021, Avance.Jugado, 13f, false, 8.0f)
                )
        ));

        seeds.add(game(
                "Monster Hunter Freedom Unite",
                "2008-03-27",
                Plataforma.PSP,
                genres(Genero.Action_RPG, Genero.Accion),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_UK, 2009, Tienda.Vinted, 14.0f, "2023-03-04")
                ),
                progress(
                        play(2023, Avance.Jugando, 27f, false, 7.8f)
                )
        ));

        seeds.add(game(
                "Persona 3 Portable",
                "2009-11-01",
                Plataforma.PSP,
                genres(Genero.JRPG, Genero.Visual_Novel),
                supports(
                        support(Tipo.Digital, Estado.Perfecto, Edicion.Normal, Distribucion.PlayStation_Store, false, Region.PAL_ESP, 2014, null, 19.99f, "2022-07-02")
                ),
                progress(
                        play(2024, Avance.Backlog, 0f, false, null)
                )
        ));

        seeds.add(game(
                "Daxter",
                "2006-03-14",
                Plataforma.PSP,
                genres(Genero.Plataformas_3D, Genero.Accion_Aventura),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2006, Tienda.Wallapop, 11.0f, "2021-08-28")
                ),
                progress(
                        play(2022, Avance.Jugado, 9f, false, 7.9f)
                )
        ));

        seeds.add(game(
                "The Legend of Zelda: A Link Between Worlds",
                "2013-11-22",
                Plataforma.Nintendo_3DS,
                genres(Genero.Accion_Aventura, Genero.Puzzle),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2013, Tienda.Amazon, 32.95f, "2021-06-19")
                ),
                progress(
                        play(2022, Avance.Completado, 18f, false, 9.0f)
                )
        ));

        seeds.add(game(
                "Fire Emblem Awakening",
                "2012-04-19",
                Plataforma.Nintendo_3DS,
                genres(Genero.Tactical_RPG, Genero.JRPG),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2013, Tienda.Game, 26.95f, "2021-02-27")
                ),
                progress(
                        play(2023, Avance.Completado, 49f, false, 9.1f)
                )
        ));

        seeds.add(game(
                "Bravely Default",
                "2012-10-11",
                Plataforma.Nintendo_3DS,
                genres(Genero.JRPG),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2014, Tienda.Fnac, 24.99f, "2022-04-09")
                ),
                progress(
                        play(2023, Avance.Jugando, 19f, false, 8.5f)
                )
        ));

        seeds.add(game(
                "Pokemon Sun",
                "2016-11-18",
                Plataforma.Nintendo_3DS,
                genres(Genero.JRPG),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2016, Tienda.Mediamarkt, 22.99f, "2020-12-19")
                ),
                progress(
                        play(2021, Avance.Completado, 37f, false, 7.8f)
                )
        ));

        seeds.add(game(
                "Shin Megami Tensei IV",
                "2013-05-23",
                Plataforma.Nintendo_3DS,
                genres(Genero.JRPG),
                supports(
                        support(Tipo.Digital, Estado.Perfecto, Edicion.Normal, Distribucion.Nintendo_eShop, false, Region.PAL_ESP, 2014, null, 19.99f, "2022-05-14")
                ),
                progress(
                        play(2024, Avance.Backlog, 0f, false, null)
                )
        ));

        seeds.add(game(
                "Halo 3",
                "2007-09-25",
                Plataforma.Xbox_360,
                genres(Genero.FPS, Genero.Accion),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2007, Tienda.Game, 6.95f, "2019-01-19")
                ),
                progress(
                        play(2020, Avance.Completado, 11f, false, 8.2f)
                )
        ));

        seeds.add(game(
                "The Last of Us Remastered",
                "2014-07-29",
                Plataforma.PS4,
                genres(Genero.Accion_Aventura, Genero.Survival_Horror),
                supports(
                        support(Tipo.Fisico, Estado.Muy_bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2014, Tienda.Mediamarkt, 17.99f, "2020-11-14")
                ),
                progress(
                        play(2021, Avance.Completado, 18.5f, false, 9.3f)
                )
        ));

        seeds.add(game(
                "Persona 5 Royal",
                "2022-10-21",
                Plataforma.PS5,
                genres(Genero.JRPG, Genero.Visual_Novel),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Deluxe, Distribucion.Retail, false, Region.PAL_ESP, 2022, Tienda.Fnac, 39.99f, "2023-04-01")
                ),
                progress(
                        play(2023, Avance.Jugando, 52f, false, 9.1f)
                )
        ));

        seeds.add(game(
                "Astro Bot",
                "2024-09-06",
                Plataforma.PS5,
                genres(Genero.Plataformas_3D, Genero.Party),
                supports(
                        support(Tipo.Fisico, Estado.Perfecto, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 2024, Tienda.Amazon, 64.99f, "2024-09-06")
                ),
                progress(
                        play(2024, Avance.Backlog, 0f, false, null)
                )
        ));

        seeds.add(game(
                "The Witcher 3: Wild Hunt",
                "2015-05-19",
                Plataforma.PC,
                genres(Genero.Action_RPG, Genero.Accion_Aventura),
                supports(
                        support(Tipo.Digital, Estado.Perfecto, Edicion.Deluxe, Distribucion.GOG, false, Region.PAL_ESP, 2016, null, 14.99f, "2020-06-20")
                ),
                progress(
                        play(2021, Avance.Dropeado, 23f, false, 8.0f)
                )
        ));

        seeds.add(game(
                "Super Mario World",
                "1990-11-21",
                Plataforma.Super_Nintendo,
                genres(Genero.Plataformas_2D),
                supports(
                        support(Tipo.Fisico, Estado.Bueno, Edicion.Normal, Distribucion.Retail, false, Region.PAL_ESP, 1992, Tienda.Wallapop, 36.0f, "2022-01-08")
                ),
                progress(
                        play(2022, Avance.Completado, 8f, false, 9.0f)
                )
        ));

        seeds.addAll(loadCsvSeeds("sample-library-wave-extra.csv"));
        return seeds;
    }

    private List<GameSeed> loadCsvSeeds(String resourcePath) {
        List<GameSeed> seeds = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new ClassPathResource(resourcePath).getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }

                String[] parts = trimmed.split(";", -1);
                if (parts.length != 19) {
                    throw new IllegalArgumentException("Fila invalida en " + resourcePath + ": " + trimmed);
                }

                String[] genreTokens = parts[3].split("\\|");
                Set<Genero> generos = new HashSet<>();
                for (String genreToken : genreTokens) {
                    generos.add(Genero.valueOf(genreToken));
                }

                SoporteSeed soporte = new SoporteSeed(
                        Tipo.valueOf(parts[4]),
                        Estado.valueOf(parts[5]),
                        Edicion.valueOf(parts[6]),
                        parts[7].isBlank() ? null : Distribucion.valueOf(parts[7]),
                        Boolean.valueOf(parts[8]),
                        Region.valueOf(parts[9]),
                        parts[10].isBlank() ? null : Integer.valueOf(parts[10]),
                        parts[11].isBlank() ? null : Tienda.valueOf(parts[11]),
                        parts[12].isBlank() ? null : Float.valueOf(parts[12]),
                        parts[13].isBlank() ? null : Date.valueOf(parts[13])
                );

                ProgresoSeed progreso = new ProgresoSeed(
                        parts[14].isBlank() ? null : Integer.valueOf(parts[14]),
                        parts[15].isBlank() ? null : Avance.valueOf(parts[15]),
                        parts[16].isBlank() ? null : Float.valueOf(parts[16]),
                        parts[17].isBlank() ? null : Boolean.valueOf(parts[17]),
                        parts[18].isBlank() ? null : Float.valueOf(parts[18])
                );

                seeds.add(new GameSeed(
                        parts[0],
                        Date.valueOf(parts[1]),
                        Plataforma.valueOf(parts[2]),
                        generos,
                        List.of(soporte),
                        List.of(progreso)
                ));
            }
        } catch (Exception ex) {
            throw new RuntimeException("No se pudieron cargar seeds extra desde " + resourcePath, ex);
        }

        return seeds;
    }

    private Set<Genero> genres(Genero... generos) {
        return new HashSet<>(Arrays.asList(generos));
    }

    private List<SoporteSeed> supports(SoporteSeed... soportes) {
        return Arrays.asList(soportes);
    }

    private List<ProgresoSeed> progress(ProgresoSeed... progresos) {
        return Arrays.asList(progresos);
    }

    private GameSeed game(
            String nombre,
            String fechaLanzamiento,
            Plataforma plataforma,
            Set<Genero> generos,
            List<SoporteSeed> soportes,
            List<ProgresoSeed> progresos
    ) {
        return new GameSeed(
                nombre,
                Date.valueOf(fechaLanzamiento),
                plataforma,
                generos,
                soportes,
                progresos
        );
    }

    private SoporteSeed support(
            Tipo tipo,
            Estado estado,
            Edicion edicion,
            Distribucion distribucion,
            boolean precintado,
            Region region,
            Integer anyoSalidaDist,
            Tienda tienda,
            Float precio,
            String fechaCompra
    ) {
        return new SoporteSeed(
                tipo,
                estado,
                edicion,
                distribucion,
                precintado,
                region,
                anyoSalidaDist,
                tienda,
                precio,
                fechaCompra == null ? null : Date.valueOf(fechaCompra)
        );
    }

    private ProgresoSeed play(Integer anyoJugado, Avance avance, Float horasJugadas, Boolean completadoCien, Float nota) {
        return new ProgresoSeed(anyoJugado, avance, horasJugadas, completadoCien, nota);
    }

    private record GameSeed(
            String nombre,
            Date fechaLanzamiento,
            Plataforma plataforma,
            Set<Genero> generos,
            List<SoporteSeed> soportes,
            List<ProgresoSeed> progresos
    ) {
    }

    private record SoporteSeed(
            Tipo tipo,
            Estado estado,
            Edicion edicion,
            Distribucion distribucion,
            Boolean precintado,
            Region region,
            Integer anyoSalidaDist,
            Tienda tienda,
            Float precio,
            Date fechaCompra
    ) {
    }

    private record ProgresoSeed(
            Integer anyoJugado,
            Avance avance,
            Float horasJugadas,
            Boolean completadoCien,
            Float nota
    ) {
    }
}
