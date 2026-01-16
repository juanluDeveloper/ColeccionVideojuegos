import apiClient from "./apiClient";

export async function getMyGames() {
  const { data } = await apiClient.get("/api/v1/videojuegos/mis-videojuegos");
  return data; // Videojuego[]
}

export async function getGameById(id) {
  const { data } = await apiClient.get(`/api/v1/videojuegos/${id}`);
  return data;
}

export async function getSoportes(idVideojuego) {
  const { data } = await apiClient.get(`/api/v1/soporte/${idVideojuego}`);
  return data; // Soporte[]
}

export async function getProgresos(idVideojuego) {
  const { data } = await apiClient.get(`/api/v1/progreso/${idVideojuego}`);
  return data; // Progreso[]
}
