package com.coleccion.videojuegos.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.coleccion.videojuegos.entity.Videojuego;
import com.coleccion.videojuegos.entity.Usuario;
import com.coleccion.videojuegos.entity.Enums.Genero;
import com.coleccion.videojuegos.entity.Enums.Plataforma;

@Repository
public interface VideojuegoRepository extends JpaRepository<Videojuego, Integer> {

    Optional<Videojuego> findById(int id);

    void deleteById(int id);

    /** Obtener todos los videojuegos de un usuario **/
    List<Videojuego> findByUsuario(Usuario usuario);

    List<Videojuego> findByUsuario_Username(String username);

    /** Paginacion: obtener videojuegos de un usuario con soporte para Page **/
    Page<Videojuego> findByUsuario(Usuario usuario, Pageable pageable);

    Page<Videojuego> findByUsuario_Username(String username, Pageable pageable);

    /** Filtros combinados con paginacion **/
    Page<Videojuego> findByUsuarioAndPlataforma(Usuario usuario, Plataforma plataforma, Pageable pageable);

    /** Filtrar por género (busca dentro de la colección generos) **/
    @Query("SELECT v FROM Videojuego v JOIN v.generos g WHERE v.usuario = :usuario AND g = :genero")
    Page<Videojuego> findByUsuarioAndGenero(@Param("usuario") Usuario usuario, @Param("genero") Genero genero, Pageable pageable);

    @Query("SELECT v FROM Videojuego v JOIN v.generos g WHERE v.usuario = :usuario AND v.plataforma = :plataforma AND g = :genero")
    Page<Videojuego> findByUsuarioAndPlataformaAndGenero(@Param("usuario") Usuario usuario, @Param("plataforma") Plataforma plataforma, @Param("genero") Genero genero, Pageable pageable);

    /** Busqueda por nombre (parcial, case-insensitive) **/
    Page<Videojuego> findByUsuarioAndNombreContainingIgnoreCase(Usuario usuario, String nombre, Pageable pageable);

}
