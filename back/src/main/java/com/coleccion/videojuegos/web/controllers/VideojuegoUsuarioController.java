package com.coleccion.videojuegos.web.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.coleccion.videojuegos.entity.Videojuego;
import com.coleccion.videojuegos.service.VideojuegosUsuarioService;
import com.coleccion.videojuegos.utils.AuthorizationUtils;
import com.coleccion.videojuegos.web.dto.VideojuegoDetalleDTO;
import com.coleccion.videojuegos.web.requests.LinkIgdbRequest;
import com.coleccion.videojuegos.web.requests.VideojuegoCompletoRequest;

@RestController
@CrossOrigin(origins = { "*" })
@RequestMapping("/api/v1/videojuegos")
public class VideojuegoUsuarioController {

    @Autowired
    private VideojuegosUsuarioService videojuegosService;

    @Autowired
    private AuthorizationUtils authorizationUtils;

    /** ✅ Obtener los videojuegos del usuario autenticado **/
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/mis-videojuegos")
    public ResponseEntity<List<Videojuego>> getMisVideojuegos(Authentication authentication) {
        List<Videojuego> misVideojuegos = videojuegosService.getVideojuegosByUsuario(authentication.getName());
        return ResponseEntity.ok(misVideojuegos);
    }

    /** ✅ Obtener un videojuego por ID (solo si es dueño) **/
    @PreAuthorize("@authorizationUtils.isOwner(#id, authentication.name)")
    @GetMapping("/{id}")
    public ResponseEntity<Videojuego> getVideojuego(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(videojuegosService.getVideojuego(id));
    }

    /**
     * ✅ Obtener un videojuego con datos extra IGDB (URLs de portada/arte) listo para el frontend.
     * No rompe el endpoint original /{id}.
     */
    @PreAuthorize("@authorizationUtils.isOwner(#id, authentication.name)")
    @GetMapping("/{id}/detalle")
    public ResponseEntity<VideojuegoDetalleDTO> getVideojuegoDetalle(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(videojuegosService.getVideojuegoDetalle(id));
    }

    /**
     * ✅ Enlazar un videojuego local con un juego de IGDB.
     * Body: { "igdbGameId": 12345 }
     */
    @PreAuthorize("@authorizationUtils.isOwner(#id, authentication.name)")
    @PutMapping("/{id}/igdb/link")
    public ResponseEntity<Videojuego> linkIgdb(@PathVariable("id") Integer id,
                                               @RequestBody LinkIgdbRequest request,
                                               Authentication authentication) {
        Videojuego updated = videojuegosService.linkIgdbGame(id, request.getIgdbGameId(), authentication.getName());
        return ResponseEntity.ok(updated);
    }

    /** ✅ Crear un nuevo videojuego **/
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/new")
    public ResponseEntity<Videojuego> crearVideojuego(@RequestBody VideojuegoCompletoRequest vRequest, Authentication authentication) {
        Videojuego nuevoVideojuego = videojuegosService.newVideojuego(vRequest, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoVideojuego);
    }
    

    /** ✅ Editar un videojuego (solo si es dueño) **/
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}/editar")
    public ResponseEntity<?> editarVideojuego(@PathVariable("id") Integer id, 
                                              @RequestBody VideojuegoCompletoRequest vRequest, 
                                              Authentication authentication) {
        // Verificamos si el videojuego existe antes de comprobar permisos
        Videojuego videojuego = videojuegosService.getVideojuego(id);
        
        if (videojuego == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Videojuego no encontrado");
        }
    
        // Ahora sí verificamos si el usuario es dueño antes de actualizarlo
        if (!authorizationUtils.isOwner(id, authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes permiso para editar este videojuego.");
        }
    
        // 🔹 Llamamos al service pasando el username del usuario autenticado
        Videojuego actualizado = videojuegosService.updateVideojuego(id, vRequest, authentication.getName());
        return ResponseEntity.ok(actualizado);
    }
    

    /** ✅ Eliminar un videojuego (solo si es dueño) **/
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}/eliminar")
    public ResponseEntity<?> deleteVideojuego(@PathVariable("id") Integer id, Authentication authentication) {
        // 🔹 Verificamos si el videojuego existe antes de cualquier otra acción
        Videojuego videojuego = videojuegosService.getVideojuego(id);
        
        if (videojuego == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Videojuego no encontrado");
        }

        // 🔹 Verificamos si el usuario autenticado es el dueño
        if (!authorizationUtils.isOwner(id, authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes permiso para eliminar este videojuego.");
        }

        // 🔹 Eliminamos el videojuego
        videojuegosService.deleteVideojuego(id);
        return ResponseEntity.ok("Videojuego con ID " + id + " eliminado correctamente.");
    }

}
