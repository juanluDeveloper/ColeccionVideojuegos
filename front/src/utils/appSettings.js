export const APP_SETTINGS_STORAGE_KEY = "vg_app_settings";

export const THEME_OPTIONS = [
  {
    id: "cobalt",
    label: "Cobalto",
    description: "Azul limpio y elegante para una app de coleccion moderna.",
    accent: "#245cff",
    accentStrong: "#1238c7",
    accentSoft: "#dce7ff",
    accentAlt: "#5b48d6",
    accentAltSoft: "#ece9ff",
    accentDeep: "#0f172a",
    glow: "rgba(36, 92, 255, 0.18)",
  },
  {
    id: "amber",
    label: "Ambar",
    description: "Calido, editorial y mas cercano a una sala de coleccion.",
    accent: "#d97706",
    accentStrong: "#b45309",
    accentSoft: "#ffedd5",
    accentAlt: "#c65d3b",
    accentAltSoft: "#fde7df",
    accentDeep: "#6b3410",
    glow: "rgba(217, 119, 6, 0.18)",
  },
  {
    id: "emerald",
    label: "Esmeralda",
    description: "Mas fresco y sereno, con un punto arcade contemporaneo.",
    accent: "#059669",
    accentStrong: "#047857",
    accentSoft: "#d1fae5",
    accentAlt: "#0f766e",
    accentAltSoft: "#d8f6f1",
    accentDeep: "#164e63",
    glow: "rgba(5, 150, 105, 0.18)",
  },
];

export const BACKGROUND_OPTIONS = [
  {
    id: "paper",
    label: "Estudio claro",
    description: "Fondo luminoso con aire de archivo curado.",
  },
  {
    id: "mist",
    label: "Neblina suave",
    description: "Mas profundidad y un ambiente ligeramente cinematografico.",
  },
  {
    id: "midnight",
    label: "Noche premium",
    description: "Una presencia mas oscura y envolvente sin llegar a modo oscuro total.",
  },
];

export const DENSITY_OPTIONS = [
  {
    id: "comfortable",
    label: "Amplia",
    description: "Mas aire entre bloques y una lectura relajada.",
  },
  {
    id: "compact",
    label: "Compacta",
    description: "Menos separacion para ver mas contenido a la vez.",
  },
];

export const DEFAULT_APP_SETTINGS = {
  theme: THEME_OPTIONS[0].id,
  backgroundStyle: BACKGROUND_OPTIONS[0].id,
  density: DENSITY_OPTIONS[0].id,
  motion: true,
  libraryFiltersCollapsedByDefault: false,
};

function isValidOption(value, options) {
  return options.some((option) => option.id === value);
}

export function normalizeAppSettings(rawSettings = {}) {
  return {
    theme: isValidOption(rawSettings.theme, THEME_OPTIONS)
      ? rawSettings.theme
      : DEFAULT_APP_SETTINGS.theme,
    backgroundStyle: isValidOption(rawSettings.backgroundStyle, BACKGROUND_OPTIONS)
      ? rawSettings.backgroundStyle
      : DEFAULT_APP_SETTINGS.backgroundStyle,
    density: isValidOption(rawSettings.density, DENSITY_OPTIONS)
      ? rawSettings.density
      : DEFAULT_APP_SETTINGS.density,
    motion:
      typeof rawSettings.motion === "boolean"
        ? rawSettings.motion
        : DEFAULT_APP_SETTINGS.motion,
    libraryFiltersCollapsedByDefault:
      typeof rawSettings.libraryFiltersCollapsedByDefault === "boolean"
        ? rawSettings.libraryFiltersCollapsedByDefault
        : DEFAULT_APP_SETTINGS.libraryFiltersCollapsedByDefault,
  };
}

export function getAppSettings() {
  try {
    const raw = localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    return normalizeAppSettings(raw ? JSON.parse(raw) : {});
  } catch {
    return { ...DEFAULT_APP_SETTINGS };
  }
}

export function applyAppSettings(settings) {
  if (typeof document === "undefined") return settings;

  const normalized = normalizeAppSettings(settings);
  const theme = THEME_OPTIONS.find((option) => option.id === normalized.theme) || THEME_OPTIONS[0];
  const root = document.documentElement;

  root.dataset.appTheme = normalized.theme;
  root.dataset.appBackground = normalized.backgroundStyle;
  root.dataset.appDensity = normalized.density;
  root.dataset.appMotion = normalized.motion ? "full" : "reduced";

  root.style.setProperty("--app-accent", theme.accent);
  root.style.setProperty("--app-accent-strong", theme.accentStrong);
  root.style.setProperty("--app-accent-soft", theme.accentSoft);
  root.style.setProperty("--app-accent-alt", theme.accentAlt);
  root.style.setProperty("--app-accent-alt-soft", theme.accentAltSoft);
  root.style.setProperty("--app-accent-deep", theme.accentDeep);
  root.style.setProperty("--app-accent-glow", theme.glow);

  return normalized;
}

function notifySettingsChange(settings) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app-settings-changed", { detail: settings }));
}

export function updateAppSettings(patch) {
  const nextSettings = normalizeAppSettings({
    ...getAppSettings(),
    ...patch,
  });

  localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
  applyAppSettings(nextSettings);
  notifySettingsChange(nextSettings);
  return nextSettings;
}

export function resetAppSettings() {
  localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_APP_SETTINGS));
  const nextSettings = applyAppSettings(DEFAULT_APP_SETTINGS);
  notifySettingsChange(nextSettings);
  return nextSettings;
}
