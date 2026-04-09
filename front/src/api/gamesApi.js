import apiClient from "./apiClient";

export async function getMyGames() {
  const { data } = await apiClient.get("/api/v1/videojuegos/mis-videojuegos");
  return data; // Videojuego[]
}

export async function getGameById(id) {
  const { data } = await apiClient.get(`/api/v1/videojuegos/${id}`);
  return data;
}

// --- IGDB integration ---

/**
 * Backend DTO enriched with IGDB cover/art URLs, plus igdbUrl (for attribution button).
 * Endpoint provided by the backend patch: GET /api/v1/videojuegos/{id}/detalle
 */
export async function getGameDetail(id) {
  const { data } = await apiClient.get(`/api/v1/videojuegos/${id}/detalle`);
  return data;
}

/**
 * Search games in IGDB (server-side, JWT protected)
 * GET /api/v1/igdb/search?q=...&limit=...
 */
export async function searchIgdbGames(query, limit = 10) {
  const { data } = await apiClient.get(`/api/v1/igdb/search`, {
    params: { q: query, limit },
  });
  return data;
}

/**
 * Link an existing local game with an IGDB game id
 * PUT /api/v1/videojuegos/{id}/igdb/link
 */
export async function linkIgdbGame(localGameId, igdbGameId) {
  const { data } = await apiClient.put(`/api/v1/videojuegos/${localGameId}/igdb/link`, {
    igdbGameId,
  });
  return data;
}

// --- CRUD videojuegos ---

/**
 * Crear un nuevo videojuego.
 * POST /api/v1/videojuegos/new
 * @param {Object} gameData - VideojuegoCompletoRequest
 */
export async function createGame(gameData) {
  const { data } = await apiClient.post("/api/v1/videojuegos/new", gameData);
  return data;
}

/**
 * Editar un videojuego existente.
 * PUT /api/v1/videojuegos/{id}/editar
 * @param {number} id
 * @param {Object} gameData - VideojuegoCompletoRequest
 */
export async function editGame(id, gameData) {
  const { data } = await apiClient.put(`/api/v1/videojuegos/${id}/editar`, gameData);
  return data;
}

/**
 * Eliminar un videojuego.
 * DELETE /api/v1/videojuegos/{id}/eliminar
 */
export async function deleteGame(id) {
  const { data } = await apiClient.delete(`/api/v1/videojuegos/${id}/eliminar`);
  return data;
}

export async function getSoportes(idVideojuego) {
  const { data } = await apiClient.get(`/api/v1/soporte/${idVideojuego}`);
  return data; // Soporte[]
}

export async function createSoporte(idVideojuego, soporteData) {
  const { data } = await apiClient.post(`/api/v1/soporte/${idVideojuego}/new`, soporteData);
  return data;
}

export async function updateSoporte(idVideojuego, idSoporte, soporteData) {
  const { data } = await apiClient.put(`/api/v1/soporte/${idVideojuego}/${idSoporte}/editar`, soporteData);
  return data;
}

export async function deleteSoporte(idVideojuego, idSoporte) {
  const { data } = await apiClient.delete(`/api/v1/soporte/${idVideojuego}/${idSoporte}/eliminar`);
  return data;
}

export async function getProgresos(idVideojuego) {
  const { data } = await apiClient.get(`/api/v1/progreso/${idVideojuego}`);
  return data; // Progreso[]
}

export async function createProgreso(idVideojuego, progresoData) {
  const { data } = await apiClient.post(`/api/v1/progreso/${idVideojuego}/new`, progresoData);
  return data;
}

export async function updateProgreso(idVideojuego, idProgreso, progresoData) {
  const { data } = await apiClient.put(`/api/v1/progreso/${idVideojuego}/${idProgreso}/editar`, progresoData);
  return data;
}

export async function deleteProgreso(idVideojuego, idProgreso) {
  const { data } = await apiClient.delete(`/api/v1/progreso/${idVideojuego}/${idProgreso}/eliminar`);
  return data;
}
