import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Game from "../components/Game/Game";
import { getMyGames, getGameDetail } from "../api/gamesApi";
import { Alert, Spin, Input, Select, Button } from "antd";
import { AiOutlineSearch } from "react-icons/ai";
import "./../styles/library.css";

export default function Library() {
  const [games, setGames] = useState([]);
  const [openGameId, setOpenGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const shelfRef = useRef(null);
  const libreriaRef = useRef(null);
  const [multiShelf, setMultiShelf] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyGames();
        const baseList = Array.isArray(data) ? data : [];

        // Premium UX: prefetch IGDB cover/art URLs for games already linked to IGDB
        // (keeps shelf visually rich without waiting to open each book)
        const enriched = await Promise.all(
          baseList.map(async (g) => {
            if (!g?.igdbGameId) return g;
            try {
              const dto = await getGameDetail(g.id);
              return { ...g, ...(dto || {}) };
            } catch {
              return g;
            }
          })
        );

        if (mounted) setGames(enriched);
      } catch (e) {
        setError(e?.response?.data?.message || "No se pudieron cargar los videojuegos.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    const el = libreriaRef.current;
    if (!el) return;

    const compute = () => {
      const kids = el.children;
      if (!kids || kids.length === 0) {
        setMultiShelf(false);
        return;
      }

      // altura de un libro (spine)
      const itemH = kids[0].getBoundingClientRect().height;

      // altura total de la librería (todas las filas)
      const totalH = el.getBoundingClientRect().height;

      // row-gap en tu CSS es 8px, sumamos un margen de seguridad
      const approxRow = itemH + 8;

      const rows = Math.round(totalH / approxRow);
      setMultiShelf(rows > 1);
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [games]);


  if (loading) return <div style={{ padding: 20 }}><Spin /></div>;
  if (error) return <div style={{ padding: 20 }}><Alert type="error" message={error} /></div>;

  return (
    <div className="p-3">
      {/* BARRA SUPERIOR (UI, sin lógica por ahora) */}
      <div className="library-toolbar">
        <div className="library-toolbar-left">
          <Input
            placeholder="Buscar juego..."
            prefix={<AiOutlineSearch />}
            style={{ width: 320 }}
            allowClear
          />

          <Select
            style={{ width: 180 }}
            defaultValue="ALL"
            options={[
              { value: "ALL", label: "Todas las plataformas" },
            ]}
          />

          <Select
            style={{ width: 180 }}
            defaultValue="ALL"
            options={[
              { value: "ALL", label: "Todos los géneros" },
            ]}
          />
        </div>

        <div className="library-toolbar-right">
          <Button type="primary" onClick={() => alert("Modal nuevo juego (pendiente)")}>
            Nuevo videojuego
          </Button>
        </div>
      </div>

      {/* CONTENIDO */}
      {games.length === 0 ? (
        <div style={{ padding: 24 }}>
          <h3>No tienes videojuegos todavía</h3>
          <p>Crea tu primer juego para que la librería muestre carátulas.</p>
        </div>
      ) : (
        <div ref={shelfRef} className={`shelf-area ${multiShelf ? "multi" : ""}`}>
          <div ref={libreriaRef} className="libreria">
            {games.map((g) => (
              <Game
                key={g.id}
                gameId={g.id}
                platform={mapPlataformaToMock(g.plataforma)}
                title={g.nombre}
                game={g}
                isOpen={openGameId === g.id}
                onOpen={() => setOpenGameId(g.id)}
                onClose={() => setOpenGameId(null)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function mapPlataformaToMock(plataforma) {
  if (!plataforma) return "switch";
  const p = String(plataforma).toUpperCase();
  if (p.includes("PS")) return "ps";
  if (p.includes("XBOX")) return "xbox";
  if (p.includes("PC")) return "pc";
  if (p.includes("DS") || p.includes("NDS")) return "ds";
  if (p.includes("SWITCH")) return "switch";
  return "switch";
}
