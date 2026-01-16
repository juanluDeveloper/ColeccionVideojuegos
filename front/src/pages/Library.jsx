import React, { useEffect, useState } from "react";
import Game from "../components/Game/Game";
import { getMyGames } from "../api/gamesApi";
import { Alert, Spin, Input, Select, Button } from "antd";
import { AiOutlineSearch } from "react-icons/ai";
import "./../styles/library.css";

export default function Library() {
  const [games, setGames] = useState([]);
  const [openGameId, setOpenGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyGames();
        if (mounted) setGames(Array.isArray(data) ? data : []);
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

        <Button type="primary" onClick={() => alert("Modal nuevo juego (pendiente)")}>
          Nuevo videojuego
        </Button>
      </div>

      {/* CONTENIDO */}
      {games.length === 0 ? (
        <div style={{ padding: 24 }}>
          <h3>No tienes videojuegos todavía</h3>
          <p>Crea tu primer juego para que la librería muestre carátulas.</p>
        </div>
      ) : (
        <div className="shelf-area">
          <div className="libreria">
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
