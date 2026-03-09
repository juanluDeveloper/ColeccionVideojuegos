import { useEffect, useState } from "react";

function getJwtToken() {
  return localStorage.getItem("auth_jwt") || "";
}

function resolveApiUrl(url = "") {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
  return base.replace(/\/$/, "") + url;
}

export function useAuthedImageBlob(url) {
  const [blobSrc, setBlobSrc] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    const controller = new AbortController();

    async function load() {
      if (!url) {
        setBlobSrc(null);
        return;
      }

      try {
        const token = getJwtToken();
        const finalUrl = resolveApiUrl(url);

        const res = await fetch(finalUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setBlobSrc(objectUrl);
      } catch (e) {
        if (e?.name === "AbortError") return;
        console.error("useAuthedImageBlob:", e);
        setBlobSrc(null);
      }
    }

    load();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return blobSrc;
}