import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Game from "../components/Game/Game";
import { getMyGames, getGameDetail, deleteGame } from "../api/gamesApi";
import { Alert, Spin, Input, Select, Button } from "antd";
import { AiOutlineSearch } from "react-icons/ai";
import { mapPlataformaToFamily } from "../utils/platformUtils";
import { getSpineDesign } from "../config/spineDesigns";
import GameFormModal from "../components/GameFormModal/GameFormModal";
import "./../styles/library.css";

export default function Library() {
  const [games, setGames] = useState([]);
  const [openGameId, setOpenGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal crear/editar
  const [formOpen, setFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const shelfRef = useRef(null);
  const libreriaRef = useRef(null);

  // Baldas intermedias (entre filas)
  const [shelfBoards, setShelfBoards] = useState([]);

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyGames();
      const baseList = Array.isArray(data) ? data : [];

      // Premium UX: prefetch IGDB cover/art URLs for games already linked to IGDB
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

      setGames(enriched);
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudieron cargar los videojuegos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  /**
   * Estanteria real:
   *   ::before = tapa superior (CSS, siempre)
   *   baldas intermedias = entre filas (DOM, solo si hay 2+ filas)
   *   ::after = base inferior (CSS, siempre fija abajo)
   */
  const computeBoards = useCallback(() => {
    const container = libreriaRef.current;
    const shelf = shelfRef.current;
    if (!container || !shelf) return;

    const kids = Array.from(container.children);
    if (kids.length === 0) {
      setShelfBoards([]);
      return;
    }

    const shelfRect = shelf.getBoundingClientRect();

    const rows = [];
    let currentRow = [];
    let currentRowTop = null;

    for (const kid of kids) {
      const rect = kid.getBoundingClientRect();
      const relTop = rect.top - shelfRect.top;

      if (currentRowTop === null || Math.abs(relTop - currentRowTop) > 5) {
        if (currentRow.length > 0) rows.push(currentRow);
        currentRow = [{ relTop, height: rect.height }];
        currentRowTop = relTop;
      } else {
        currentRow.push({ relTop, height: rect.height });
      }
    }
    if (currentRow.length > 0) rows.push(currentRow);

    const boardMargin = 8;
    const boardH = 14;
    const shelfHeight = shelf.getBoundingClientRect().height;
    const boards = [];
    for (let i = 0; i < rows.length - 1; i++) {
      const maxBottom = Math.max(...rows[i].map((item) => item.relTop + item.height));
      const top = maxBottom + boardMargin;
      if (top + boardH < shelfHeight - boardH - 6) {
        boards.push(top);
      }
    }

    setShelfBoards(boards);
  }, []);

  const resizeTimerRef = useRef(null);

  useLayoutEffect(() => {
    computeBoards();

    const handleResize = () => {
      if (shelfRef.current) {
        shelfRef.current.querySelectorAll(".shelf-board").forEach((b) => {
          b.style.display = "none";
        });
      }
      setShelfBoards([]);
      clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(computeBoards, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimerRef.current);
    };
  }, [games, computeBoards]);

  useEffect(() => {
    const timer = setTimeout(computeBoards, 50);
    return () => clearTimeout(timer);
  }, [openGameId, computeBoards]);

  if (loading) return <div style={{ padding: 20 }}><Spin /></div>;
  if (error) return <div style={{ padding: 20 }}><Alert type="error" message={error} /></div>;

  return (
    <div className="p-3">
      {/* BARRA SUPERIOR */}
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
          <Button type="primary" onClick={() => { setEditingGame(null); setFormOpen(true); }}>
            Nuevo videojuego
          </Button>
        </div>
      </div>

      {/* CONTENIDO */}
      {games.length === 0 ? (
        <div style={{ padding: 24 }}>
          <h3>No tienes videojuegos todavia</h3>
          <p>Crea tu primer juego para que la libreria muestre caratulas.</p>
        </div>
      ) : (
        <div ref={shelfRef} className="shelf-area">
          {/* Baldas intermedias (entre filas) */}
          {shelfBoards.map((topPx, idx) => (
            <div
              key={`board-${idx}`}
              className="shelf-board"
              style={{ top: `${topPx}px` }}
            />
          ))}

          <div ref={libreriaRef} className="libreria">
            {games.map((g) => (
              <Game
                key={g.id}
                gameId={g.id}
                platform={mapPlataformaToFamily(g.plataforma)}
                rawPlatform={g.plataforma}
                spineDesign={getSpineDesign(g.plataforma)}
                title={g.nombre}
                game={g}
                isOpen={openGameId === g.id}
                onOpen={() => setOpenGameId(g.id)}
                onClose={() => setOpenGameId(null)}
                onEdit={() => {
                  setOpenGameId(null);
                  setEditingGame(g);
                  setFormOpen(true);
                }}
                onDelete={async () => {
                  try {
                    await deleteGame(g.id);
                    setOpenGameId(null);
                    setGames((prev) => prev.filter((x) => x.id !== g.id));
                  } catch (e) {
                    console.error("Error eliminando juego:", e);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
      {/* MODAL CREAR / EDITAR */}
      <GameFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={loadGames}
        game={editingGame}
        existingGames={games}
        onGoToGame={(gameId) => {
          setFormOpen(false);
          setOpenGameId(gameId);
        }}
      />
    </div>
  );
}
