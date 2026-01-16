import React, { useMemo } from "react";
import "./CoverArt.css";

function hashToInt(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0; // 32-bit
  }
  return Math.abs(h);
}

function pickInitials(name = "") {
  const s = String(name).trim();
  if (!s) return "VG";

  const words = s.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    // 1 palabra: 2 primeras letras
    return words[0].slice(0, 2).toUpperCase();
  }
  // 2+ palabras: iniciales de las dos primeras
  return (words[0][0] + words[1][0]).toUpperCase();
}

function platformLabel(platform = "") {
  switch (String(platform).toLowerCase()) {
    case "ps": return "PlayStation";
    case "xbox": return "Xbox";
    case "pc": return "PC";
    case "ds": return "Nintendo DS";
    case "switch":
    default: return "Switch";
  }
}

function platformAccent(platform = "") {
  // Solo acento (no fondo dominante)
  switch (String(platform).toLowerCase()) {
    case "ps": return "#1f4cff";
    case "xbox": return "#107c10";
    case "pc": return "#222222";
    case "ds": return "#444444";
    case "switch":
    default: return "#e60012";
  }
}

export default function CoverArt({ title, platform, coverUrl }) {
  const { bg, accent, initials, label } = useMemo(() => {
    const base = hashToInt(title);
    const h1 = base % 360;
    const h2 = (h1 + 38) % 360;

    // Un gradiente suave con buena legibilidad (premium)
    const c1 = `hsl(${h1} 70% 55%)`;
    const c2 = `hsl(${h2} 70% 42%)`;

    return {
      bg: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
      accent: platformAccent(platform),
      initials: pickInitials(title),
      label: platformLabel(platform),
    };
  }, [title, platform]);

  return (
    <div className="coverArt" style={{ ["--accent"]: accent, background: bg }}>
      {/* Si en el futuro hay coverUrl (IGDB o manual), se mostrará automáticamente */}
      {coverUrl ? (
        <img className="coverArt__img" src={coverUrl} alt={`Cover ${title}`} />
      ) : (
        <>
          <div className="coverArt__overlay" />
          <div className="coverArt__badge">{label}</div>
          <div className="coverArt__initials">{initials}</div>
          <div className="coverArt__title">{title}</div>
        </>
      )}
    </div>
  );
}