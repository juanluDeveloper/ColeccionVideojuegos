// Esta es la parte mas coleccionista
package com.coleccion.videojuegos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.coleccion.videojuegos.entity.Soporte;
import com.coleccion.videojuegos.entity.Videojuego;

@Repository
public interface SoporteRepository extends JpaRepository<Soporte, Integer> {

	Optional<Soporte> findById(int id);

	void deleteById(int id);

	/** Obtener todos los soportes de un videojuego **/
	List<Soporte> findByVideojuego(Videojuego videojuego);
}
