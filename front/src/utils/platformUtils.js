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
 * @returns {"ps"|"xbox"|"pc"|"ds"|"n3ds"|"gamecube"|"wiiu"|"wii"|"n64"|"nes"|"snes"|"gb"|"gbc"|"gba"|"switch"}
 */
export function mapPlataformaToFamily(plataforma) {
  if (!plataforma) return "switch";
  const p = String(plataforma).toUpperCase();

  if (p.includes("PS") || p === "PSX" || p === "PSVITA") return "ps";
  if (p.includes("XBOX")) return "xbox";
  if (p === "PC") return "pc";
  if (p.includes("3DS")) return "n3ds";
  if (p === "GAME_BOY") return "gb";
  if (p === "GAME_BOY_COLOR") return "gbc";
  if (p === "GAME_BOY_ADVANCE") return "gba";
  if (
    p.includes("DS") ||
    p === "VIRTUAL_BOY" ||
    p === "PSP"
  ) return "ds";
  if (p === "GAMECUBE") return "gamecube";
  if (p === "WII_U") return "wiiu";
  if (p === "WII") return "wii";
  if (p.includes("SWITCH")) return "switch";

  if (p === "NINTENDO_64") return "n64";
  if (p === "NES") return "nes";
  if (p === "SUPER_NINTENDO") return "snes";

  // Sega -> switch family (default look)
  if (p.includes("SEGA") || p === "SEGA_GENESIS" || p === "SEGA_SATURN" || p === "SEGA_DREAMCAST" || p === "GAME_GEAR") {
    return "switch";
  }

  // Retro / misc -> switch family
  if (p.includes("ATARI") || p.includes("3DO") || p.includes("PANASONIC")) return "switch";
  if (p.includes("NEO_GEO") || p.includes("PC_ENGINE") || p.includes("TURBOGRAFX")) return "switch";
  if (p.includes("WONDERSWAN")) return "switch";

  return "switch";
}

/**
 * Etiqueta corta de la plataforma para la portada/cover pill.
 *
 * @param {"ps"|"xbox"|"pc"|"ds"|"n3ds"|"gamecube"|"wiiu"|"wii"|"n64"|"nes"|"snes"|"gb"|"gbc"|"gba"|"switch"} family
 * @returns {string}
 */
export function platformLabel(family) {
  switch (family) {
    case "ps": return "PlayStation";
    case "xbox": return "Xbox";
    case "pc": return "PC";
    case "ds": return "Nintendo DS";
    case "n3ds": return "Nintendo 3DS";
    case "wiiu": return "Wii U";
    case "gamecube": return "GameCube";
    case "wii": return "Wii";
    case "n64": return "Nintendo 64";
    case "nes": return "NES";
    case "snes": return "Super Nintendo";
    case "gb": return "Game Boy";
    case "gbc": return "Game Boy Color";
    case "gba": return "Game Boy Advance";
    case "switch":
    default: return "Nintendo";
  }
}

/**
 * Color de acento para la plataforma (CSS hex).
 */
export function platformAccent(family) {
  switch (family) {
    case "ps": return "#1f4cff";
    case "xbox": return "#107c10";
    case "pc": return "#222222";
    case "ds": return "#444444";
    case "n3ds": return "#ce181e";
    case "gamecube": return "#4b2d8e";
    case "wiiu": return "#009ac7";
    case "wii": return "#8b8b8b";
    case "n64": return "#c41230";
    case "nes": return "#e60012";
    case "snes": return "#6b6b8a";
    case "gb": return "#8b8b8b";
    case "gbc": return "#6a5acd";
    case "gba": return "#4a4a6a";
    case "switch":
    default: return "#e60012";
  }
}
