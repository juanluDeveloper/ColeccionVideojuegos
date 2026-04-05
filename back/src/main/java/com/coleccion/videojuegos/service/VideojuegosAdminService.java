package com.coleccion.videojuegos.service;

import com.coleccion.videojuegos.entity.Videojuego;
import com.coleccion.videojuegos.entity.Progreso;
import com.coleccion.videojuegos.entity.Soporte;
import com.coleccion.videojuegos.entity.Usuario;
import com.coleccion.videojuegos.repository.UserRepository;
import com.coleccion.videojuegos.repository.VideojuegoRepository;
import com.coleccion.videojuegos.web.dto.VideojuegoAdminDTO;
import com.coleccion.videojuegos.web.requests.VideojuegoCompletoRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VideojuegosAdminService {

    @Autowired
    private VideojuegoRepository videojuegoRepository;

    @Autowired
    private UserRepository userRepository;

    /** ✅ Obtener todos los videojuegos (incluye el usuario dueño) **/
    public List<VideojuegoAdminDTO> getAllVideojuegos() {
        return videojuegoRepository.findAll().stream()
            .map(videojuego -> new VideojuegoAdminDTO(videojuego, videojuego.getUsuario()))
            .collect(Collectors.toList());
    }

    /** ✅ Obtener un videojuego por ID sin restricciones **/
    public VideojuegoAdminDTO getVideojuego(Integer id) {
        Videojuego videojuego = videojuegoRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Videojuego no encontrado"));

        
        return new VideojuegoAdminDTO(videojuego, videojuego.getUsuario());
    }

    /** ✅ Obtener todos los videojuegos de un usuario específico **/
    public List<VideojuegoAdminDTO> getVideojuegosByUsuario(String username) {
        Usuario usuario = userRepository.findUserByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return videojuegoRepository.findByUsuario_Username(username).stream()
            .map(videojuego -> new VideojuegoAdminDTO(videojuego, usuario))
            .collect(Collectors.toList());
    }

    /** ✅ Crear un videojuego para un usuario específico **/
    @Transactional
    public VideojuegoAdminDTO newVideojuegoParaUsuario(String username, VideojuegoCompletoRequest vRequest) {
        // 1️⃣ Buscar al usuario
        Usuario usuario = userRepository.findUserByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // 2️⃣ Crear el videojuego
        Videojuego videojuego = Videojuego.builder()
            .nombre(vRequest.getNombre())
            .precio(vRequest.getPrecio())
            .fechaLanzamiento(vRequest.getFechaLanzamiento())
            .fechaCompra(vRequest.getFechaCompra())
            .plataforma(vRequest.getPlataforma())
            .generos(vRequest.getGeneros())
            .usuario(usuario) // Asignamos el usuario encontrado
            .build();

        // 3️⃣ Agregar progresos (si los hay)
        if (vRequest.getProgreso() != null) {
            vRequest.getProgreso().forEach(p -> {
                Progreso progreso = Progreso.builder()
                    .anyoJugado(p.getAnyoJugado())
                    .avance(p.getAvance())
                    .horasJugadas(p.getHorasJugadas())
                    .completadoCien(p.getCompletadoCien())
                    .nota(p.getNota())
                    .videojuego(videojuego)
                    .build();
                videojuego.addProgreso(progreso);
            });
        }

        // 4️⃣ Agregar soportes (si los hay)
        if (vRequest.getSoporte() != null) {
            vRequest.getSoporte().forEach(s -> {
                Soporte soporte = Soporte.builder()
                    .tipo(s.getTipo())
                    .estado(s.getEstado())
                    .edicion(s.getEdicion())
                    .distribucion(s.getDistribucion())
                    .precintado(s.getPrecintado())
                    .region(s.getRegion())
                    .anyoSalidaDist(s.getAnyoSalidaDist())
                    .tienda(s.getTienda())
                    .videojuego(videojuego)
                    .build();
                videojuego.addSoporte(soporte);
            });
        }

        // 5️⃣ Guardar el videojuego
        Videojuego videojuegoGuardado = videojuegoRepository.save(videojuego);

        // 6️⃣ Retornar en formato `VideojuegoAdminDTO`
        return new VideojuegoAdminDTO(videojuegoGuardado, usuario);
    }

    /** ✅ Modificar cualquier videojuego (sin importar dueño) **/
    public VideojuegoAdminDTO updateVideojuego(Integer id, VideojuegoCompletoRequest vRequest) {
        Videojuego videojuego = videojuegoRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Videojuego no encontrado"));

        // 1️⃣ Actualizar datos básicos
        videojuego.setNombre(vRequest.getNombre());
        videojuego.setPrecio(vRequest.getPrecio());
        videojuego.setFechaLanzamiento(vRequest.getFechaLanzamiento());
        videojuego.setFechaCompra(vRequest.getFechaCompra());
        videojuego.setPlataforma(vRequest.getPlataforma());
        videojuego.getGeneros().clear();
        videojuego.getGeneros().addAll(vRequest.getGeneros());

        // 2️⃣ Actualizar Progresos (conversión de DTO a entidad)
        videojuego.getProgreso().clear();
        if (vRequest.getProgreso() != null) {
            vRequest.getProgreso().forEach(p -> {
                Progreso progreso = Progreso.builder()
                    .anyoJugado(p.getAnyoJugado())
                    .avance(p.getAvance())
                    .horasJugadas(p.getHorasJugadas())
                    .completadoCien(p.getCompletadoCien())
                    .nota(p.getNota())
                    .videojuego(videojuego) // Asociar al videojuego
                    .build();
                videojuego.addProgreso(progreso);
            });
        }

        // 3️⃣ Actualizar Soportes (conversión de DTO a entidad)
        videojuego.getSoporte().clear();
        if (vRequest.getSoporte() != null) {
            vRequest.getSoporte().forEach(s -> {
                Soporte soporte = Soporte.builder()
                    .tipo(s.getTipo())
                    .estado(s.getEstado())
                    .edicion(s.getEdicion())
                    .distribucion(s.getDistribucion())
                    .precintado(s.getPrecintado())
                    .region(s.getRegion())
                    .anyoSalidaDist(s.getAnyoSalidaDist())
                    .tienda(s.getTienda())
                    .videojuego(videojuego) // Asociar al videojuego
                    .build();
                videojuego.addSoporte(soporte);
            });
        }

        // 4️⃣ Guardar cambios y retornar DTO
        return new VideojuegoAdminDTO(videojuegoRepository.save(videojuego), videojuego.getUsuario());
    }


    /** ✅ Eliminar cualquier videojuego sin restricciones **/
    @Transactional
    public void deleteVideojuego(Integer id) {
        Videojuego videojuego = videojuegoRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Videojuego no encontrado"));

        videojuego.getProgreso().clear();
        videojuego.getSoporte().clear();
        videojuegoRepository.save(videojuego);

        videojuegoRepository.delete(videojuego);
    }
}
