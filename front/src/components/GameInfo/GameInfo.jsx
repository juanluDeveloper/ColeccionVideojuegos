import "./GameInfo.css";
import React, { useState } from "react";
import { Button, Typography } from "antd";
import { editGame, linkIgdbGame } from "../../api/gamesApi";
import IgdbLinkModal from "../IgdbLinkModal/IgdbLinkModal";

const { Text } = Typography;

function formatDateDMY(dateLike) {
  if (!dateLike) return "-";
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
  if (!dateLike) return "-";
  const s = String(dateLike);
  const m = s.match(/^(\d{4})/);
  return m ? m[1] : "-";
}

function toApiDate(dateLike) {
  if (!dateLike) return null;
  const s = String(dateLike);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const d = new Date(s);
  if (isNaN(d)) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const GameInfo = ({ game, onIgdbLinked }) => {
  const [igdbModalOpen, setIgdbModalOpen] = useState(false);
  const [igdbLinkLoading, setIgdbLinkLoading] = useState(false);
  const [igdbLinkError, setIgdbLinkError] = useState("");

  if (!game) return null;

  const hasIgdb = !!game.igdbGameId || !!game.igdbUrl;
  const displayName = game.igdbName || game.nombre;

  const handleIgdbSelect = async (igdbItem) => {
    const localId = game?.id;
    const igdbId = igdbItem?.id;
    if (!localId || !igdbId) return;

    setIgdbLinkLoading(true);
    setIgdbLinkError("");
    try {
      await editGame(localId, {
        id: localId,
        nombre: igdbItem?.name?.trim() || game?.nombre,
        plataforma: game?.plataforma,
        generos: Array.isArray(game?.generos) ? game.generos : [],
        fechaLanzamiento: toApiDate(game?.fechaLanzamiento),
      });
      await linkIgdbGame(localId, igdbId);
      setIgdbModalOpen(false);
      onIgdbLinked?.();
    } catch {
      setIgdbLinkError("No se pudo vincular con IGDB.");
    } finally {
      setIgdbLinkLoading(false);
    }
  };

  const generos = Array.isArray(game.generos) ? game.generos : [];

  return (
    <div className="gameInfo">
      <div className="gi-header">
        <h2 className="gi-title" title={displayName}>{displayName}</h2>
        <div className="gi-subtitle">
          <span className="gi-badge gi-badge--platform">
            {String(game.plataforma ?? "-").replace(/_/g, " ")}
          </span>
          <span className="gi-year">{formatYear(game.fechaLanzamiento)}</span>
        </div>
      </div>

      <div className="gi-section">
        <div className="gi-sectionTitle">Ficha</div>

        <div className="gi-fieldGrid">
          <div className="gi-field">
            <span className="gi-fieldLabel">Lanzamiento</span>
            <span className="gi-fieldValue">{formatDateDMY(game.fechaLanzamiento)}</span>
          </div>
        </div>

        <div className="gi-field gi-field--full">
          <span className="gi-fieldLabel">Generos</span>
          <div className="gi-chips">
            {generos.length ? (
              generos.map((g, i) => (
                <span key={i} className="gi-chip">{g.replace(/_/g, " ")}</span>
              ))
            ) : (
              <span className="gi-fieldValue">-</span>
            )}
          </div>
        </div>
      </div>

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
        initialQuery={displayName}
        existingIgdbGameId={game?.igdbGameId}
        onCancel={() => setIgdbModalOpen(false)}
        onSelect={handleIgdbSelect}
      />
    </div>
  );
};

export default GameInfo;
