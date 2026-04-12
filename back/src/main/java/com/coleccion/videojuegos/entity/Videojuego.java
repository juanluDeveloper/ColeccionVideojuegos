package com.coleccion.videojuegos.entity;

import java.sql.Date;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import com.coleccion.videojuegos.entity.Enums.Genero;
import com.coleccion.videojuegos.entity.Enums.Plataforma;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name="VIDEOJUEGO")
public class Videojuego {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "NOMBRE", nullable = false)
    private String nombre;

    @Column(name="FECHA_LANZAMIENTO")
    private Date fechaLanzamiento;

    @Enumerated(EnumType.STRING)
    @Column(name="PLATAFORMA")
    private Plataforma plataforma;

    @ElementCollection(targetClass = Genero.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "VIDEOJUEGO_GENEROS", joinColumns = @JoinColumn(name = "VIDEOJUEGO_ID"))
    @Enumerated(EnumType.STRING)
    @Column(name = "GENERO")
    @Builder.Default
    private Set<Genero> generos = new HashSet<>();

    @OneToMany(mappedBy = "videojuego", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Progreso> progreso = new ArrayList<>();

    @OneToMany(mappedBy = "videojuego", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Soporte> soporte = new ArrayList<>();

    // Relación con Usuario
    @ManyToOne
    @JoinColumn(name = "USUARIO_ID", nullable = false)
    @JsonBackReference
    private Usuario usuario;

    // =============================
    // IGDB linkage (optional)
    // =============================
    /** IGDB Game ID (v4) linked to this videojuego. */
    @Column(name = "IGDB_GAME_ID")
    private Long igdbGameId;

    /** IGDB slug (used for linking to igdb.com). */
    @Column(name = "IGDB_SLUG")
    private String igdbSlug;

    /** Cover image_id from IGDB images API. */
    @Column(name = "IGDB_COVER_IMAGE_ID")
    private String igdbCoverImageId;

    /** One preferred artwork image_id (optional). */
    @Column(name = "IGDB_ARTWORK_IMAGE_ID")
    private String igdbArtworkImageId;

    /** Last time we synced IGDB metadata for this game (optional). */
    @Column(name = "IGDB_LAST_SYNC")
    private Instant igdbLastSync;

    public void addProgreso(Progreso elementoProgreso) {
        this.progreso.add(elementoProgreso);
        elementoProgreso.setVideojuego(this);
    }

    public void addSoporte(Soporte elementoSoporte) {
        this.soporte.add(elementoSoporte);
        elementoSoporte.setVideojuego(this);
    }
}
