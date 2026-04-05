package com.coleccion.videojuegos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.coleccion.videojuegos.entity.Progreso;
import com.coleccion.videojuegos.entity.Videojuego;

@Repository
public interface ProgresoRepository extends JpaRepository<Progreso, Integer> {
	Optional<Progreso> findById(int id);

	void deleteById(int id);

	/** Obtener todos los progresos de un videojuego **/
	List<Progreso> findByVideojuego(Videojuego videojuego);
}
