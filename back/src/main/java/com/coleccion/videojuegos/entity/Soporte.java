package com.coleccion.videojuegos.entity;

import com.coleccion.videojuegos.entity.Enums.Distribucion;
import com.coleccion.videojuegos.entity.Enums.Edicion;
import com.coleccion.videojuegos.entity.Enums.Estado;
import com.coleccion.videojuegos.entity.Enums.Region;
import com.coleccion.videojuegos.entity.Enums.Tienda;
import com.coleccion.videojuegos.entity.Enums.Tipo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name="SOPORTE")
public class Soporte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(name="TIPO")
    private Tipo tipo;

    @Enumerated(EnumType.STRING)
    @Column(name="ESTADO")
    private Estado estado;

    @Enumerated(EnumType.STRING)
    @Column(name="EDICION")
    private Edicion edicion;

    @Enumerated(EnumType.STRING)
    @Column(name="DISTRIBUCION")
    private Distribucion distribucion;

    @Column(name="PRECINTADO")
    private Boolean precintado;

    @Enumerated(EnumType.STRING)
    @Column(name="REGION")
    private Region region;

    @Column(name = "ANYO_SALIDA_DISTRIBUCION")
    private Integer anyoSalidaDist;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIENDA")
    private Tienda tienda;

    @Column(name = "PRECIO")
    private Float precio;

    @Column(name = "FECHA_COMPRA")
    private java.sql.Date fechaCompra;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "ID_VIDEOJUEGO")
    private Videojuego videojuego;
}
