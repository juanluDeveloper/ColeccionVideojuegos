import React, { useEffect, useRef, useState } from "react";
import "./Game.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logoSwitch from "../../assets/images/logo-switch.png";
import logoDS from "../../assets/images/logo-ds.png";
import logo from "../../assets/images/logo192.png";
import GameInfo from "../GameInfo/GameInfo.jsx";
import { getSoportes, getProgresos, getGameDetail } from "../../api/gamesApi";
import { Spin, Alert } from "antd";
import CoverArt from "../CoverArt/CoverArt";
import { faPlaystation, faXbox, faSteam } from "@fortawesome/free-brands-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useAuthedImageBlob } from "../../hooks/useAuthedImageBlob";

const Game = ({ platform, title, gameId, game, isOpen, onOpen, onClose }) => {
  const spineRef = useRef(null); // medimos desde el lomo (como tu código original)

  const [isAnimating, setIsAnimating] = useState(false); // controla CSS .animated
  const [isHover, setIsHover] = useState(false);
  const [position, setPosition] = useState({});
  const [positionIni, setPositionIni] = useState(null); // DOMRect del lomo en estantería
  const [isFlipped, setIsFlipped] = useState(false);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

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

  const renderPlatformIcon = (platform) => {
    switch (platform) {
      case "ps":
        return (
          <div className={`front ps ${isAnimating ? "animated" : ""}`}>
            <div className="platform ps">
              <div className="icon ps">
                  <FontAwesomeIcon icon={faPlaystation} size="xl" style={{ color: "#ffffff" }} />
              </div>
              <div> PS</div>
            </div>
            <div className="title ps">{title}</div>
          </div>
        );
      case "xbox":
        return (
          <div className={`front xbox ${isAnimating ? "animated" : ""}`}>
            <div className="platform xbox">
              <div className="icon xbox">
                <FontAwesomeIcon icon={faXbox} style={{ color: "#ffffff" }} />
              </div>
              <div> XBOX</div>
            </div>
            <div className="title xbox">{title}</div>
          </div>
        );
      case "pc":
        return (
          <div className={`front pc ${isAnimating ? "animated" : ""}`}>
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
      default:
        return (
          <div className={`front switch ${isAnimating ? "animated" : ""}`}>
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
    return <img src={logoSwitch} alt="Disk" className="diskImg" />;
  };



  return (
    <div className="game-container">
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
        <div className={`left ${platform} ${isAnimating ? "animated" : ""}`}>
          <div className="card-container" onClick={handleCardClick}>
            <div className="book" onClick={handleCardClick}>
              {/* PORTADA CERRADA */}
              <div className={`page frontCard ${isFlipped ? "flipped" : ""}`}>
                <div className={`coverClosed cover-${platform}`}>
                  <div className="coverTop">
                    <span className="coverPill">{labelPlataforma(platform)}</span>
                    <span className="coverPill coverPillMuted">{game?.genero ?? "—"}</span>
                  </div>

                  <div className="coverCenter">
                  <div className={`coverSlot ${platform}`}>
                    <CoverArt
                      title={merged?.nombre ?? title}
                      platform={platform}
                      coverUrl={merged?.coverUrl} // Usamos URL de portada si está disponible
                    />
                  </div>
                    <h2 className="coverTitle">{merged?.nombre ?? title}</h2>
                  </div>

                  <div className="coverBottom">
                    <div className="coverMeta">
                      <span className="coverMetaLabel">Lanz.</span>
                      <span className="coverMetaValue">{fmtYear(merged?.fechaLanzamiento)}</span>
                    </div>
                    <div className="coverMeta">
                      <span className="coverMetaLabel">Compra</span>
                      <span className="coverMetaValue">{fmtDate(merged?.fechaCompra)}</span>
                    </div>
                  </div>

                  <div className="coverShine" />
                </div>
              </div>

              {/* PÁGINA IZQUIERDA (INFO) */}
              <div className={`page middleCard ${isFlipped ? "flipped" : ""}`}>
                <div className="pageContent">
                  {detailLoading && <Spin />}
                  {detailError && <Alert type="error" message={detailError} />}
                  {!detailLoading && !detailError && (
                    <GameInfo
                      game={merged}
                      onIgdbLinked={() => {
                        const resolvedGameId = gameId ?? game?.id;
                        if (resolvedGameId) reloadDetail(resolvedGameId);
                      }}
                    />
                  )}
                </div>
              </div>

              {/* PÁGINA DERECHA (CONTRAPORTADA + DISCO) */}
              <div className="page backCard">
                <div
                  className="rightPage"
                  style={
                    artworkBlob
                      ? {
                          backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(${artworkBlob})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  <div className="rightTop">
                    <div className="rightTitle">Acciones</div>
                    <div className="rightHint">Próximamente</div>
                  </div>

                  <div className="rightActions">
                    <button className="rightBtn" disabled>Editar juego</button>
                    <button className="rightBtn" disabled>Añadir progreso</button>
                    <button className="rightBtn" disabled>Añadir soporte</button>
                  </div>

                  {/* Disco decorativo pequeñín abajo derecha */}
                  <div className="diskSmall">
                    <div className="diskInner">
                      {renderDisk()}
                    </div>
                    <div className="circle"></div>
                  </div>
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
    default: return "Switch";
  }
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
  // si viene "YYYY-MM-DD" lo dejamos así por ahora
  return s;
}


export default Game;