import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Input, Select, Spin } from "antd";
import { AiOutlineSearch } from "react-icons/ai";
import Game from "../components/Game/Game";
import GameFormModal from "../components/GameFormModal/GameFormModal";
import { deleteGame, getGameDetail, getMyGames } from "../api/gamesApi";
import { getSpineDesign } from "../config/spineDesigns";
import { mapPlataformaToFamily } from "../utils/platformUtils";
import { getAppSettings } from "../utils/appSettings";
import "./../styles/library.css";

function humanize(value) {
  if (!value) return "-";
  if (value === "SinFin") return "Sin fin";
  return String(value).replace(/_/g, " ");
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getYear(dateLike) {
  if (!dateLike) return null;
  const match = String(dateLike).match(/^(\d{4})/);
  return match ? match[1] : null;
}

function toOptions(values) {
  return values.map((value) => ({
    value,
    label: humanize(value),
  }));
}

export default function Library() {
  const [games, setGames] = useState([]);
  const [openGameId, setOpenGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [filtersCollapsed, setFiltersCollapsed] = useState(
    () => getAppSettings().libraryFiltersCollapsedByDefault
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilters, setPlatformFilters] = useState([]);
  const [genreFilters, setGenreFilters] = useState([]);
  const [releaseYearFilters, setReleaseYearFilters] = useState([]);
  const [supportTypeFilters, setSupportTypeFilters] = useState([]);
  const [supportStateFilters, setSupportStateFilters] = useState([]);
  const [supportRegionFilters, setSupportRegionFilters] = useState([]);
  const [supportSealedFilter, setSupportSealedFilter] = useState("ALL");
  const [progressStatusFilters, setProgressStatusFilters] = useState([]);
  const [progressYearFilters, setProgressYearFilters] = useState([]);
  const [completionFilter, setCompletionFilter] = useState("ALL");

  const shelfRef = useRef(null);
  const libreriaRef = useRef(null);
  const [shelfBoards, setShelfBoards] = useState([]);
  const resizeTimerRef = useRef(null);

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyGames();
      const baseList = Array.isArray(data) ? data : [];

      const enriched = await Promise.all(
        baseList.map(async (g) => {
          try {
            const dto = await getGameDetail(g.id);
            return { ...g, ...(dto || {}) };
          } catch {
            return { ...g, soporte: g.soporte ?? [], progreso: g.progreso ?? [] };
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

  const platformOptions = useMemo(() => {
    const values = Array.from(new Set(games.map((g) => g.plataforma).filter(Boolean)));
    return toOptions(values.sort((a, b) => humanize(a).localeCompare(humanize(b))));
  }, [games]);

  const genreOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        games.flatMap((g) => (Array.isArray(g.generos) ? g.generos : [])).filter(Boolean)
      )
    );
    return toOptions(values.sort((a, b) => humanize(a).localeCompare(humanize(b))));
  }, [games]);

  const releaseYearOptions = useMemo(() => {
    const values = Array.from(new Set(games.map((g) => getYear(g.fechaLanzamiento)).filter(Boolean)));
    return values
      .sort((a, b) => Number(b) - Number(a))
      .map((value) => ({ value, label: value }));
  }, [games]);

  const supportTypeOptions = useMemo(() => {
    const values = Array.from(
      new Set(games.flatMap((g) => (Array.isArray(g.soporte) ? g.soporte.map((s) => s?.tipo) : [])).filter(Boolean))
    );
    return toOptions(values.sort((a, b) => humanize(a).localeCompare(humanize(b))));
  }, [games]);

  const supportStateOptions = useMemo(() => {
    const values = Array.from(
      new Set(games.flatMap((g) => (Array.isArray(g.soporte) ? g.soporte.map((s) => s?.estado) : [])).filter(Boolean))
    );
    return toOptions(values.sort((a, b) => humanize(a).localeCompare(humanize(b))));
  }, [games]);

  const supportRegionOptions = useMemo(() => {
    const values = Array.from(
      new Set(games.flatMap((g) => (Array.isArray(g.soporte) ? g.soporte.map((s) => s?.region) : [])).filter(Boolean))
    );
    return toOptions(values.sort((a, b) => humanize(a).localeCompare(humanize(b))));
  }, [games]);

  const progressStatusOptions = useMemo(() => {
    const values = Array.from(
      new Set(games.flatMap((g) => (Array.isArray(g.progreso) ? g.progreso.map((p) => p?.avance) : [])).filter(Boolean))
    );
    return toOptions(values.sort((a, b) => humanize(a).localeCompare(humanize(b))));
  }, [games]);

  const progressYearOptions = useMemo(() => {
    const values = Array.from(
      new Set(games.flatMap((g) => (Array.isArray(g.progreso) ? g.progreso.map((p) => p?.anyoJugado) : [])).filter(Boolean))
    );
    return values
      .sort((a, b) => Number(b) - Number(a))
      .map((value) => ({ value, label: String(value) }));
  }, [games]);

  const filteredGames = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery.trim());
    const hasSupportFilters =
      supportTypeFilters.length > 0 ||
      supportStateFilters.length > 0 ||
      supportRegionFilters.length > 0 ||
      supportSealedFilter !== "ALL";
    const hasProgressFilters =
      progressStatusFilters.length > 0 ||
      progressYearFilters.length > 0 ||
      completionFilter !== "ALL";

    return games.filter((game) => {
      const displayName = game.igdbName || game.nombre || "";
      const genres = Array.isArray(game.generos) ? game.generos : [];
      const copies = Array.isArray(game.soporte) ? game.soporte : [];
      const playthroughs = Array.isArray(game.progreso) ? game.progreso : [];
      const releaseYear = getYear(game.fechaLanzamiento);

      const matchesSearch =
        !normalizedQuery ||
        normalizeText(displayName).includes(normalizedQuery) ||
        normalizeText(game.plataforma).includes(normalizedQuery) ||
        genres.some((genre) => normalizeText(genre).includes(normalizedQuery));

      const matchesPlatform =
        platformFilters.length === 0 || platformFilters.includes(game.plataforma);

      const matchesGenres =
        genreFilters.length === 0 || genreFilters.some((genre) => genres.includes(genre));

      const matchesReleaseYear =
        releaseYearFilters.length === 0 || (releaseYear && releaseYearFilters.includes(releaseYear));

      const matchesCopies =
        !hasSupportFilters ||
        copies.some((copy) => {
          const matchesType =
            supportTypeFilters.length === 0 || supportTypeFilters.includes(copy?.tipo);
          const matchesState =
            supportStateFilters.length === 0 || supportStateFilters.includes(copy?.estado);
          const matchesRegion =
            supportRegionFilters.length === 0 || supportRegionFilters.includes(copy?.region);
          const matchesSealed =
            supportSealedFilter === "ALL" ||
            (supportSealedFilter === "YES" && !!copy?.precintado) ||
            (supportSealedFilter === "NO" && !copy?.precintado);
          return matchesType && matchesState && matchesRegion && matchesSealed;
        });

      const matchesPlaythroughs =
        !hasProgressFilters ||
        playthroughs.some((play) => {
          const matchesStatus =
            progressStatusFilters.length === 0 || progressStatusFilters.includes(play?.avance);
          const matchesYear =
            progressYearFilters.length === 0 ||
            (play?.anyoJugado != null && progressYearFilters.includes(play.anyoJugado));
          const matchesCompletion =
            completionFilter === "ALL" ||
            (completionFilter === "YES" && !!play?.completadoCien) ||
            (completionFilter === "NO" && !play?.completadoCien);
          return matchesStatus && matchesYear && matchesCompletion;
        });

      return (
        matchesSearch &&
        matchesPlatform &&
        matchesGenres &&
        matchesReleaseYear &&
        matchesCopies &&
        matchesPlaythroughs
      );
    });
  }, [
    games,
    searchQuery,
    platformFilters,
    genreFilters,
    releaseYearFilters,
    supportTypeFilters,
    supportStateFilters,
    supportRegionFilters,
    supportSealedFilter,
    progressStatusFilters,
    progressYearFilters,
    completionFilter,
  ]);

  const activeFilterCount = [
    searchQuery.trim() ? 1 : 0,
    platformFilters.length,
    genreFilters.length,
    releaseYearFilters.length,
    supportTypeFilters.length,
    supportStateFilters.length,
    supportRegionFilters.length,
    supportSealedFilter !== "ALL" ? 1 : 0,
    progressStatusFilters.length,
    progressYearFilters.length,
    completionFilter !== "ALL" ? 1 : 0,
  ].reduce((sum, value) => sum + value, 0);

  const clearFilters = () => {
    setSearchQuery("");
    setPlatformFilters([]);
    setGenreFilters([]);
    setReleaseYearFilters([]);
    setSupportTypeFilters([]);
    setSupportStateFilters([]);
    setSupportRegionFilters([]);
    setSupportSealedFilter("ALL");
    setProgressStatusFilters([]);
    setProgressYearFilters([]);
    setCompletionFilter("ALL");
  };

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

  useLayoutEffect(() => {
    computeBoards();

    const handleResize = () => {
      if (shelfRef.current) {
        shelfRef.current.querySelectorAll(".shelf-board").forEach((board) => {
          board.style.display = "none";
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
  }, [filteredGames, computeBoards]);

  useEffect(() => {
    const timer = setTimeout(computeBoards, 50);
    return () => clearTimeout(timer);
  }, [filteredGames, openGameId, computeBoards]);

  if (loading) return <div style={{ padding: 20 }}><Spin /></div>;
  if (error) return <div style={{ padding: 20 }}><Alert type="error" message={error} /></div>;

  return (
    <div className="library-page">
      <div className={`library-filters-shell${filtersCollapsed ? " is-collapsed" : ""}`}>
        <div className="library-filters-top">
          <div className="library-filters-copy">
            <span className="library-filters-kicker">Biblioteca</span>
            <h1 className="library-filters-title">Explora tu colección</h1>
            <p className="library-filters-subtitle">
              {filtersCollapsed
                ? `${filteredGames.length} juegos visibles${activeFilterCount > 0 ? ` y ${activeFilterCount} filtros activos` : ""}.`
                : "Busca por título, plataforma, estado de copia o avance sin perder la sensación de estar navegando tu propia estantería."}
            </p>
          </div>

          <div className="library-filters-actions">
            <span className="library-filters-actions-note">{filtersCollapsed ? "Vista compacta" : "Acceso rápido"}</span>
            <div className="library-filters-actions-row">
              <Button
                size="large"
                onClick={() => setFiltersCollapsed((prev) => !prev)}
              >
                {filtersCollapsed ? "Mostrar filtros" : "Minimizar filtros"}
              </Button>
              <Button type="primary" size="large" onClick={() => { setEditingGame(null); setFormOpen(true); }}>
                Nuevo videojuego
              </Button>
            </div>
          </div>
        </div>

        <div className="library-filters-panel">
          <div className="library-filter-groups">
            <section className="library-filter-group library-filter-group--wide library-filter-group--games">
              <div className="library-filter-group-head">
                <span className="library-filter-group-title">Juegos</span>
                <span className="library-filter-group-note">Búsqueda principal y clasificación base</span>
              </div>
              <div className="library-filter-fields">
                <div className="library-field library-field--search">
                  <label className="library-field-label">Buscar</label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Título, plataforma o género"
                    prefix={<AiOutlineSearch />}
                    allowClear
                    size="large"
                  />
                </div>

                <div className="library-field">
                  <label className="library-field-label">Plataformas</label>
                  <Select
                    mode="multiple"
                    value={platformFilters}
                    onChange={setPlatformFilters}
                    options={platformOptions}
                    placeholder="Todas"
                    optionFilterProp="label"
                    allowClear
                    size="large"
                  />
                </div>

                <div className="library-field">
                  <label className="library-field-label">Géneros</label>
                  <Select
                    mode="multiple"
                    value={genreFilters}
                    onChange={setGenreFilters}
                    options={genreOptions}
                    placeholder="Todos"
                    optionFilterProp="label"
                    allowClear
                    size="large"
                  />
                </div>

                <div className="library-field">
                  <label className="library-field-label">Año de lanzamiento</label>
                  <Select
                    mode="multiple"
                    value={releaseYearFilters}
                    onChange={setReleaseYearFilters}
                    options={releaseYearOptions}
                    placeholder="Cualquiera"
                    optionFilterProp="label"
                    allowClear
                    size="large"
                  />
                </div>
              </div>
            </section>

            <section className="library-filter-group library-filter-group--copies">
              <div className="library-filter-group-head">
                <span className="library-filter-group-title">Copias</span>
                <span className="library-filter-group-note">Filtra por estado físico o procedencia</span>
              </div>
              <div className="library-filter-fields">
                <div className="library-field">
                  <label className="library-field-label">Tipo</label>
                  <Select
                    mode="multiple"
                    value={supportTypeFilters}
                    onChange={setSupportTypeFilters}
                    options={supportTypeOptions}
                    placeholder="Cualquiera"
                    optionFilterProp="label"
                    allowClear
                  />
                </div>

                <div className="library-field">
                  <label className="library-field-label">Estado</label>
                  <Select
                    mode="multiple"
                    value={supportStateFilters}
                    onChange={setSupportStateFilters}
                    options={supportStateOptions}
                    placeholder="Cualquiera"
                    optionFilterProp="label"
                    allowClear
                  />
                </div>

                <div className="library-field">
                  <label className="library-field-label">Region</label>
                  <Select
                    mode="multiple"
                    value={supportRegionFilters}
                    onChange={setSupportRegionFilters}
                    options={supportRegionOptions}
                    placeholder="Cualquiera"
                    optionFilterProp="label"
                    allowClear
                  />
                </div>

                <div className="library-field">
                  <label className="library-field-label">Precintado</label>
                  <Select
                    value={supportSealedFilter}
                    onChange={setSupportSealedFilter}
                    options={[
                      { value: "ALL", label: "Todos" },
                      { value: "YES", label: "Solo precintados" },
                      { value: "NO", label: "Solo abiertos" },
                    ]}
                  />
                </div>
              </div>
            </section>

            <section className="library-filter-group library-filter-group--progress">
              <div className="library-filter-group-head">
                <span className="library-filter-group-title">Playthroughs</span>
                <span className="library-filter-group-note">Avance, campañas y progresos de tus juegos</span>
              </div>
              <div className="library-filter-fields">
                <div className="library-field">
                  <label className="library-field-label">Estado</label>
                  <Select
                    mode="multiple"
                    value={progressStatusFilters}
                    onChange={setProgressStatusFilters}
                    options={progressStatusOptions}
                    placeholder="Cualquiera"
                    optionFilterProp="label"
                    allowClear
                  />
                </div>

                <div className="library-field">
                  <label className="library-field-label">Año jugado</label>
                  <Select
                    mode="multiple"
                    value={progressYearFilters}
                    onChange={setProgressYearFilters}
                    options={progressYearOptions}
                    placeholder="Cualquiera"
                    optionFilterProp="label"
                    allowClear
                  />
                </div>

                <div className="library-field">
                  <label className="library-field-label">100% completado</label>
                  <Select
                    value={completionFilter}
                    onChange={setCompletionFilter}
                    options={[
                      { value: "ALL", label: "Todos" },
                      { value: "YES", label: "Solo 100%" },
                      { value: "NO", label: "Sin 100%" },
                    ]}
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="library-filter-footer">
            <div className="library-filter-results">
              <span className="library-filter-results-strong">{filteredGames.length}</span>
              <span>de {games.length} juegos visibles</span>
              <span className="library-filter-separator">/</span>
              <span>{activeFilterCount} filtros activos</span>
            </div>

            <Button
              size="large"
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </div>

      {games.length === 0 ? (
        <div style={{ padding: 24 }}>
          <h3>No tienes videojuegos todavia</h3>
          <p>Crea tu primer juego para que la libreria muestre caratulas.</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="library-empty-state">
          <h3>No hay juegos que coincidan con esos filtros</h3>
          <p>Prueba a quitar alguno de los filtros o vuelve a la vista completa.</p>
          <Button onClick={clearFilters}>Mostrar toda la biblioteca</Button>
        </div>
      ) : (
        <div ref={shelfRef} className="shelf-area">
          {shelfBoards.map((topPx, idx) => (
            <div
              key={`board-${idx}`}
              className="shelf-board"
              style={{ top: `${topPx}px` }}
            />
          ))}

          <div ref={libreriaRef} className="libreria">
            {filteredGames.map((g) => (
              <Game
                key={g.id}
                gameId={g.id}
                platform={mapPlataformaToFamily(g.plataforma)}
                rawPlatform={g.plataforma}
                spineDesign={getSpineDesign(g.plataforma)}
                title={g.igdbName || g.nombre}
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
