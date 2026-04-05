/**
 * Utilidades centralizadas para el mapeo de plataformas.
 *
 * Mapea el enum Plataforma del backend a "families" visuales
 * usadas por Game.jsx / Game.css para renderizar lomos y portadas.
 */

/**
 * Mapea el valor del enum Plataforma del backend a una "family" visual.
 *
 * @param {string} plataforma - Valor del enum (ej: "PS2", "Nintendo_Switch")
 * @returns {"ps"|"xbox"|"pc"|"ds"|"switch"}
 */
export function mapPlataformaToFamily(plataforma) {
  if (!plataforma) return "switch";
  const p = String(plataforma).toUpperCase();

  if (p.includes("PS") || p === "PSX" || p === "PSVITA") return "ps";
  if (p.includes("XBOX")) return "xbox";
  if (p === "PC") return "pc";
  if (
    p.includes("DS") ||
    p.includes("3DS") ||
    p === "GAME_BOY" ||
    p === "GAME_BOY_COLOR" ||
    p === "GAME_BOY_ADVANCE" ||
    p === "VIRTUAL_BOY" ||
    p === "PSP"
  ) return "ds";
  if (p.includes("SWITCH")) return "switch";

  // Nintendo home consoles → switch family
  if (p === "NES" || p === "SUPER_NINTENDO" || p === "NINTENDO_64" || p === "GAMECUBE" || p.includes("WII"))
    return "switch";

  // Sega → switch family (default look)
  if (p.includes("SEGA") || p === "SEGA_GENESIS" || p === "SEGA_SATURN" || p === "SEGA_DREAMCAST" || p === "GAME_GEAR")
    return "switch";

  // Retro / misc → switch family
  if (p.includes("ATARI") || p.includes("3DO") || p.includes("PANASONIC")) return "switch";
  if (p.includes("NEO_GEO") || p.includes("PC_ENGINE") || p.includes("TURBOGRAFX")) return "switch";
  if (p.includes("WONDERSWAN")) return "switch";

  return "switch";
}

/**
 * Etiqueta corta de la plataforma para la portada/cover pill.
 *
 * @param {"ps"|"xbox"|"pc"|"ds"|"switch"} family
 * @returns {string}
 */
export function platformLabel(family) {
  switch (family) {
    case "ps": return "PlayStation";
    case "xbox": return "Xbox";
    case "pc": return "PC";
    case "ds": return "Nintendo DS";
    case "switch":
    default: return "Nintendo";
  }
}

/**
 * Color de acento para la plataforma (CSS hex).
 *
 * @param {"ps"|"xbox"|"pc"|"ds"|"switch"} family
 * @returns {string}
 */
export function platformAccent(family) {
  switch (family) {
    case "ps": return "#1f4cff";
    case "xbox": return "#107c10";
    case "pc": return "#222222";
    case "ds": return "#444444";
    case "switch":
    default: return "#e60012";
  }
}
