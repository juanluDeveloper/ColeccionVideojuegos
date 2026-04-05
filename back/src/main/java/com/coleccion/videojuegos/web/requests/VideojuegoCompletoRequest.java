package com.coleccion.videojuegos.web.requests;

import java.sql.Date;
import java.util.List;
import java.util.Set;
import com.coleccion.videojuegos.entity.Enums.*;
import com.coleccion.videojuegos.web.dto.ProgresoDTO;
import com.coleccion.videojuegos.web.dto.SoporteDTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VideojuegoCompletoRequest {
    private Integer id; // Solo para updates

    @NotNull(message = "El nombre es obligatorio")
    @Size(min = 1, max = 255, message = "El nombre debe tener entre 1 y 255 caracteres")
    private String nombre;

    @Positive(message = "El precio debe ser positivo")
    private Float precio;

    private Date fechaLanzamiento;
    private Date fechaCompra;

    @NotNull(message = "La plataforma es obligatoria")
    private Plataforma plataforma;

    @NotNull(message = "El género es obligatorio")
    @Size(min = 1, message = "Debe seleccionar al menos un género")
    private Set<Genero> generos;

    // ⚡ Ya NO incluimos el campo "tipo" aquí porque pertenece a Soporte

    // Listas opcionales para progresos y soportes
    private List<ProgresoDTO> progreso;
    private List<SoporteDTO> soporte;
}
