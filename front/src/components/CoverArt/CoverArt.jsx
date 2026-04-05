import React, { useEffect, useMemo, useState } from "react";
import { platformLabel, platformAccent } from "../../utils/platformUtils";
import "./CoverArt.css";

function hashToInt(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickInitials(name = "") {
  const s = String(name).trim();
  if (!s) return "VG";

  const words = s.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// ✅ TU TOKEN REAL
function getJwtToken() {
  return localStorage.getItem("auth_jwt") || "";
}

// ✅ Convierte /api/... a http://localhost:8080/api/...
function resolveApiUrl(url = "") {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const base = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
  // url suele venir como "/api/..."
  return base.replace(/\/$/, "") + url;
}

export default function CoverArt({ title, platform, coverUrl }) {
  const { bg, accent, initials, label } = useMemo(() => {
    const base = hashToInt(title);
    const h1 = base % 360;
    const h2 = (h1 + 38) % 360;

    const c1 = `hsl(${h1} 70% 55%)`;
    const c2 = `hsl(${h2} 70% 42%)`;

    return {
      bg: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
      accent: platformAccent(platform),
      initials: pickInitials(title),
      label: platformLabel(platform),
    };
  }, [title, platform]);

  const [blobSrc, setBlobSrc] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    const controller = new AbortController();

    async function loadCoverAsBlob() {
      if (!coverUrl) {
        setBlobSrc(null);
        return;
      }

      try {
        const token = getJwtToken();
        const finalUrl = resolveApiUrl(coverUrl);

        const res = await fetch(finalUrl, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Cover fetch failed: ${res.status}`);
        }

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setBlobSrc(objectUrl);
      } catch (e) {
        // ✅ Ignoramos abort de React 18 en dev
        if (e?.name === "AbortError") return;

        console.error("CoverArt: could not load cover image", e);
        setBlobSrc(null);
      }
    }

    loadCoverAsBlob();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [coverUrl]);

  const showImage = Boolean(blobSrc);

  return (
    <div className="coverArt" style={{ ["--accent"]: accent, background: bg }}>
      {showImage ? (
        <img
          className="coverArt__img"
          src={blobSrc}
          alt={`Cover ${title}`}
          loading="lazy"
        />
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