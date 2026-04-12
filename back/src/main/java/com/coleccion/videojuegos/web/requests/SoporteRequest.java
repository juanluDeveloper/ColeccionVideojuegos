package com.coleccion.videojuegos.web.requests;

import com.coleccion.videojuegos.entity.Enums.Distribucion;
import com.coleccion.videojuegos.entity.Enums.Edicion;
import com.coleccion.videojuegos.entity.Enums.Estado;
import com.coleccion.videojuegos.entity.Enums.Region;
import com.coleccion.videojuegos.entity.Enums.Tienda;
import com.coleccion.videojuegos.entity.Enums.Tipo;

import lombok.Data;
@Data
public class SoporteRequest {
	
	private Integer id;
	private Tipo tipo;; 
	private Estado estado;
	private Edicion edicion;
	private Distribucion distribucion;
	private Boolean precintado;
	private Region region;
	private Integer anyoSalidaDist;
	private Tienda tienda;
	private Float precio;
	private java.sql.Date fechaCompra;

}
