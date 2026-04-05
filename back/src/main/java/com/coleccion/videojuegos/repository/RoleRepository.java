package com.coleccion.videojuegos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.coleccion.videojuegos.entity.Role;
import com.coleccion.videojuegos.entity.Enums.RoleEnum;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    /** Buscar un rol especifico por su Enum **/
    Optional<Role> findByRole(RoleEnum role);

    /** Buscar multiples roles por nombre (Lista de RoleEnum) **/
    @Query("SELECT r FROM Role r WHERE r.role IN ?1")
    List<Role> findByRoleIn(List<RoleEnum> roles);
}
