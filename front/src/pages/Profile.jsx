import React, { useMemo } from "react";
import {
  AiOutlineBgColors,
  AiOutlineCheckCircle,
  AiOutlineUser,
} from "react-icons/ai";
import { getSessionInfo } from "../api/authApi";
import { getAppSettings, THEME_OPTIONS } from "../utils/appSettings";
import "../styles/profile.css";

function formatRole(role, isAdmin) {
  if (isAdmin) return "Administrador";
  if (!role) return "Cuenta personal";

  return role
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getSessionStatus(expiresAt) {
  if (!expiresAt) {
    return {
      label: "Sesion activa",
      note: "Tu cuenta esta lista para seguir usando la aplicacion con normalidad.",
    };
  }

  if (expiresAt.getTime() <= Date.now()) {
    return {
      label: "Necesita volver a entrar",
      note: "Parece que la sesion ya no es valida y conviene iniciar sesion de nuevo.",
    };
  }

  return {
    label: "Sesion activa",
    note: "Todo esta correcto y puedes seguir entrando a tu biblioteca sin problema.",
  };
}

export default function Profile() {
  const session = getSessionInfo();
  const settings = getAppSettings();

  const currentTheme = useMemo(
    () => THEME_OPTIONS.find((option) => option.id === settings.theme) || THEME_OPTIONS[0],
    [settings.theme]
  );

  const viewModel = useMemo(() => {
    const status = getSessionStatus(session.expiresAt);
    const roleLabel = formatRole(session.role, session.isAdmin);

    return {
      status,
      roleLabel,
      accountType: session.isAdmin ? "Administrador" : "Cuenta personal",
    };
  }, [session]);

  const previewStyle = useMemo(
    () => ({
      "--profile-accent": currentTheme.accent,
      "--profile-accent-strong": currentTheme.accentStrong,
      "--profile-accent-soft": currentTheme.accentSoft,
      "--profile-accent-glow": currentTheme.glow,
    }),
    [currentTheme]
  );

  return (
    <div className="profile-page" style={previewStyle}>
      <section className="profile-hero">
        <div className="profile-hero-copy">
          <span className="profile-kicker">Perfil</span>
          <h1>Tu sesion dentro de la coleccion</h1>
          <p>
            Consulta de un vistazo con que cuenta has entrado y el estado general de tu
            acceso a la aplicacion.
          </p>

          <div className="profile-hero-meta">
            <span className="profile-meta-chip">{session.username}</span>
            <span className="profile-meta-chip">{viewModel.status.label}</span>
            {session.isAdmin && <span className="profile-meta-chip">Administrador</span>}
          </div>
        </div>

        <div className="profile-session-card">
          <div className="profile-session-avatar">
            {session.username?.[0]?.toUpperCase() || "U"}
          </div>

          <div className="profile-session-copy">
            <span className="profile-session-name">{session.username}</span>
            <span className={`profile-session-badge${session.isAdmin ? " is-admin" : ""}`}>
              {viewModel.accountType}
            </span>
            <p>{viewModel.status.note}</p>
          </div>

          <div className="profile-session-strip">
            <span className="profile-session-strip-label">Tema actual</span>
            <strong>{currentTheme.label}</strong>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-head">
          <div className="profile-section-title-wrap">
            <span className="profile-section-title">
              <AiOutlineUser />
              Tu cuenta
            </span>
            <span className="profile-section-description">
              La informacion principal de tu perfil dentro de la aplicacion.
            </span>
          </div>
        </div>

        <div className="profile-grid">
          <article className="profile-panel">
            <span className="profile-panel-label">Usuario</span>
            <strong className="profile-panel-value">{session.username}</strong>
            <p className="profile-panel-note">Es la cuenta con la que has iniciado sesion.</p>
          </article>

          <article className="profile-panel">
            <span className="profile-panel-label">Tipo de cuenta</span>
            <strong className="profile-panel-value">{viewModel.accountType}</strong>
            <p className="profile-panel-note">
              {session.isAdmin
                ? "Tu cuenta tiene permisos de administracion dentro de la aplicacion."
                : "Tu cuenta usa el acceso normal de usuario."}
            </p>
          </article>

          <article className="profile-panel">
            <span className="profile-panel-label">Acceso</span>
            <strong className="profile-panel-value">{viewModel.status.label}</strong>
            <p className="profile-panel-note">{viewModel.status.note}</p>
          </article>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section-head">
          <div className="profile-section-title-wrap">
            <span className="profile-section-title">
              <AiOutlineBgColors />
              Tu experiencia
            </span>
            <span className="profile-section-description">
              Un pequeño resumen de como estas viendo ahora mismo la aplicacion.
            </span>
          </div>
        </div>

        <div className="profile-details-grid">
          <article className="profile-detail-card">
            <div className="profile-detail-icon">
              <AiOutlineBgColors />
            </div>
            <div className="profile-detail-copy">
              <span>Tema visual</span>
              <strong>{currentTheme.label}</strong>
            </div>
          </article>

          <article className="profile-detail-card">
            <div className="profile-detail-icon">
              <AiOutlineCheckCircle />
            </div>
            <div className="profile-detail-copy">
              <span>Estado de la cuenta</span>
              <strong>{viewModel.status.label}</strong>
            </div>
          </article>
        </div>
      </section>

      <section className="profile-footer">
        <div className="profile-footer-copy">
          <strong>Perfil de usuario</strong>
          <span>
            Aqui se muestra solo la informacion util de tu cuenta dentro de la aplicacion.
          </span>
        </div>
      </section>
    </div>
  );
}
