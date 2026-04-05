import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal, Form, Select, DatePicker, InputNumber, AutoComplete,
  Tag, Typography, message,
} from "antd";
import { LinkOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { createGame, editGame, linkIgdbGame, searchIgdbGames } from "../../api/gamesApi";
import "./GameFormModal.css";

const { Text } = Typography;

// ---------- ENUMS ----------

const PLATAFORMAS = [
  "NES", "Sega_Master_System", "Game_Boy", "Game_Boy_Color", "Sega_Genesis",
  "Super_Nintendo", "Game_Gear", "Sega_CD", "Sega_32X", "Neo_Geo",
  "Atari_Lynx", "PC_Engine", "TurboGrafx_16", "Atari_Jaguar", "Panasonic_3DO",
  "Virtual_Boy", "PSX", "Sega_Saturn", "Nintendo_64",
  "Neo_Geo_Pocket", "Neo_Geo_Pocket_Color", "WonderSwan", "WonderSwan_Color",
  "Sega_Dreamcast", "PS2", "Xbox", "GameCube", "Game_Boy_Advance",
  "Nintendo_DS", "PSP", "Xbox_360", "PS3", "Wii", "PSVita", "Nintendo_3DS",
  "Wii_U", "PS4", "Xbox_One", "Nintendo_Switch", "PS5", "Xbox_Series_X", "Xbox_Series_S", "PC",
];

const GENEROS = [
  "Accion", "Aventuras", "Accion_Aventura", "Hack_and_Slash", "Survival_Horror",
  "Plataformas_2D", "Plataformas_3D",
  "RPG", "JRPG", "Action_RPG", "Tactical_RPG", "MMORPG",
  "FPS", "TPS", "Shoot_em_up",
  "Estrategia", "Estrategia_Tiempo_Real", "Tower_Defense",
  "Deportes", "Carreras", "Lucha",
  "Simulacion", "Gestion", "Sandbox",
  "Puzzle", "Ritmo_Musical",
  "Visual_Novel", "Metroidvania", "Roguelike", "Roguelite", "Souls_like",
  "Battle_Royale", "Party", "Educativo", "Otro",
];

function humanize(str) {
  return str.replace(/_/g, " ");
}

// ---------- IGDB → local enum mapping ----------

/**
 * Maps IGDB platform names to our local Plataforma enum values.
 * IGDB uses its own naming; we map the most common ones.
 */
const IGDB_PLATFORM_MAP = {
  "Nintendo Entertainment System": "NES",
  "NES": "NES",
  "Family Computer": "NES",
  "Sega Master System": "Sega_Master_System",
  "Sega Master System/Mark III": "Sega_Master_System",
  "Game Boy": "Game_Boy",
  "Game Boy Color": "Game_Boy_Color",
  "Sega Mega Drive/Genesis": "Sega_Genesis",
  "Sega Genesis": "Sega_Genesis",
  "Super Nintendo Entertainment System": "Super_Nintendo",
  "Super Famicom": "Super_Nintendo",
  "Game Gear": "Game_Gear",
  "Sega Game Gear": "Game_Gear",
  "Sega CD": "Sega_CD",
  "Sega 32X": "Sega_32X",
  "Neo Geo AES": "Neo_Geo",
  "Neo Geo MVS": "Neo_Geo",
  "Neo-Geo": "Neo_Geo",
  "Atari Lynx": "Atari_Lynx",
  "PC Engine": "PC_Engine",
  "PC Engine SuperGrafx": "PC_Engine",
  "TurboGrafx-16/PC Engine": "TurboGrafx_16",
  "TurboGrafx-16": "TurboGrafx_16",
  "Atari Jaguar": "Atari_Jaguar",
  "3DO Interactive Multiplayer": "Panasonic_3DO",
  "Virtual Boy": "Virtual_Boy",
  "PlayStation": "PSX",
  "Sega Saturn": "Sega_Saturn",
  "Nintendo 64": "Nintendo_64",
  "Neo Geo Pocket": "Neo_Geo_Pocket",
  "Neo Geo Pocket Color": "Neo_Geo_Pocket_Color",
  "WonderSwan": "WonderSwan",
  "WonderSwan Color": "WonderSwan_Color",
  "Dreamcast": "Sega_Dreamcast",
  "PlayStation 2": "PS2",
  "Xbox": "Xbox",
  "Nintendo GameCube": "GameCube",
  "Game Boy Advance": "Game_Boy_Advance",
  "Nintendo DS": "Nintendo_DS",
  "PlayStation Portable": "PSP",
  "Xbox 360": "Xbox_360",
  "PlayStation 3": "PS3",
  "Wii": "Wii",
  "PlayStation Vita": "PSVita",
  "Nintendo 3DS": "Nintendo_3DS",
  "Wii U": "Wii_U",
  "PlayStation 4": "PS4",
  "Xbox One": "Xbox_One",
  "Nintendo Switch": "Nintendo_Switch",
  "PlayStation 5": "PS5",
  "Xbox Series X|S": "Xbox_Series_X",
  "Xbox Series X": "Xbox_Series_X",
  "Xbox Series S": "Xbox_Series_S",
  "PC (Microsoft Windows)": "PC",
  "PC Windows": "PC",
  "Mac": "PC",
  "Linux": "PC",
  "DOS": "PC",
  "PC DOS": "PC",
};

/**
 * Maps IGDB genre names to our local Genero enum values.
 */
const IGDB_GENRE_MAP = {
  "Hack and Slash/Beat 'em up": "Hack_and_Slash",
  "Hack and Slash": "Hack_and_Slash",
  "Adventure": "Aventuras",
  "Role-playing (RPG)": "RPG",
  "Platform": "Plataformas_2D",
  "Shooter": "FPS",
  "Fighting": "Lucha",
  "Racing": "Carreras",
  "Sport": "Deportes",
  "Puzzle": "Puzzle",
  "Strategy": "Estrategia",
  "Simulator": "Simulacion",
  "Tactical": "Tactical_RPG",
  "Music": "Ritmo_Musical",
  "Visual Novel": "Visual_Novel",
  "Indie": null, // no direct mapping
  "Arcade": "Accion",
  "Real Time Strategy (RTS)": "Estrategia_Tiempo_Real",
  "Turn-based strategy (TBS)": "Estrategia",
  "Point-and-click": "Aventuras",
  "Card & Board Game": null,
  "MOBA": null,
  "Quiz/Trivia": null,
  "Pinball": null,
};

/**
 * Given IGDB platforms array, find the first that maps to a local enum.
 */
function mapIgdbPlatform(igdbPlatforms) {
  if (!igdbPlatforms?.length) return null;
  for (const p of igdbPlatforms) {
    const mapped = IGDB_PLATFORM_MAP[p.name];
    if (mapped) return mapped;
  }
  return null;
}

/**
 * Given IGDB genres array, return all matching local enum values.
 */
function mapIgdbGenres(igdbGenres) {
  if (!igdbGenres?.length) return [];
  const mapped = [];
  for (const g of igdbGenres) {
    const local = IGDB_GENRE_MAP[g.name];
    if (local && !mapped.includes(local)) mapped.push(local);
  }
  return mapped;
}

function igdbThumbUrl(imageId) {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_cover_small/${imageId}.jpg`;
}

/**
 * Modal para crear/editar videojuego con autocompletado IGDB.
 *
 * Al escribir el nombre del juego, busca en IGDB tras un breve debounce
 * y muestra sugerencias con el nombre oficial y miniatura de portada.
 * Seleccionar una sugerencia rellena el nombre correcto y vincula con IGDB.
 */
export default function GameFormModal({ open, onClose, onSuccess, game }) {
  const [form] = Form.useForm();
  const isEdit = !!game;

  // IGDB autocomplete
  const [igdbSelected, setIgdbSelected] = useState(null);
  const [igdbOptions, setIgdbOptions] = useState([]);
  const [igdbLoading, setIgdbLoading] = useState(false);
  const igdbCacheRef = useRef({}); // cache por query para no repetir peticiones
  const debounceRef = useRef(null);

  // Reset al abrir
  useEffect(() => {
    if (!open) return;
    igdbCacheRef.current = {};
    if (game) {
      form.setFieldsValue({
        nombre: game.nombre,
        plataforma: game.plataforma,
        generos: game.generos || [],
        precio: game.precio,
        fechaLanzamiento: game.fechaLanzamiento ? dayjs(game.fechaLanzamiento) : null,
        fechaCompra: game.fechaCompra ? dayjs(game.fechaCompra) : null,
      });
      if (game.igdbGameId) {
        setIgdbSelected({ id: game.igdbGameId, name: game.igdbName || game.nombre });
      } else {
        setIgdbSelected(null);
      }
    } else {
      form.resetFields();
      setIgdbSelected(null);
    }
    setIgdbOptions([]);
  }, [open, game, form]);

  // Debounced IGDB search as user types
  const searchIgdb = useCallback(async (query) => {
    const q = query.trim();
    if (q.length < 3) {
      setIgdbOptions([]);
      return;
    }

    // Check cache
    if (igdbCacheRef.current[q]) {
      setIgdbOptions(buildOptions(igdbCacheRef.current[q]));
      return;
    }

    setIgdbLoading(true);
    try {
      const data = await searchIgdbGames(q, 6);
      const results = Array.isArray(data) ? data : [];
      igdbCacheRef.current[q] = results;
      setIgdbOptions(buildOptions(results));
    } catch {
      // Silently fail — user can still type manually
      setIgdbOptions([]);
    } finally {
      setIgdbLoading(false);
    }
  }, []);

  const handleNameSearch = (text) => {
    // Si seleccionamos algo de IGDB y luego editamos el texto, desvincular
    if (igdbSelected) setIgdbSelected(null);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchIgdb(text), 350);
  };

  const handleNameSelect = (value, option) => {
    // option.igdbItem tiene el objeto IGDB completo
    const item = option.igdbItem;
    if (!item) return;

    // Rellenar nombre oficial
    const updates = { nombre: item.name };

    // Auto-rellenar plataforma
    const mappedPlat = mapIgdbPlatform(item.platforms);
    if (mappedPlat) updates.plataforma = mappedPlat;

    // Auto-rellenar géneros
    const mappedGenres = mapIgdbGenres(item.genres);
    if (mappedGenres.length) updates.generos = mappedGenres;

    // Auto-rellenar fecha de lanzamiento
    if (item.first_release_date) {
      updates.fechaLanzamiento = dayjs.unix(item.first_release_date);
    }

    form.setFieldsValue(updates);
    setIgdbSelected(item);
    setIgdbOptions([]);
  };

  const clearIgdbLink = () => {
    setIgdbSelected(null);
  };

  // Build Ant Design AutoComplete options from IGDB results
  function buildOptions(results) {
    if (!results || results.length === 0) return [];
    return results.map((item) => {
      const thumb = igdbThumbUrl(item?.cover?.image_id);
      const year = item?.first_release_date
        ? new Date(item.first_release_date * 1000).getFullYear()
        : null;

      return {
        value: item.name,
        key: item.id,
        igdbItem: item,
        label: (
          <div className="gfm-ac-option">
            {thumb ? (
              <img src={thumb} alt="" className="gfm-ac-thumb" />
            ) : (
              <div className="gfm-ac-thumb-empty">?</div>
            )}
            <div className="gfm-ac-info">
              <span className="gfm-ac-name">{item.name}</span>
              <span className="gfm-ac-year">
                {[
                  year,
                  item.platforms?.slice(0, 3).map((p) => p.name).join(", "),
                ].filter(Boolean).join(" · ")}
              </span>
            </div>
            <Tag color="blue" style={{ marginLeft: "auto", fontSize: 11 }}>IGDB</Tag>
          </div>
        ),
      };
    });
  }

  // --- Save ---
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        nombre: values.nombre.trim(),
        plataforma: values.plataforma,
        generos: values.generos,
        precio: values.precio ?? null,
        fechaLanzamiento: values.fechaLanzamiento
          ? values.fechaLanzamiento.format("YYYY-MM-DD")
          : null,
        fechaCompra: values.fechaCompra
          ? values.fechaCompra.format("YYYY-MM-DD")
          : null,
      };

      let savedGame;
      if (isEdit) {
        savedGame = await editGame(game.id, { ...payload, id: game.id });
        message.success("Juego actualizado");
      } else {
        savedGame = await createGame(payload);
        message.success("Juego creado");
      }

      // Vincular con IGDB si se selecciono uno
      const gameId = savedGame?.id ?? game?.id;
      if (igdbSelected && gameId) {
        const existingIgdbId = game?.igdbGameId;
        if (String(igdbSelected.id) !== String(existingIgdbId)) {
          try {
            await linkIgdbGame(gameId, igdbSelected.id);
            message.success("Vinculado con IGDB");
          } catch {
            message.warning("Juego guardado, pero fallo la vinculacion IGDB");
          }
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      if (err?.errorFields) return;
      const msg = err?.response?.data?.message || "Error al guardar el juego";
      message.error(msg);
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar videojuego" : "Nuevo videojuego"}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEdit ? "Guardar cambios" : "Crear juego"}
      cancelText="Cancelar"
      destroyOnClose
      width={560}
      className="game-form-modal"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        autoComplete="off"
      >
        {/* --- Nombre con autocompletado IGDB --- */}
        <Form.Item
          name="nombre"
          label="Nombre del juego"
          rules={[
            { required: true, message: "El nombre es obligatorio" },
            { max: 255, message: "Maximo 255 caracteres" },
          ]}
          extra={
            igdbSelected ? (
              <div className="gfm-igdb-badge">
                <LinkOutlined />
                <Text type="success" style={{ fontSize: 12 }}>
                  Vinculado con IGDB: {igdbSelected.name}
                </Text>
                <CloseCircleOutlined
                  className="gfm-igdb-badge-remove"
                  onClick={clearIgdbLink}
                />
              </div>
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Escribe para buscar en IGDB y auto-rellenar nombre, plataforma, genero y fecha
              </Text>
            )
          }
        >
          <AutoComplete
            options={igdbOptions}
            onSearch={handleNameSearch}
            onSelect={handleNameSelect}
            placeholder="Ej: Zelda Breath..."
            notFoundContent={igdbLoading ? "Buscando en IGDB..." : null}
            popupClassName="gfm-ac-dropdown"
          />
        </Form.Item>

        {/* --- Plataforma & Genero --- */}
        <div className="gfm-row">
          <Form.Item
            name="plataforma"
            label="Plataforma"
            rules={[{ required: true, message: "Selecciona una plataforma" }]}
            className="gfm-half"
          >
            <Select
              placeholder="Seleccionar..."
              showSearch
              optionFilterProp="label"
              options={PLATAFORMAS.map((p) => ({
                value: p,
                label: humanize(p),
              }))}
            />
          </Form.Item>

          <Form.Item
            name="generos"
            label="Genero(s)"
            rules={[{ required: true, message: "Selecciona al menos un genero" }]}
            className="gfm-half"
          >
            <Select
              mode="multiple"
              placeholder="Seleccionar..."
              showSearch
              optionFilterProp="label"
              options={GENEROS.map((g) => ({
                value: g,
                label: humanize(g),
              }))}
            />
          </Form.Item>
        </div>

        {/* --- Precio --- */}
        <Form.Item name="precio" label="Precio de compra">
          <InputNumber
            min={0.01}
            step={0.01}
            precision={2}
            addonAfter="€"
            placeholder="Opcional"
            style={{ width: "100%" }}
          />
        </Form.Item>

        {/* --- Fechas --- */}
        <div className="gfm-row">
          <Form.Item
            name="fechaLanzamiento"
            label="Fecha de lanzamiento"
            className="gfm-half"
          >
            <DatePicker
              placeholder="Opcional"
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            name="fechaCompra"
            label="Fecha de compra"
            className="gfm-half"
          >
            <DatePicker
              placeholder="Opcional"
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
            />
          </Form.Item>
        </div>
      </Form>

      <Text type="secondary" style={{ fontSize: 11 }}>
        Nombres sugeridos por{" "}
        <a href="https://www.igdb.com/" target="_blank" rel="noreferrer">IGDB.com</a>
      </Text>
    </Modal>
  );
}
