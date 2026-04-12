package com.coleccion.videojuegos.service;

import com.coleccion.videojuegos.entity.Soporte;
import com.coleccion.videojuegos.entity.Videojuego;
import com.coleccion.videojuegos.repository.SoporteRepository;
import com.coleccion.videojuegos.repository.VideojuegoRepository;
import com.coleccion.videojuegos.web.requests.SoporteRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class SoporteService {

    @Autowired
    private SoporteRepository soporteRepository;

    @Autowired
    private VideojuegoRepository videojuegoRepository;

    /** ✅ Obtener lista de soportes de un videojuego */
    public List<Soporte> getSoporteListByVideojuego(Integer idVideojuego) {
        Videojuego videojuego = videojuegoRepository.findById(idVideojuego)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Videojuego no encontrado"));
        return videojuego.getSoporte();
    }

    /** ✅ Crear nuevo soporte en un videojuego */
    public Soporte newSoporte(Integer idVideojuego, SoporteRequest sRequest) {
        Videojuego videojuego = videojuegoRepository.findById(idVideojuego)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Videojuego no encontrado"));

        Soporte soporte = Soporte.builder()
                .tipo(sRequest.getTipo())
                .estado(sRequest.getEstado())
                .edicion(sRequest.getEdicion())
                .distribucion(sRequest.getDistribucion())
                .precintado(sRequest.getPrecintado())
                .region(sRequest.getRegion())
                .anyoSalidaDist(sRequest.getAnyoSalidaDist())
                .tienda(sRequest.getTienda())
                .precio(sRequest.getPrecio())
                .fechaCompra(sRequest.getFechaCompra())
                .videojuego(videojuego)
                .build();

        return soporteRepository.save(soporte);
    }

	public Soporte updateSoporte(Integer idVideojuego, Integer idSoporte, SoporteRequest sRequest) {
		// 1️⃣ Buscar el soporte en la BD
		Soporte soporte = soporteRepository.findById(idSoporte)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Soporte no encontrado"));
	
		// 2️⃣ Verificar que el soporte pertenece al videojuego indicado
		if (!soporte.getVideojuego().getId().equals(idVideojuego)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El soporte no pertenece al videojuego especificado");
		}
	
		// 3️⃣ Actualizar solo si los valores no son nulos
		if (sRequest.getTipo() != null) soporte.setTipo(sRequest.getTipo());
		if (sRequest.getEstado() != null) soporte.setEstado(sRequest.getEstado());
		if (sRequest.getEdicion() != null) soporte.setEdicion(sRequest.getEdicion());
		if (sRequest.getDistribucion() != null) soporte.setDistribucion(sRequest.getDistribucion());
		if (sRequest.getPrecintado() != null) soporte.setPrecintado(sRequest.getPrecintado());
		if (sRequest.getRegion() != null) soporte.setRegion(sRequest.getRegion());
		if (sRequest.getAnyoSalidaDist() != null) soporte.setAnyoSalidaDist(sRequest.getAnyoSalidaDist());
		if (sRequest.getTienda() != null) soporte.setTienda(sRequest.getTienda());
		if (sRequest.getPrecio() != null) soporte.setPrecio(sRequest.getPrecio());
		if (sRequest.getFechaCompra() != null) soporte.setFechaCompra(sRequest.getFechaCompra());

		return soporteRepository.save(soporte);
	}
	

    /** ✅ Eliminar un soporte */
    public void deleteSoporte(Integer idSoporte) {
        if (!soporteRepository.existsById(idSoporte)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Soporte no encontrado");
        }
        soporteRepository.deleteById(idSoporte);
    }
}
