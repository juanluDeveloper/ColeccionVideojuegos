package com.coleccion.videojuegos.web.dto;

import com.coleccion.videojuegos.entity.Enums.*;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class SoporteDTO {
    @NotNull(message = "El tipo es obligatorio")
    private Tipo tipo;  // 🎯 Aquí sí mantenemos el tipo (FISICO/DIGITAL)

    private Estado estado; // Solo si es físico
    private Edicion edicion;
    private Distribucion distribucion;
    private Boolean precintado;
    private Region region;
    private Integer anyoSalidaDist;
    private Tienda tienda;
    private Float precio;
    private java.sql.Date fechaCompra;
}
