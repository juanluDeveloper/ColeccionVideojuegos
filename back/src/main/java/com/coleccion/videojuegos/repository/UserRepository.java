package com.coleccion.videojuegos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.coleccion.videojuegos.entity.Usuario;

@Repository
public interface UserRepository extends JpaRepository<Usuario, Integer> {

	Optional<Usuario> findUserByUsername(String username);

	boolean existsByUsername(String username);

	boolean existsByEmail(String email);

}
