import React, { useEffect, useRef, useState } from "react";
import "./Game.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logoSwitch from "../../assets/images/logo-switch.png";
import logoDS from "../../assets/images/logo-ds.png";
import logo3DS from "../../assets/images/logo-3ds.svg";
import logoWiiU from "../../assets/images/logo-wiiu.svg";
import logoWii from "../../assets/images/logo-wii.svg";
import logoGameCube from "../../assets/images/logo-gamecube.svg";
import logoN64 from "../../assets/images/logo-n64.svg";
import logo from "../../assets/images/logo192.png";
import GameInfo from "../GameInfo/GameInfo.jsx";
import { getSoportes, getProgresos, getGameDetail, createSoporte, updateSoporte, deleteSoporte, createProgreso, updateProgreso, deleteProgreso } from "../../api/gamesApi";
import SoporteModal from "../SoporteModal/SoporteModal";
import PlaythroughModal from "../PlaythroughModal/PlaythroughModal";
import { Spin, Alert } from "antd";
import CoverArt from "../CoverArt/CoverArt";
import { faPlaystation, faXbox, faSteam } from "@fortawesome/free-brands-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { useAuthedImageBlob } from "../../hooks/useAuthedImageBlob";

const Game = ({ platform, rawPlatform, spineDesign, title, gameId, game, isOpen, onOpen, onClose, onEdit, onDelete }) => {
  const spineRef = useRef(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const returnTimerRef = useRef(null);
  const [position, setPosition] = useState({});
  const [positionIni, setPositionIni] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // Modal añadir/editar soporte
  const [soporteModalOpen, setSoporteModalOpen] = useState(false);
  const [soporteLoading, setSoporteLoading] = useState(false);
  const [editingSoporte, setEditingSoporte] = useState(null); // null = crear, objeto = editar

  // Modal añadir/editar playthrough
  const [playthroughModalOpen, setPlaythroughModalOpen] = useState(false);
  const [playthroughLoading, setPlaythroughLoading] = useState(false);
  const [editingPlaythrough, setEditingPlaythrough] = useState(null);

  // Selección para panel derecho: { type: 'soporte'|'playthrough', data: {...} } o null (ficha general)
  const [selectedItem, setSelectedItem] = useState(null);

  // Abrir/cerrar controlado SOLO por isOpen (estado global)
  useEffect(() => {
    if (isOpen) {
      if (!isAnimating) openToCenter();
    } else {
      if (isAnimating) closeToShelf();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const openToCenter = () => {
    const element = spineRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    setPositionIni(rect);

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const targetX = (windowWidth - rect.width) / 1.5;
    const targetY = (windowHeight - rect.height) / 3;

    // 1) Pintamos primero la posición inicial (en la estantería)
    setPosition({
      position: "fixed",
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      zIndex: 1000,
      transition: "top 1s ease, left 1s ease",
    });

    setIsAnimating(true);
    setIsHover(false);

    // 2) En el siguiente frame (doble RAF), movemos al centro -> aquí sí anima
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPosition((prev) => ({
          ...prev,
          top: `${targetY}px`,
          left: `${targetX}px`,
        }));
      });
    });

    // detalle lazy al abrir (incluye IGDB URLs + soporte + progreso)
    const resolvedGameId = gameId ?? game?.id;
    if (!resolvedGameId) return;

    reloadDetail(resolvedGameId);
  };

  const reloadDetail = (resolvedGameId) => {
    setDetailLoading(true);
    setDetailError("");
    Promise.all([getGameDetail(resolvedGameId), getSoportes(resolvedGameId), getProgresos(resolvedGameId)])
      .then(([dto, soporte, progreso]) => {
        setDetail({
          ...(dto || {}),
          soporte: soporte || [],
          progreso: progreso || [],
        });
      })
      .catch(() => setDetailError("No se pudo cargar el detalle del juego."))
      .finally(() => setDetailLoading(false));
  };


  const closeToShelf = () => {
    if (!positionIni) return;

    // cierre “bueno”: mantener fixed y animar a la posición original
    setIsHover(false);

    setPosition((prev) => ({
      ...prev,
      top: `${positionIni.top}px`,
      left: `${positionIni.left}px`,
      transition: "all 1s ease",
    }));

    // al terminar, limpiamos estilos para que vuelva al grid sin saltos
    setTimeout(() => {
      setPosition({});
      setIsAnimating(false);
      setIsFlipped(false);
    }, 1000);
  };

  const handleMouseEnter = () => {
    if (!isAnimating && !isOpen) setIsHover(true);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
    setIsReturning(true);
    clearTimeout(returnTimerRef.current);
    returnTimerRef.current = setTimeout(() => setIsReturning(false), 550);
  };

  const handleSpineClick = (e) => {
    e.stopPropagation();
    // toggle simple: si está abierto, cierra; si está cerrado, abre
    if (isOpen) onClose?.();
    else onOpen?.();
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    setIsFlipped((v) => !v);
  };

  // CSS custom properties from spineDesign — override family defaults per platform
  // Solo aplicamos override a ps, xbox y pc. DS y Switch conservan su diseño original.
  const useSpineOverride = spineDesign && (platform === "ps" || platform === "xbox" || platform === "pc");
  const spineVars = useSpineOverride
    ? {
        "--spine-top": spineDesign.spineTop,
        "--spine-bottom": spineDesign.spineBottom,
        "--text-top": spineDesign.textTop,
        "--text-bottom": spineDesign.textBottom,
      }
    : {};

  // Per-platform label (PS2, PS3, 360, One, etc.) instead of generic "PS" / "XBOX"
  const spineLabel = useSpineOverride
    ? (spineDesign?.label || platform?.toUpperCase() || "")
    : undefined; // ds/switch usan su label original

  const renderPlatformIcon = (platform) => {
    switch (platform) {
      case "ps":
        return (
          <div className={`front ps ${isAnimating ? "animated" : ""}`} style={spineVars} data-plat={rawPlatform}>
            <div className="platform ps">
              <div className="icon ps">
                  <FontAwesomeIcon icon={faPlaystation} size="xl" style={{ color: "var(--text-top, #ffffff)" }} />
              </div>
              <div> {spineLabel || "PS"}</div>
            </div>
            <div className="title ps">{title}</div>
          </div>
        );
      case "xbox":
        return (
          <div className={`front xbox ${isAnimating ? "animated" : ""}`} style={spineVars}>
            <div className="platform xbox">
              <div className="icon xbox">
                <FontAwesomeIcon icon={faXbox} style={{ color: "var(--text-top, #ffffff)" }} />
              </div>
              <div className="xbox-label"> {spineLabel || "XBOX"}</div>
            </div>
            <div className="title xbox">{title}</div>
          </div>
        );
      case "pc":
        return (
          <div className={`front pc ${isAnimating ? "animated" : ""}`} style={spineVars}>
            <div className="platform pc">
              <div className="icon pc">
                <FontAwesomeIcon icon={faSteam} size="xl" />
              </div>
            </div>
            <div className="title pc">{title}</div>
          </div>
        );
      case "ds":
        return (
          <div className={`front ds ${isAnimating ? "animated" : ""}`}>
            <div className="platform ds">
              <div className="icon ds">
                <img src={logoDS} alt="Logo" style={{ width: "auto", height: "100%", rotate: "90deg" }} />
              </div>
            </div>
            <div className="title ds">{title}</div>
          </div>
        );
      case "n3ds":
        return (
          <div className={`front n3ds ${isAnimating ? "animated" : ""}`}>
            <div className="platform n3ds">
              <div className="icon n3ds">
                <img src={logo3DS} alt="Nintendo 3DS" />
              </div>
            </div>
            <div className="title n3ds">{title}</div>
          </div>
        );
      case "n64":
        return (
          <div className={`front n64 ${isAnimating ? "animated" : ""}`}>
            <div className="platform n64">
              <div className="icon n64">
                <img src={logoN64} alt="Nintendo 64" />
              </div>
            </div>
            <div className="title n64">{title}</div>
          </div>
        );
      case "gamecube":
        return (
          <div className={`front gamecube ${isAnimating ? "animated" : ""}`}>
            <div className="platform gamecube">
              <div className="icon gamecube">
                <img src={logoGameCube} alt="GameCube" />
              </div>
            </div>
            <div className="title gamecube">{title}</div>
          </div>
        );
      case "wii":
        return (
          <div className={`front wii ${isAnimating ? "animated" : ""}`}>
            <div className="platform wii">
              <div className="icon wii">
                <img src={logoWii} alt="Wii" style={{ width: "100%", height: "auto" }} />
              </div>
            </div>
            <div className="title wii">{title}</div>
          </div>
        );
      case "wiiu":
        return (
          <div className={`front wiiu ${isAnimating ? "animated" : ""}`}>
            <div className="platform wiiu">
              <div className="icon wiiu">
                <img src={logoWiiU} alt="Wii U" style={{ width: "100%", height: "auto" }} />
              </div>
            </div>
            <div className="title wiiu">{title}</div>
          </div>
        );
      default:
        return (
          <div className={`front switch ${isAnimating ? "animated" : ""}`} data-plat={rawPlatform}>
            <div className="platform switch">
              <div className="icon switch">
                <img src={logoSwitch} alt="Logo" style={{ width: "100%", height: "auto" }} />
              </div>
            </div>
            <div className="title switch">{title}</div>
          </div>
        );
    }
  };

  // merged game data (base + IGDB DTO + soporte/progreso)
  const merged = mergeGame(game, detail);
  const artworkBlob = useAuthedImageBlob(merged?.artworkUrl);
  const diskLogoByPlatform = {
    ps: logo,
    xbox: logo,
    pc: logo,
    ds: logoDS,
    n3ds: logo3DS,
    n64: logoN64,
    gamecube: logoGameCube,
    wii: logoWii,
    wiiu: logoWiiU,
    switch: logoSwitch,
  };
  const diskLogo = diskLogoByPlatform[platform] || logoSwitch;

  const renderDisk = () => {
    if (platform === "ps") {
      return <FontAwesomeIcon icon={faPlaystation} className="diskIcon" />;
    }
    if (platform === "xbox") {
      return <FontAwesomeIcon icon={faXbox} className="diskIcon" />;
    }
    if (platform === "pc") {
      return <FontAwesomeIcon icon={faSteam} className="diskIcon" />;
    }
    if (platform === "ds") {
      return <img src={logoDS} alt="Disk" className="diskImg" />;
    }
    if (platform === "gamecube") {
      return <img src={logoGameCube} alt="Disk" className="diskImg" />;
    }
    if (platform === "wii") {
      return <img src={logoWii} alt="Disk" className="diskImg" />;
    }
    if (platform === "wiiu") {
      return <img src={logoWiiU} alt="Disk" className="diskImg" />;
    }
    return <img src={logoSwitch} alt="Disk" className="diskImg" />;
  };



  return (
    <div className={`game-container ${isReturning ? "returning" : ""}`}>
      <div
        className={`cube ${isAnimating ? "animated" : ""} ${isHover ? "hover" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={position}
      >
        {/* LOMO (medición + click abrir/cerrar) */}
        <div ref={spineRef} onClick={handleSpineClick}>
          {renderPlatformIcon(platform)}
        </div>

        {/* PANEL ABIERTO */}
        <div className={`left ${platform} ${isAnimating ? "animated" : ""}`} data-plat={rawPlatform}>
          <div className="card-container" onClick={handleCardClick}>
            <div className="book" onClick={handleCardClick}>
              {/* PORTADA CERRADA */}
              <div
                className={`page frontCard ${isFlipped ? "flipped" : ""}`}
                style={
                  artworkBlob
                    ? {
                        backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.65)), url(${artworkBlob})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                <div className={`coverClosed cover-${platform}`}>
                  <div className="coverCenter">
                    <div className={`coverSlot ${platform}`}>
                      <CoverArt
                        title={merged?.nombre ?? title}
                        platform={platform}
                        coverUrl={merged?.coverUrl}
                      />
                    </div>
                    <h2 className="coverTitle">{merged?.nombre ?? title}</h2>
                  </div>

                  <div className="coverShine" />
                </div>
              </div>

              {/* ═══ PÁGINA IZQUIERDA — Listas + Acciones ═══ */}
              <div className={`page middleCard ${isFlipped ? "flipped" : ""}`}>
                <div className="rp" onClick={(e) => e.stopPropagation()}>
                  {detailLoading && <Spin />}
                  {detailError && <Alert type="error" message={detailError} />}
                  {!detailLoading && !detailError && (<>

                  {/* Mis copias */}
                  <div className="rp-section">
                    <div className="rp-sectionTitle">Mis copias</div>
                    {(merged?.soporte?.length ?? 0) === 0 ? (
                      <div className="rp-empty">Sin copias registradas</div>
                    ) : (
                      <div className="rp-cards">
                        {merged.soporte.map((s, i) => {
                          const isSel = selectedItem?.type === "soporte" && selectedItem?.data?.id === s.id;
                          return (
                            <div
                              key={s.id ?? i}
                              className={`rp-card rp-card--selectable ${isSel ? "rp-card--selected" : ""}`}
                              onClick={() => setSelectedItem(isSel ? null : { type: "soporte", data: s })}
                            >
                              <div className="rp-cardRow">
                                <span className="rp-tag">{s.tipo?.replace(/_/g, " ") ?? "—"}</span>
                                {s.precintado && <span className="rp-tag rp-tag--accent">Precintado</span>}
                                <button className="rp-cardEdit" title="Editar copia" onClick={(e) => { e.stopPropagation(); setEditingSoporte(s); setSoporteModalOpen(true); }}>
                                  <FontAwesomeIcon icon={faPenToSquare} />
                                </button>
                                <button className="rp-cardDelete" title="Eliminar copia" onClick={(e) => {
                                  e.stopPropagation();
                                  const rid = gameId ?? game?.id;
                                  if (!rid || !s.id) return;
                                  if (window.confirm("¿Eliminar esta copia?")) {
                                    deleteSoporte(rid, s.id).then(() => { setSelectedItem(null); reloadDetail(rid); }).catch(console.error);
                                  }
                                }}>✕</button>
                              </div>
                              <div className="rp-cardDetails">
                                {s.edicion && <span>{s.edicion.replace(/_/g, " ")}</span>}
                                {s.estado && <span>{s.estado.replace(/_/g, " ")}</span>}
                                {s.region && <span>{s.region}</span>}
                                {s.precio != null && <span>{s.precio} €</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mis playthroughs */}
                  <div className="rp-section">
                    <div className="rp-sectionTitle">Mis playthroughs</div>
                    {(merged?.progreso?.length ?? 0) === 0 ? (
                      <div className="rp-empty">Sin playthroughs registrados</div>
                    ) : (
                      <div className="rp-cards">
                        {merged.progreso.map((p, i) => {
                          const isSel = selectedItem?.type === "playthrough" && selectedItem?.data?.id === p.id;
                          return (
                            <div
                              key={p.id ?? i}
                              className={`rp-card rp-card--play rp-card--selectable ${isSel ? "rp-card--selected" : ""}`}
                              onClick={() => setSelectedItem(isSel ? null : { type: "playthrough", data: p })}
                            >
                              <div className="rp-cardRow">
                                <span className="rp-tag">{p.avance?.replace(/_/g, " ") ?? "—"}</span>
                                {p.completadoCien && <span className="rp-tag rp-tag--gold">100%</span>}
                                <button className="rp-cardEdit" title="Editar playthrough" onClick={(e) => { e.stopPropagation(); setEditingPlaythrough(p); setPlaythroughModalOpen(true); }}>
                                  <FontAwesomeIcon icon={faPenToSquare} />
                                </button>
                                <button className="rp-cardDelete" title="Eliminar playthrough" onClick={(e) => {
                                  e.stopPropagation();
                                  const rid = gameId ?? game?.id;
                                  if (!rid || !p.id) return;
                                  if (window.confirm("¿Eliminar este playthrough?")) {
                                    deleteProgreso(rid, p.id).then(() => { setSelectedItem(null); reloadDetail(rid); }).catch(console.error);
                                  }
                                }}>✕</button>
                              </div>
                              <div className="rp-cardDetails">
                                {p.anyoJugado != null && <span>{p.anyoJugado}</span>}
                                {p.horasJugadas != null && <span>{p.horasJugadas}h</span>}
                                {p.nota != null && <span>Nota: {p.nota}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="rp-actions">
                    <button className="rp-btn rp-btn--primary" style={onEdit ? { cursor: "pointer", opacity: 1 } : undefined} disabled={!onEdit} onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>Editar juego</button>
                    <button className="rp-btn rp-btn--primary" style={{ cursor: "pointer", opacity: 1 }} onClick={(e) => { e.stopPropagation(); setEditingPlaythrough(null); setPlaythroughModalOpen(true); }}>Añadir playthrough</button>
                    <button className="rp-btn rp-btn--primary" style={{ cursor: "pointer", opacity: 1 }} onClick={(e) => { e.stopPropagation(); setEditingSoporte(null); setSoporteModalOpen(true); }}>Añadir soporte</button>
                    <button className="rp-btn rp-btn--danger" style={onDelete ? { cursor: "pointer", opacity: 1 } : undefined} disabled={!onDelete} onClick={(e) => { e.stopPropagation(); if (window.confirm(`¿Eliminar "${merged?.nombre ?? title}"? Esta acción no se puede deshacer.`)) onDelete?.(); }}>Eliminar juego</button>
                  </div>

                  </>)}

                  {/* Modales */}
                  <SoporteModal
                    open={soporteModalOpen} loading={soporteLoading} initialValues={editingSoporte}
                    onCancel={() => { setSoporteModalOpen(false); setEditingSoporte(null); }}
                    onSubmit={async (values) => {
                      const rid = gameId ?? game?.id; if (!rid) return;
                      setSoporteLoading(true);
                      try { if (editingSoporte?.id) await updateSoporte(rid, editingSoporte.id, values); else await createSoporte(rid, values); setSoporteModalOpen(false); setEditingSoporte(null); reloadDetail(rid); } catch(e) { console.error("Error guardando soporte:", e); } finally { setSoporteLoading(false); }
                    }}
                  />
                  <PlaythroughModal
                    open={playthroughModalOpen} loading={playthroughLoading} initialValues={editingPlaythrough}
                    onCancel={() => { setPlaythroughModalOpen(false); setEditingPlaythrough(null); }}
                    onSubmit={async (values) => {
                      const rid = gameId ?? game?.id; if (!rid) return;
                      setPlaythroughLoading(true);
                      try { if (editingPlaythrough?.id) await updateProgreso(rid, editingPlaythrough.id, values); else await createProgreso(rid, values); setPlaythroughModalOpen(false); setEditingPlaythrough(null); reloadDetail(rid); } catch(e) { console.error("Error guardando playthrough:", e); } finally { setPlaythroughLoading(false); }
                    }}
                  />
                </div>
              </div>

              {/* ═══ PÁGINA DERECHA — Detalle del item seleccionado o ficha general ═══ */}
              <div className="page backCard">
                <div className="rp" onClick={(e) => e.stopPropagation()}>
                  {!selectedItem ? (
                    /* Ficha general del juego */
                    <GameInfo
                      game={merged}
                      onIgdbLinked={() => { const rid = gameId ?? game?.id; if (rid) reloadDetail(rid); }}
                    />
                  ) : selectedItem.type === "soporte" ? (
                    /* Detalle de una copia */
                    <div className="rp-detail">
                      <div className="rp-detailHeader">
                        <span className="rp-sectionTitle">Detalle de copia</span>
                        <button className="rp-detailClose" onClick={() => setSelectedItem(null)}>← Volver</button>
                      </div>
                      <div className="rp-detailGrid">
                        <div className="gi-field"><span className="gi-fieldLabel">Tipo</span><span className="gi-fieldValue">{selectedItem.data.tipo?.replace(/_/g, " ") ?? "—"}</span></div>
                        <div className="gi-field"><span className="gi-fieldLabel">Estado</span><span className="gi-fieldValue">{selectedItem.data.estado?.replace(/_/g, " ") ?? "—"}</span></div>
                        <div className="gi-field"><span className="gi-fieldLabel">Edición</span><span className="gi-fieldValue">{selectedItem.data.edicion?.replace(/_/g, " ") ?? "—"}</span></div>
                        <div className="gi-field"><span className="gi-fieldLabel">Distribución</span><span className="gi-fieldValue">{selectedItem.data.distribucion?.replace(/_/g, " ") ?? "—"}</span></div>
                        <div className="gi-field"><span className="gi-fieldLabel">Región</span><span className="gi-fieldValue">{selectedItem.data.region ?? "—"}</span></div>
                        <div className="gi-field"><span className="gi-fieldLabel">Tienda</span><span className="gi-fieldValue">{selectedItem.data.tienda?.replace(/_/g, " ") ?? "—"}</span></div>
                        <div className="gi-field"><span className="gi-fieldLabel">Año distribución</span><span className="gi-fieldValue">{selectedItem.data.anyoSalidaDist ?? "—"}</span></div>
                        <div className="gi-field"><span className="gi-fieldLabel">Precio</span><span className="gi-fieldValue">{selectedItem.data.precio != null ? `${selectedItem.data.precio} €` : "—"}</span></div>
                        <div className="gi-field"><span className="gi-fieldLabel">Fecha compra</span><span className="gi-fieldValue">{selectedItem.data.fechaCompra ? fmtDate(selectedItem.data.fechaCompra) : "—"}</span></div>
                        <div className="gi-field"><span className="gi-fieldLabel">Precintado</span><span className="gi-fieldValue">{selectedItem.data.precintado ? "Sí" : "No"}</span></div>
                      </div>
                    </div>
                  ) : (
                    /* Detalle de un playthrough */
                    <div className="rp-detail">
                      <div className="rp-detailHeader">
                        <span className="rp-sectionTitle">Detalle de playthrough</span>
                        <button className="rp-detailClose" onClick={() => setSelectedItem(null)}>← Volver</button>
                      </div>
                      <div className="rp-detailGrid">
                        <div className="gi-field"><span className="gi-fieldLabel">Estado</span><span className="gi-fieldValue">{selectedItem.data.avance?.replace(/_/g, " ") ?? "—"}</span></div>
                        <div className="gi-field"><span className="gi-fieldLabel">Año jugado</span><span className="gi-fieldValue">{selectedItem.data.anyoJugado ?? "—"}</span></div>
                        <div className="gi-field"><span className="gi-fieldLabel">Horas jugadas</span><span className="gi-fieldValue">{selectedItem.data.horasJugadas != null ? `${selectedItem.data.horasJugadas}h` : "—"}</span></div>
                        <div className="gi-field"><span className="gi-fieldLabel">Nota</span><span className="gi-fieldValue">{selectedItem.data.nota != null ? `${selectedItem.data.nota} / 10` : "—"}</span></div>
                        <div className="gi-field"><span className="gi-fieldLabel">100% completado</span><span className="gi-fieldValue">{selectedItem.data.completadoCien ? "Sí" : "No"}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* X CERRAR */}
          <div
            className="cross"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            title="Cerrar"
          >
            <FontAwesomeIcon icon={faXmark} />
          </div>
        </div>
      </div>
    </div>
  );
};

function mergeGame(game, detail) {
  if (!game) return null;
  return {
    ...game,
    ...(detail || {}),
    soporte: detail?.soporte ?? game.soporte ?? [],
    progreso: detail?.progreso ?? game.progreso ?? [],
  };
}

function labelPlataforma(platform) {
  switch (platform) {
    case "ps": return "PlayStation";
    case "xbox": return "Xbox";
    case "pc": return "PC";
    case "ds": return "Nintendo DS";
    case "gamecube": return "GameCube";
    case "wii": return "Wii";
    case "wiiu": return "Wii U";
    default: return "Nintendo";
  }
}

/** Etiqueta legible a partir del enum raw del backend */
function rawPlatformLabel(raw) {
  if (!raw) return "—";
  return String(raw).replace(/_/g, " ");
}

function fmtYear(dateLike) {
  if (!dateLike) return "—";
  const s = String(dateLike);
  // soporta "YYYY-MM-DD" y Date
  const y = s.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : "—";
}

function fmtDate(dateLike) {
  if (!dateLike) return "—";
  const s = String(dateLike);
  // formato dd-mm-yyyy
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


export default Game;