/**
 * =============================================================
 *  SPINE DESIGNS — Configuración visual de lomos por plataforma
 * =============================================================
 *
 * Cada entrada define cómo se ve el lomo de un juego en la estantería.
 * Los colores están basados en las cajas reales de cada plataforma.
 *
 * Propiedades:
 *   family      → familia CSS (para estilos compartidos de tamaño/forma)
 *   label       → texto que aparece en el lomo (ej: "PS2")
 *   spineTop    → color de fondo de la zona superior (logo/plataforma)
 *   spineBottom → color de fondo de la zona inferior (título del juego)
 *   textTop     → color del texto de la zona superior
 *   textBottom  → color del texto de la zona inferior
 *   accent      → color de acento general (para covers sin imagen, etc.)
 *   coverGrad   → gradiente CSS para la portada abierta
 *   width       → ancho del lomo ("normal", "thin", "thick")
 *   height      → alto del lomo ("normal", "short")
 */

const SPINE_DESIGNS = {

  // ========================
  //      PLAYSTATION
  // ========================

  PSX: {
    family: "ps",
    label: "PS1",
    // Caja jewel case negra, texto blanco
    spineTop: "#1e1e1e",
    spineBottom: "#1e1e1e",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#000000",
    coverGrad: "linear-gradient(180deg, #1e1e1e 0%, #0a0a0a 100%)",
    width: "normal",
    height: "normal",
  },

  PS2: {
    family: "ps",
    label: "PS2",
    // PAL: lomo negro arriba (logo PS2 azul), blanco abajo (título negro)
    spineTop: "#1e1e1e",
    spineBottom: "#f5f5f5",
    textTop: "#ffffff",
    textBottom: "#1e1e1e",
    accent: "#1c3f94",
    coverGrad: "linear-gradient(180deg, #1c3f94 0%, #0a0a0a 100%)",
    width: "normal",
    height: "normal",
  },

  PS3: {
    family: "ps",
    label: "PS3",
    // PAL: lomo negro arriba (logo PS3), blanco abajo (título negro)
    spineTop: "#1e1e1e",
    spineBottom: "#f5f5f5",
    textTop: "#ffffff",
    textBottom: "#1e1e1e",
    accent: "#cc0000",
    coverGrad: "linear-gradient(180deg, #2a2a2a 0%, #111111 100%)",
    width: "normal",
    height: "normal",
  },

  PS4: {
    family: "ps",
    label: "PS4",
    // Caja azul, lomo azul con texto blanco
    spineTop: "#003087",
    spineBottom: "#003087",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#003087",
    coverGrad: "linear-gradient(180deg, #003087 0%, #001a4d 100%)",
    width: "normal",
    height: "normal",
  },

  PS5: {
    family: "ps",
    label: "PS5",
    // Caja blanca, lomo blanco con texto negro
    spineTop: "#ffffff",
    spineBottom: "#f0f0f0",
    textTop: "#000000",
    textBottom: "#000000",
    accent: "#0070d1",
    coverGrad: "linear-gradient(180deg, #ffffff 0%, #e8e8e8 100%)",
    width: "normal",
    height: "normal",
  },

  PSP: {
    family: "ps",
    label: "PSP",
    // Caja UMD transparente/clara, lomo claro
    spineTop: "#3b3b3b",
    spineBottom: "#f5f5f5",
    textTop: "#ffffff",
    textBottom: "#333333",
    accent: "#1e1e1e",
    coverGrad: "linear-gradient(180deg, #3b3b3b 0%, #1a1a1a 100%)",
    width: "thin",
    height: "short",
  },

  PSVita: {
    family: "ps",
    label: "Vita",
    // Caja azul (como PS4 pero más pequeña)
    spineTop: "#003087",
    spineBottom: "#003087",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#003087",
    coverGrad: "linear-gradient(180deg, #003087 0%, #001a4d 100%)",
    width: "thin",
    height: "short",
  },

  // ========================
  //         XBOX
  // ========================

  Xbox: {
    family: "xbox",
    label: "Xbox",
    // Caja verde original Xbox
    spineTop: "#4aa53e",
    spineBottom: "#2d6b27",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#4aa53e",
    coverGrad: "linear-gradient(180deg, #4aa53e 0%, #1a4a15 100%)",
    width: "normal",
    height: "normal",
  },

  Xbox_360: {
    family: "xbox",
    label: "360",
    // Caja verde translúcida, lomo verde con texto blanco
    spineTop: "#5dc21e",
    spineBottom: "#f2f2f2",
    textTop: "#ffffff",
    textBottom: "#333333",
    accent: "#5dc21e",
    coverGrad: "linear-gradient(180deg, #5dc21e 0%, #2d8a0e 100%)",
    width: "normal",
    height: "normal",
  },

  Xbox_One: {
    family: "xbox",
    label: "One",
    // Caja verde, lomo verde oscuro
    spineTop: "#107c10",
    spineBottom: "#107c10",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#107c10",
    coverGrad: "linear-gradient(180deg, #107c10 0%, #0a4a0a 100%)",
    width: "normal",
    height: "normal",
  },

  Xbox_Series_X: {
    family: "xbox",
    label: "Series",
    // Caja verde/negra
    spineTop: "#107c10",
    spineBottom: "#1a1a1a",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#107c10",
    coverGrad: "linear-gradient(180deg, #107c10 0%, #0a3d0a 100%)",
    width: "normal",
    height: "normal",
  },

  Xbox_Series_S: {
    family: "xbox",
    label: "Series",
    spineTop: "#107c10",
    spineBottom: "#1a1a1a",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#107c10",
    coverGrad: "linear-gradient(180deg, #107c10 0%, #0a3d0a 100%)",
    width: "normal",
    height: "normal",
  },

  // ========================
  //        NINTENDO
  // ========================

  NES: {
    family: "nintendo",
    label: "NES",
    // Cajas de cartón negras con franja plateada
    spineTop: "#1e1e1e",
    spineBottom: "#333333",
    textTop: "#c0c0c0",
    textBottom: "#ffffff",
    accent: "#c41230",
    coverGrad: "linear-gradient(180deg, #1e1e1e 0%, #0a0a0a 100%)",
    width: "thick",
    height: "normal",
  },

  Super_Nintendo: {
    family: "nintendo",
    label: "SNES",
    // Cajas de cartón grises con franja colorida
    spineTop: "#6b6b8a",
    spineBottom: "#d4d4e0",
    textTop: "#ffffff",
    textBottom: "#1e1e1e",
    accent: "#6b6b8a",
    coverGrad: "linear-gradient(180deg, #6b6b8a 0%, #3a3a52 100%)",
    width: "thick",
    height: "normal",
  },

  Nintendo_64: {
    family: "nintendo",
    label: "N64",
    // Cajas de cartón grises/oscuras
    spineTop: "#2c2c2c",
    spineBottom: "#444444",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#c41230",
    coverGrad: "linear-gradient(180deg, #2c2c2c 0%, #111111 100%)",
    width: "thick",
    height: "normal",
  },

  GameCube: {
    family: "nintendo",
    label: "GC",
    // Caja DVD pequeña, lomo oscuro con acento morado
    spineTop: "#2a1a52",
    spineBottom: "#3d2870",
    textTop: "#ffffff",
    textBottom: "#e0d0ff",
    accent: "#4b2d8e",
    coverGrad: "linear-gradient(180deg, #4b2d8e 0%, #2a1a52 100%)",
    width: "normal",
    height: "short",
  },

  Wii: {
    family: "nintendo",
    label: "Wii",
    // Caja blanca, lomo blanco con texto gris
    spineTop: "#f2f2f2",
    spineBottom: "#ffffff",
    textTop: "#555555",
    textBottom: "#333333",
    accent: "#8b8b8b",
    coverGrad: "linear-gradient(180deg, #f2f2f2 0%, #dcdcdc 100%)",
    width: "normal",
    height: "normal",
  },

  Wii_U: {
    family: "nintendo",
    label: "Wii U",
    // Caja azul celeste
    spineTop: "#009ac7",
    spineBottom: "#f2f2f2",
    textTop: "#ffffff",
    textBottom: "#333333",
    accent: "#009ac7",
    coverGrad: "linear-gradient(180deg, #009ac7 0%, #006d8e 100%)",
    width: "normal",
    height: "normal",
  },

  Nintendo_Switch: {
    family: "nintendo",
    label: "Switch",
    // Caja roja, lomo rojo con texto blanco
    spineTop: "#e60012",
    spineBottom: "#ffffff",
    textTop: "#ffffff",
    textBottom: "#333333",
    accent: "#e60012",
    coverGrad: "linear-gradient(180deg, #e60012 0%, #8a000a 100%)",
    width: "thin",
    height: "normal",
  },

  // ========================
  //     NINTENDO PORTÁTIL
  // ========================

  Game_Boy: {
    family: "portable",
    label: "GB",
    // Cartucho gris — representamos como caja gris
    spineTop: "#8b8b8b",
    spineBottom: "#a0a0a0",
    textTop: "#1e1e1e",
    textBottom: "#1e1e1e",
    accent: "#8b8b8b",
    coverGrad: "linear-gradient(180deg, #8b8b8b 0%, #5a5a5a 100%)",
    width: "thin",
    height: "short",
  },

  Game_Boy_Color: {
    family: "portable",
    label: "GBC",
    // Cartucho transparente/colorido
    spineTop: "#6a5acd",
    spineBottom: "#9b8ec4",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#6a5acd",
    coverGrad: "linear-gradient(180deg, #6a5acd 0%, #3a2a8a 100%)",
    width: "thin",
    height: "short",
  },

  Game_Boy_Advance: {
    family: "portable",
    label: "GBA",
    // Caja cartón pequeña o cartucho, típicamente gris oscuro
    spineTop: "#4a4a6a",
    spineBottom: "#7a7a9a",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#4a4a6a",
    coverGrad: "linear-gradient(180deg, #4a4a6a 0%, #2a2a3a 100%)",
    width: "thin",
    height: "short",
  },

  Nintendo_DS: {
    family: "portable",
    label: "DS",
    // Caja negra (NTSC) / blanca (PAL), lomo negro o blanco
    spineTop: "#1e1e1e",
    spineBottom: "#f5f5f5",
    textTop: "#ffffff",
    textBottom: "#333333",
    accent: "#1e1e1e",
    coverGrad: "linear-gradient(180deg, #1e1e1e 0%, #0a0a0a 100%)",
    width: "normal",
    height: "short",
  },

  Nintendo_3DS: {
    family: "portable",
    label: "3DS",
    // Caja blanca con franja roja arriba
    spineTop: "#cc0000",
    spineBottom: "#ffffff",
    textTop: "#ffffff",
    textBottom: "#333333",
    accent: "#cc0000",
    coverGrad: "linear-gradient(180deg, #cc0000 0%, #8a0000 100%)",
    width: "normal",
    height: "short",
  },

  Virtual_Boy: {
    family: "portable",
    label: "VB",
    spineTop: "#cc0000",
    spineBottom: "#1e1e1e",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#cc0000",
    coverGrad: "linear-gradient(180deg, #cc0000 0%, #1e1e1e 100%)",
    width: "thick",
    height: "normal",
  },

  // ========================
  //         SEGA
  // ========================

  Sega_Master_System: {
    family: "sega",
    label: "SMS",
    // Caja de cartón con rejilla, roja/blanca
    spineTop: "#cc0000",
    spineBottom: "#f5f5f5",
    textTop: "#ffffff",
    textBottom: "#1e1e1e",
    accent: "#cc0000",
    coverGrad: "linear-gradient(180deg, #cc0000 0%, #8a0000 100%)",
    width: "thick",
    height: "normal",
  },

  Sega_Genesis: {
    family: "sega",
    label: "MD",
    // Caja negra con rejilla (clamshell), lomo negro
    spineTop: "#1e1e1e",
    spineBottom: "#1e1e1e",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#0060a8",
    coverGrad: "linear-gradient(180deg, #1e1e1e 0%, #0a0a0a 100%)",
    width: "thick",
    height: "normal",
  },

  Game_Gear: {
    family: "sega",
    label: "GG",
    spineTop: "#1e1e1e",
    spineBottom: "#333333",
    textTop: "#00b0f0",
    textBottom: "#ffffff",
    accent: "#00b0f0",
    coverGrad: "linear-gradient(180deg, #1e1e1e 0%, #0a0a0a 100%)",
    width: "thin",
    height: "short",
  },

  Sega_CD: {
    family: "sega",
    label: "SCD",
    spineTop: "#1e1e1e",
    spineBottom: "#2a2a2a",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#0060a8",
    coverGrad: "linear-gradient(180deg, #1e1e1e 0%, #0a0a0a 100%)",
    width: "normal",
    height: "normal",
  },

  Sega_32X: {
    family: "sega",
    label: "32X",
    spineTop: "#1e1e1e",
    spineBottom: "#333333",
    textTop: "#ffd700",
    textBottom: "#ffffff",
    accent: "#1e1e1e",
    coverGrad: "linear-gradient(180deg, #1e1e1e 0%, #0a0a0a 100%)",
    width: "thick",
    height: "normal",
  },

  Sega_Saturn: {
    family: "sega",
    label: "Saturn",
    // Caja tipo CD, lomo blanco/gris
    spineTop: "#2a2a2a",
    spineBottom: "#e8e8e8",
    textTop: "#ffffff",
    textBottom: "#1e1e1e",
    accent: "#2a2a2a",
    coverGrad: "linear-gradient(180deg, #2a2a2a 0%, #111111 100%)",
    width: "normal",
    height: "normal",
  },

  Sega_Dreamcast: {
    family: "sega",
    label: "DC",
    // PAL: jewel case, lomo azul Dreamcast arriba, blanco abajo
    spineTop: "#0055a4",
    spineBottom: "#f5f5f5",
    textTop: "#ffffff",
    textBottom: "#1e1e1e",
    accent: "#0055a4",
    coverGrad: "linear-gradient(180deg, #0055a4 0%, #003366 100%)",
    width: "normal",
    height: "normal",
  },

  // ========================
  //        OTROS RETRO
  // ========================

  Neo_Geo: {
    family: "retro",
    label: "NG",
    spineTop: "#d4a017",
    spineBottom: "#1e1e1e",
    textTop: "#1e1e1e",
    textBottom: "#ffffff",
    accent: "#d4a017",
    coverGrad: "linear-gradient(180deg, #d4a017 0%, #8a6a0f 100%)",
    width: "thick",
    height: "normal",
  },

  Neo_Geo_Pocket: {
    family: "retro",
    label: "NGP",
    spineTop: "#1e1e1e",
    spineBottom: "#444444",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#d4a017",
    coverGrad: "linear-gradient(180deg, #1e1e1e 0%, #0a0a0a 100%)",
    width: "thin",
    height: "short",
  },

  Neo_Geo_Pocket_Color: {
    family: "retro",
    label: "NGPC",
    spineTop: "#1e1e1e",
    spineBottom: "#444444",
    textTop: "#00b0f0",
    textBottom: "#ffffff",
    accent: "#00b0f0",
    coverGrad: "linear-gradient(180deg, #1e1e1e 0%, #0a0a0a 100%)",
    width: "thin",
    height: "short",
  },

  Atari_Lynx: {
    family: "retro",
    label: "Lynx",
    spineTop: "#cc0000",
    spineBottom: "#1e1e1e",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#cc0000",
    coverGrad: "linear-gradient(180deg, #cc0000 0%, #8a0000 100%)",
    width: "thin",
    height: "short",
  },

  Atari_Jaguar: {
    family: "retro",
    label: "Jaguar",
    spineTop: "#cc0000",
    spineBottom: "#1e1e1e",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#cc0000",
    coverGrad: "linear-gradient(180deg, #cc0000 0%, #1e1e1e 100%)",
    width: "thick",
    height: "normal",
  },

  PC_Engine: {
    family: "retro",
    label: "PCE",
    spineTop: "#f5f5f5",
    spineBottom: "#e8e8e8",
    textTop: "#cc0000",
    textBottom: "#1e1e1e",
    accent: "#cc0000",
    coverGrad: "linear-gradient(180deg, #f5f5f5 0%, #d0d0d0 100%)",
    width: "normal",
    height: "normal",
  },

  TurboGrafx_16: {
    family: "retro",
    label: "TG16",
    spineTop: "#1e1e1e",
    spineBottom: "#333333",
    textTop: "#ff6600",
    textBottom: "#ffffff",
    accent: "#ff6600",
    coverGrad: "linear-gradient(180deg, #1e1e1e 0%, #0a0a0a 100%)",
    width: "normal",
    height: "normal",
  },

  Panasonic_3DO: {
    family: "retro",
    label: "3DO",
    spineTop: "#003366",
    spineBottom: "#f5f5f5",
    textTop: "#ffd700",
    textBottom: "#1e1e1e",
    accent: "#003366",
    coverGrad: "linear-gradient(180deg, #003366 0%, #001a33 100%)",
    width: "normal",
    height: "normal",
  },

  WonderSwan: {
    family: "retro",
    label: "WS",
    spineTop: "#1e1e1e",
    spineBottom: "#444444",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#4169e1",
    coverGrad: "linear-gradient(180deg, #1e1e1e 0%, #0a0a0a 100%)",
    width: "thin",
    height: "short",
  },

  WonderSwan_Color: {
    family: "retro",
    label: "WSC",
    spineTop: "#4169e1",
    spineBottom: "#1e1e1e",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#4169e1",
    coverGrad: "linear-gradient(180deg, #4169e1 0%, #1e1e1e 100%)",
    width: "thin",
    height: "short",
  },

  // ========================
  //           PC
  // ========================

  PC: {
    family: "pc",
    label: "PC",
    // Caja DVD genérica, lomo gris oscuro
    spineTop: "#333333",
    spineBottom: "#1e1e1e",
    textTop: "#ffffff",
    textBottom: "#cccccc",
    accent: "#333333",
    coverGrad: "linear-gradient(180deg, #333333 0%, #111111 100%)",
    width: "normal",
    height: "normal",
  },
};

/**
 * Obtener el diseño de lomo para una plataforma.
 * Si no existe, devuelve un diseño genérico gris.
 */
export function getSpineDesign(plataforma) {
  return SPINE_DESIGNS[plataforma] || {
    family: "generic",
    label: plataforma || "?",
    spineTop: "#555555",
    spineBottom: "#333333",
    textTop: "#ffffff",
    textBottom: "#ffffff",
    accent: "#555555",
    coverGrad: "linear-gradient(180deg, #555555 0%, #222222 100%)",
    width: "normal",
    height: "normal",
  };
}

export default SPINE_DESIGNS;
