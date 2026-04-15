import React, { useMemo, useState } from "react";
import { Button, Switch } from "antd";
import {
  AiOutlineBgColors,
  AiOutlineLayout,
  AiOutlineRollback,
  AiOutlineThunderbolt,
} from "react-icons/ai";
import {
  BACKGROUND_OPTIONS,
  DENSITY_OPTIONS,
  THEME_OPTIONS,
  getAppSettings,
  resetAppSettings,
  updateAppSettings,
} from "../utils/appSettings";
import "../styles/settings.css";

function themeTokens(themeId) {
  return THEME_OPTIONS.find((option) => option.id === themeId) || THEME_OPTIONS[0];
}

export default function Settings() {
  const username = localStorage.getItem("auth_username") || "Usuario";
  const [settings, setSettings] = useState(() => getAppSettings());

  const currentTheme = useMemo(() => themeTokens(settings.theme), [settings.theme]);
  const currentBackground = useMemo(
    () => BACKGROUND_OPTIONS.find((option) => option.id === settings.backgroundStyle) || BACKGROUND_OPTIONS[0],
    [settings.backgroundStyle]
  );
  const currentDensity = useMemo(
    () => DENSITY_OPTIONS.find((option) => option.id === settings.density) || DENSITY_OPTIONS[0],
    [settings.density]
  );

  const previewStyle = useMemo(
    () => ({
      "--settings-accent": currentTheme.accent,
      "--settings-accent-strong": currentTheme.accentStrong,
      "--settings-accent-soft": currentTheme.accentSoft,
      "--settings-accent-alt": currentTheme.accentAlt,
      "--settings-accent-alt-soft": currentTheme.accentAltSoft,
      "--settings-accent-deep": currentTheme.accentDeep,
      "--settings-glow": currentTheme.glow,
    }),
    [currentTheme]
  );

  const applyPatch = (patch) => {
    setSettings(updateAppSettings(patch));
  };

  const handleReset = () => {
    setSettings(resetAppSettings());
  };

  return (
    <div className="settings-page" style={previewStyle}>
      <section className="settings-hero">
        <div className="settings-hero-copy">
          <span className="settings-kicker">Ajustes</span>
          <h1>Personaliza la aplicacion a tu manera</h1>
          <p>
            Ajusta el tono visual, el fondo de trabajo y el comportamiento de la biblioteca
            para que la experiencia encaje mejor con tu forma de coleccionar.
          </p>

          <div className="settings-hero-meta">
            <span className="settings-meta-chip">{username}</span>
            <span className="settings-meta-chip">{currentTheme.label}</span>
            <span className="settings-meta-chip">{currentBackground.label}</span>
            <span className="settings-meta-chip">{currentDensity.label}</span>
          </div>
        </div>

        <div className={`settings-preview settings-preview--${settings.backgroundStyle}`}>
          <div className="settings-preview-window">
            <div className="settings-preview-side">
              <span className="settings-preview-brand">VG</span>
              <div className="settings-preview-nav">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="settings-preview-main">
              <div className="settings-preview-top">
                <div className="settings-preview-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="settings-preview-pill">{currentTheme.label}</span>
              </div>

              <div className="settings-preview-grid">
                <div className="settings-preview-panel settings-preview-panel--spines">
                  <div className="settings-preview-spine" />
                  <div className="settings-preview-spine" />
                  <div className="settings-preview-spine" />
                  <div className="settings-preview-spine" />
                </div>

                <div className="settings-preview-panel settings-preview-panel--controls">
                  <div className="settings-preview-line settings-preview-line--accent" />
                  <div className="settings-preview-line" />
                  <div className="settings-preview-line" />
                  <div className="settings-preview-chip-row">
                    <span className="settings-preview-chip settings-preview-chip--accent">Filtros</span>
                    <span className="settings-preview-chip">Copias</span>
                    <span className="settings-preview-chip">Playthroughs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title-wrap">
            <span className="settings-section-title">
              <AiOutlineBgColors />
              Identidad visual
            </span>
            <span className="settings-section-description">
              Elige el acento principal con el que la app marca botones, seleccionados y detalles.
            </span>
          </div>
        </div>

        <div className="settings-theme-grid">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`settings-choice${settings.theme === option.id ? " is-active" : ""}`}
              onClick={() => applyPatch({ theme: option.id })}
            >
              <div className="settings-theme-swatches">
                <span style={{ background: option.accent }} />
                <span style={{ background: option.accentStrong }} />
                <span style={{ background: option.accentSoft }} />
                <span style={{ background: option.accentAlt }} />
                <span style={{ background: option.accentAltSoft }} />
              </div>
              <span className="settings-choice-label">{option.label}</span>
              <span className="settings-choice-description">{option.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title-wrap">
            <span className="settings-section-title">
              <AiOutlineLayout />
              Ambiente de trabajo
            </span>
            <span className="settings-section-description">
              Cambia la atmosfera global del dashboard para acercarla mas a tu forma de usar la coleccion.
            </span>
          </div>
        </div>

        <div className="settings-surface-grid">
          {BACKGROUND_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`settings-choice${settings.backgroundStyle === option.id ? " is-active" : ""}`}
              onClick={() => applyPatch({ backgroundStyle: option.id })}
            >
              <div className={`settings-surface-preview settings-surface-preview--${option.id}`} />
              <span className="settings-choice-label">{option.label}</span>
              <span className="settings-choice-description">{option.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-head">
          <div className="settings-section-title-wrap">
            <span className="settings-section-title">
              <AiOutlineThunderbolt />
              Experiencia
            </span>
            <span className="settings-section-description">
              Ajustes rapidos para el ritmo visual de la app y el comportamiento inicial de la biblioteca.
            </span>
          </div>
        </div>

        <div className="settings-controls-grid">
          <div className="settings-control-block">
            <h3>Densidad de interfaz</h3>
            <p>Decide si prefieres mas aire visual o una vista mas compacta.</p>

            <div className="settings-density-options">
              {DENSITY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`settings-density-button${settings.density === option.id ? " is-active" : ""}`}
                  onClick={() => applyPatch({ density: option.id })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-control-block">
            <h3>Animaciones</h3>
            <p>Reduce transiciones si quieres una interfaz mas inmediata y sobria.</p>

            <div className="settings-switch-row">
              <span>{settings.motion ? "Animaciones suaves activas" : "Movimiento reducido"}</span>
              <Switch
                checked={settings.motion}
                onChange={(checked) => applyPatch({ motion: checked })}
              />
            </div>
          </div>

          <div className="settings-control-block">
            <h3>Biblioteca</h3>
            <p>Haz que la libreria arranque ya enfocada en la estanteria, con filtros plegados.</p>

            <div className="settings-switch-row">
              <span>
                {settings.libraryFiltersCollapsedByDefault
                  ? "Abrir con filtros minimizados"
                  : "Abrir con filtros desplegados"}
              </span>
              <Switch
                checked={settings.libraryFiltersCollapsedByDefault}
                onChange={(checked) => applyPatch({ libraryFiltersCollapsedByDefault: checked })}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="settings-footer">
        <div className="settings-footer-copy">
          <strong>Los cambios se aplican al momento</strong>
          <span>
            Los metadatos de videojuegos siguen obteniendose desde{" "}
            <a
              className="settings-footer-link"
              href="https://www.igdb.com/"
              target="_blank"
              rel="noreferrer"
            >
              IGDB
            </a>
            .
          </span>
        </div>

        <Button icon={<AiOutlineRollback />} onClick={handleReset}>
          Restaurar ajustes
        </Button>
      </section>
    </div>
  );
}
