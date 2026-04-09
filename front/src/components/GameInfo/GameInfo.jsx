import "./GameInfo.css";
import React, { useState } from "react";
import { Button, Typography } from "antd";
import { linkIgdbGame } from "../../api/gamesApi";
import IgdbLinkModal from "../IgdbLinkModal/IgdbLinkModal";

const { Text } = Typography;

function formatDateDMY(dateLike) {
  if (!dateLike) return "—";
  const s = String(dateLike);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(s);
  if (!isNaN(d)) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}-${d.getFullYear()}`;
  }
  return s;
}

function formatYear(dateLike) {
  if (!dateLike) return "—";
  const s = String(dateLike);
  const m = s.match(/^(\d{4})/);
  return m ? m[1] : "—";
}

const GameInfo = ({ game, onIgdbLinked }) => {
  const [igdbModalOpen, setIgdbModalOpen] = useState(false);
  const [igdbLinkLoading, setIgdbLinkLoading] = useState(false);
  const [igdbLinkError, setIgdbLinkError] = useState("");

  if (!game) return null;

  const hasIgdb = !!game.igdbGameId || !!game.igdbUrl;

  const handleIgdbSelect = async (igdbItem) => {
    const localId = game?.id;
    const igdbId = igdbItem?.id;
    if (!localId || !igdbId) return;

    setIgdbLinkLoading(true);
    setIgdbLinkError("");
    try {
      await linkIgdbGame(localId, igdbId);
      setIgdbModalOpen(false);
      onIgdbLinked?.();
    } catch (e) {
      setIgdbLinkError("No se pudo vincular con IGDB.");
    } finally {
      setIgdbLinkLoading(false);
    }
  };

  const generos = Array.isArray(game.generos) ? game.generos : [];

  return (
    <div className="gameInfo">
      {/* Cabecera */}
      <div className="gi-header">
        <h2 className="gi-title" title={game.nombre}>{game.nombre}</h2>
        <div className="gi-subtitle">
          <span className="gi-badge gi-badge--platform">
            {String(game.plataforma ?? "—").replace(/_/g, " ")}
          </span>
          <span className="gi-year">{formatYear(game.fechaLanzamiento)}</span>
        </div>
      </div>

      {/* Ficha */}
      <div className="gi-section">
        <div className="gi-sectionTitle">Ficha</div>

        <div className="gi-fieldGrid">
          <div className="gi-field">
            <span className="gi-fieldLabel">Lanzamiento</span>
            <span className="gi-fieldValue">{formatDateDMY(game.fechaLanzamiento)}</span>
          </div>
          <div className="gi-field">
            <span className="gi-fieldLabel">Compra</span>
            <span className="gi-fieldValue">{formatDateDMY(game.fechaCompra)}</span>
          </div>
          <div className="gi-field">
            <span className="gi-fieldLabel">Precio</span>
            <span className="gi-fieldValue">
              {game.precio != null ? `${game.precio} €` : "—"}
            </span>
          </div>
        </div>

        <div className="gi-field gi-field--full">
          <span className="gi-fieldLabel">Géneros</span>
          <div className="gi-chips">
            {generos.length ? (
              generos.map((g, i) => (
                <span key={i} className="gi-chip">{g.replace(/_/g, " ")}</span>
              ))
            ) : (
              <span className="gi-fieldValue">—</span>
            )}
          </div>
        </div>
      </div>

      {/* IGDB compacto */}
      <div className="gi-section gi-igdb">
        <div className="gi-igdbRow">
          <div className="gi-igdbLeft">
            <Text strong style={{ color: "rgba(0,0,0,.85)" }}>IGDB</Text>
            <div className="gi-igdbHint">
              Powered by{" "}
              <a href="https://www.igdb.com/" target="_blank" rel="noreferrer">IGDB.com</a>
            </div>
          </div>
          <div className="gi-igdbActions">
            {game.igdbUrl ? (
              <Button size="small" href={game.igdbUrl} target="_blank" rel="noreferrer">
                Ver en IGDB
              </Button>
            ) : null}
            <Button
              size="small"
              type={hasIgdb ? "default" : "primary"}
              loading={igdbLinkLoading}
              onClick={(e) => {
                e.stopPropagation();
                setIgdbModalOpen(true);
              }}
            >
              {hasIgdb ? "Cambiar" : "Vincular"}
            </Button>
          </div>
        </div>
        {igdbLinkError ? <div className="gi-igdbError">{igdbLinkError}</div> : null}
      </div>

      <IgdbLinkModal
        open={igdbModalOpen}
        initialQuery={game?.nombre}
        existingIgdbGameId={game?.igdbGameId}
        onCancel={() => setIgdbModalOpen(false)}
        onSelect={handleIgdbSelect}
      />
    </div>
  );
};

export default GameInfo;
