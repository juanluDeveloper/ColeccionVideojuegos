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

function decodeBase64Url(value) {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return atob(padded);
  } catch {
    return null;
  }
}

export function decodeJwtPayload(token = getToken()) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const decoded = decodeBase64Url(parts[1]);
    return decoded ? JSON.parse(decoded) : null;
  } catch {
    return null;
  }
}

function normalizeRole(roleValue) {
  if (!roleValue) return null;
  const rawRole = String(roleValue).replace(/^ROLE_/i, "");
  return rawRole.toUpperCase();
}

function extractRole(payload) {
  if (!payload) return null;

  const directCandidates = [
    payload.role,
    payload.rol,
    payload.authority,
    payload.permissions,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return normalizeRole(candidate.trim());
    }
  }

  const arrayCandidates = [payload.roles, payload.authorities];
  for (const candidate of arrayCandidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      const firstRole = candidate.find(Boolean);
      if (firstRole) return normalizeRole(firstRole);
    }
  }

  if (payload.admin === true || payload.isAdmin === true) {
    return "ADMIN";
  }

  return null;
}

export function getSessionInfo() {
  const token = getToken();
  const payload = decodeJwtPayload(token);
  const username =
    localStorage.getItem("auth_username") ||
    payload?.preferred_username ||
    payload?.username ||
    payload?.sub ||
    "Usuario";

  const role = extractRole(payload);
  const isAdmin = role === "ADMIN";

  return {
    username,
    token,
    payload,
    role,
    isAdmin,
    issuedAt: payload?.iat ? new Date(payload.iat * 1000) : null,
    expiresAt: payload?.exp ? new Date(payload.exp * 1000) : null,
  };
}
