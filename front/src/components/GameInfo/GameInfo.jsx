import "./GameInfo.css";
import React, { useMemo, useState } from "react";
import { Button, Modal, Switch, Timeline, Select, Empty } from "antd";

const GameInfo = ({ game }) => {
  const [isModalOpen, setIsModalOpen] = useState([false, false]);
  const [selectedSoporteIndex, setSelectedSoporteIndex] = useState(0);

  const progresos = Array.isArray(game?.progreso) ? game.progreso : [];
  const soportes = Array.isArray(game?.soporte) ? game.soporte : [];

  const lastProgreso = progresos.length ? progresos[progresos.length - 1] : null;

  const timelineItems = useMemo(() => {
    if (!progresos.length) return [];
    return progresos.map((p) => ({
      children: `${p.anyoJugado ?? "—"} · ${p.avance ?? "—"} · ${p.horasJugadas ?? 0}h · ${
        p.completadoCien ? "100%" : "—"
      } · Nota: ${p.nota ?? "—"}`,
    }));
  }, [progresos]);

  const soporteOptions = useMemo(() => {
    return soportes.map((s, idx) => ({
      value: idx,
      label: `${idx + 1}) ${s.tipo ?? "—"}${s.estado ? " · " + s.estado : ""}${s.edicion ? " · " + s.edicion : ""}`,
    }));
  }, [soportes]);

  const selectedSoporte = soportes[selectedSoporteIndex] || null;

  const butonOnClick = (idx, target) => {
    setIsModalOpen((p) => {
      const next = [...p];
      next[idx] = target;
      return next;
    });
  };

  if (!game) return null;

  return (
    <div className="gameInfo">
      <div className="gameTitle">
        <h1>{game.nombre}</h1>
      </div>

      <div>
        <div className="gameInfoRow">
          <span>Precio:</span>
          <span>{game.precio ?? "—"}</span>
        </div>

        <div className="gameInfoRow">
          <span>Fecha de lanzamiento:</span>
          <span>{game.fechaLanzamiento ?? "—"}</span>
        </div>

        <div className="gameInfoRow">
          <span>Fecha compra:</span>
          <span>{game.fechaCompra ?? "—"}</span>
        </div>

        <div className="gameInfoRow">
          <span>Plataforma:</span>
          <span>{game.plataforma ?? "—"}</span>
        </div>

        <div className="gameInfoRow">
          <span>Género:</span>
          <span>{game.genero ?? "—"}</span>
        </div>

        {/* PROGRESO */}
        <div className="gameInfoRow">
          <span>Progresos:</span>
          <span>{progresos.length ? `${progresos.length} registro(s)` : "—"}</span>
          <div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                butonOnClick(0, true);
              }}
              disabled={!progresos.length}
            >
              Detalles
            </Button>
          </div>
        </div>

        <Modal
          title="Progreso del juego"
          cancelButtonProps={{ style: { display: "none" } }}
          open={isModalOpen[0]}
          centered
          closable={false}
          onOk={(e) => {
            e.stopPropagation();
            butonOnClick(0, false);
          }}
        >
          <div className="statusBar">
            {progresos.length ? <Timeline items={timelineItems} /> : <Empty description="No hay progresos registrados" />}
          </div>
        </Modal>

        {/* SOPORTES */}
        <div className="gameInfoRow">
          <span>Soportes:</span>
          <span>{soportes.length ? `${soportes.length} copia(s)` : "—"}</span>
          <div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                butonOnClick(1, true);
              }}
              disabled={!soportes.length}
            >
              Detalles
            </Button>
          </div>
        </div>

        <Modal
          title="Detalles del soporte"
          cancelButtonProps={{ style: { display: "none" } }}
          open={isModalOpen[1]}
          centered
          closable={false}
          onOk={(e) => {
            e.stopPropagation();
            butonOnClick(1, false);
          }}
        >
          {!soportes.length ? (
            <Empty description="No hay soportes registrados" />
          ) : (
            <div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ marginRight: 8 }}>Seleccionar copia:</span>
                <Select
                  style={{ width: "100%" }}
                  value={selectedSoporteIndex}
                  options={soporteOptions}
                  onChange={(idx) => setSelectedSoporteIndex(idx)}
                />
              </div>

              <div className="gameInfoRow">
                <span>Tipo:</span>
                <span>{selectedSoporte?.tipo ?? "—"}</span>
              </div>

              <div className="gameInfoRow">
                <span>Estado:</span>
                <span>{selectedSoporte?.estado ?? "—"}</span>
              </div>

              <div className="gameInfoRow">
                <span>Edición:</span>
                <span>{selectedSoporte?.edicion ?? "—"}</span>
              </div>

              <div className="gameInfoRow">
                <span>Distribución:</span>
                <span>{selectedSoporte?.distribucion ?? "—"}</span>
              </div>

              <div className="gameInfoRow">
                <span>Precintado:</span>
                <Switch disabled checked={!!selectedSoporte?.precintado} />
              </div>

              <div className="gameInfoRow">
                <span>Región:</span>
                <span>{selectedSoporte?.region ?? "—"}</span>
              </div>

              <div className="gameInfoRow">
                <span>Año de salida (dist.):</span>
                <span>{selectedSoporte?.anyoSalidaDist ?? "—"}</span>
              </div>

              <div className="gameInfoRow">
                <span>Tienda:</span>
                <span>{selectedSoporte?.tienda ?? "—"}</span>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default GameInfo;
