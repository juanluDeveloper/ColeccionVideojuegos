import apiClient from "./apiClient";

export async function login(username, password) {
  const { data } = await apiClient.post("/api/v1/auth/login", { username, password });
  // data = { username, message, jwt, status }
  if (data?.jwt) localStorage.setItem("auth_jwt", data.jwt);
  if (data?.username) localStorage.setItem("auth_username", data.username);
  return data;
}

export function logout() {
  localStorage.removeItem("auth_jwt");
  localStorage.removeItem("auth_username");
}

export function getToken() {
  return localStorage.getItem("auth_jwt");
}