package com.coleccion.videojuegos.service;

import com.coleccion.videojuegos.entity.Progreso;
import com.coleccion.videojuegos.entity.Soporte;
import com.coleccion.videojuegos.entity.Videojuego;
import com.coleccion.videojuegos.entity.Usuario;
import com.coleccion.videojuegos.igdb.dto.IgdbGame;
import com.coleccion.videojuegos.igdb.dto.IgdbImageRef;
import com.coleccion.videojuegos.igdb.service.IgdbApiClient;
import com.coleccion.videojuegos.igdb.service.IgdbImageCacheService;
import com.coleccion.videojuegos.igdb.service.IgdbImageUrlBuilder;
import com.coleccion.videojuegos.repository.UserRepository;
import com.coleccion.videojuegos.repository.VideojuegoRepository;
import com.coleccion.videojuegos.utils.AuthorizationUtils;
import com.coleccion.videojuegos.web.requests.VideojuegoCompletoRequest;
import com.coleccion.videojuegos.web.dto.VideojuegoDetalleDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class VideojuegosUsuarioService {

    @Autowired
    private VideojuegoRepository videojuegoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IgdbApiClient igdbApiClient;

    @Autowired
    private IgdbImageUrlBuilder igdbImageUrlBuilder;

    @Autowired
    private IgdbImageCacheService igdbImageCacheService;
    
    /** ✅ Obtener los videojuegos de un usuario **/
    public List<Videojuego> getVideojuegosByUsuario(String username) {
        return videojuegoRepository.findByUsuario_Username(username);
    }

    /** ✅ Obtener un videojuego por ID (solo si es dueño) **/
    public Videojuego getVideojuego(Integer id) {
        Videojuego videojuego = videojuegoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Videojuego no encontrado"));

        return videojuego;
    }

    /**
     * Link a local Videojuego with an IGDB game id and store cover/artwork references.
     * This does NOT download images yet (that is handled lazily by MediaController).
     */
    public Videojuego linkIgdbGame(Integer videojuegoId, Long igdbGameId, String username) {
        Videojuego videojuego = videojuegoRepository.findById(videojuegoId)
                .orElseThrow(() -> new RuntimeException("Videojuego no encontrado"));

        if (!videojuego.getUsuario().getUsername().equals(username)) {
            throw new RuntimeException("No tienes permisos para modificar este videojuego");
        }

        IgdbGame igdbGame = igdbApiClient.getGameById(igdbGameId);
        if (igdbGame == null) {
            throw new RuntimeException("IGDB game not found: " + igdbGameId);
        }

        videojuego.setIgdbGameId(igdbGame.id());
        videojuego.setIgdbSlug(igdbGame.slug());
        videojuego.setIgdbCoverImageId(igdbGame.cover() != null ? igdbGame.cover().image_id() : null);

        // Prefer first artwork if available; fallback to first screenshot.
        String artworkId = null;
        if (igdbGame.artworks() != null && !igdbGame.artworks().isEmpty()) {
            artworkId = igdbGame.artworks().get(0).image_id();
        } else if (igdbGame.screenshots() != null && !igdbGame.screenshots().isEmpty()) {
            artworkId = igdbGame.screenshots().get(0).image_id();
        }
        videojuego.setIgdbArtworkImageId(artworkId);
        videojuego.setIgdbLastSync(Instant.now());

        return videojuegoRepository.save(videojuego);
    }

    /**
     * Extended detail: returns your local game plus IGDB URLs ready for frontend usage.
     * NOTE: We return URLs pointing to our local media endpoints (Phase 3).
     */
    public VideojuegoDetalleDTO getVideojuegoDetalle(Integer id) {
        Videojuego v = getVideojuego(id);

        String igdbUrl = null;
        if (v.getIgdbSlug() != null && !v.getIgdbSlug().isBlank()) {
            igdbUrl = "https://www.igdb.com/games/" + v.getIgdbSlug();
        }

        // Local proxy URLs served by MediaController.
        String coverUrl = (v.getIgdbGameId() != null) ? ("/api/v1/media/videojuegos/" + v.getId() + "/cover") : null;
        String artworkUrl = (v.getIgdbGameId() != null) ? ("/api/v1/media/videojuegos/" + v.getId() + "/artwork") : null;

        return new VideojuegoDetalleDTO(
                v.getId(),
                v.getNombre(),
                v.getPrecio(),
                v.getFechaLanzamiento(),
                v.getFechaCompra(),
                v.getPlataforma(),
                v.getGeneros(),
                v.getProgreso(),
                v.getSoporte(),
                v.getIgdbGameId(),
                igdbUrl,
                coverUrl,
                artworkUrl
        );
    }

    /** ✅ Crear un nuevo videojuego **/
    public Videojuego newVideojuego(VideojuegoCompletoRequest vRequest, String username) {
        Usuario usuario = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Videojuego videojuego = Videojuego.builder()
                .nombre(vRequest.getNombre())
                .precio(vRequest.getPrecio())
                .fechaLanzamiento(vRequest.getFechaLanzamiento())
                .fechaCompra(vRequest.getFechaCompra())
                .plataforma(vRequest.getPlataforma())
                .generos(vRequest.getGeneros())
                .usuario(usuario)
                .build();

        if (vRequest.getProgreso() != null) {
            vRequest.getProgreso().forEach(p -> {
                Progreso progreso = new Progreso(null, p.getAnyoJugado(), p.getAvance(), p.getHorasJugadas(), p.getCompletadoCien(), p.getNota(), videojuego);
                videojuego.addProgreso(progreso);
            });
        }

        if (vRequest.getSoporte() != null) {
            vRequest.getSoporte().forEach(s -> {
                Soporte soporte = new Soporte(null, s.getTipo(), s.getEstado(), s.getEdicion(), s.getDistribucion(), s.getPrecintado(), s.getRegion(), s.getAnyoSalidaDist(), s.getTienda(), videojuego);
                videojuego.addSoporte(soporte);
            });
        }

        return videojuegoRepository.save(videojuego);
    }

    /** ✅ Editar un videojuego (solo si es dueño) **/
    public Videojuego updateVideojuego(Integer id, VideojuegoCompletoRequest vRequest, String username) {
        Videojuego videojuego = videojuegoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Videojuego no encontrado"));

        if (!videojuego.getUsuario().getUsername().equals(username)) {
            throw new RuntimeException("No tienes permisos para modificar este videojuego");
        }

        videojuego.setNombre(vRequest.getNombre());
        videojuego.setPrecio(vRequest.getPrecio());
        videojuego.setFechaLanzamiento(vRequest.getFechaLanzamiento());
        videojuego.setFechaCompra(vRequest.getFechaCompra());
        videojuego.setPlataforma(vRequest.getPlataforma());
        videojuego.getGeneros().clear();
        videojuego.getGeneros().addAll(vRequest.getGeneros());

        videojuego.getProgreso().clear();
        if (vRequest.getProgreso() != null) {
            vRequest.getProgreso().forEach(p -> {
                Progreso progreso = new Progreso(null, p.getAnyoJugado(), p.getAvance(), p.getHorasJugadas(), p.getCompletadoCien(), p.getNota(), videojuego);
                videojuego.addProgreso(progreso);
            });
        }

        videojuego.getSoporte().clear();
        if (vRequest.getSoporte() != null) {
            vRequest.getSoporte().forEach(s -> {
                Soporte soporte = new Soporte(null, s.getTipo(), s.getEstado(), s.getEdicion(), s.getDistribucion(), s.getPrecintado(), s.getRegion(), s.getAnyoSalidaDist(), s.getTienda(), videojuego);
                videojuego.addSoporte(soporte);
            });
        }

        return videojuegoRepository.save(videojuego);
    }

    /** ✅ Eliminar un videojuego **/
    @Transactional
    public void deleteVideojuego(Integer id) {
        Videojuego videojuego = videojuegoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El videojuego con ID " + id + " no existe."));

        videojuego.getProgreso().clear();
        videojuego.getSoporte().clear();
        videojuegoRepository.save(videojuego);

        videojuegoRepository.delete(videojuego);
    }

    /**   Obtener progresos de un videojuego **/
    public List<Progreso> getProgresoListByVideojuego(Integer idVideojuego) {
        Optional<Videojuego> videojuegoOpt = videojuegoRepository.findById(idVideojuego);
        return videojuegoOpt.map(Videojuego::getProgreso).orElse(List.of());
    }

    /**   Obtener soportes de un videojuego **/
    public List<Soporte> getSoporteListByVideojuego(Integer idVideojuego) {
        Optional<Videojuego> videojuegoOpt = videojuegoRepository.findById(idVideojuego);
        return videojuegoOpt.map(Videojuego::getSoporte).orElse(List.of());
    }
}
