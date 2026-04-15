import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Spin } from "antd";
import {
  AiOutlineAppstore,
  AiOutlineBarChart,
  AiOutlineCheckCircle,
  AiOutlineCompass,
  AiOutlineGift,
  AiOutlineShoppingCart,
  AiOutlineStar,
  AiOutlineTrophy,
} from "react-icons/ai";
import { getGameDetail, getMyGames } from "../api/gamesApi";
import "../styles/home.css";

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function humanize(value) {
  if (!value) return "Sin dato";
  if (value === "SinFin") return "Sin fin";
  return String(value).replace(/_/g, " ");
}

function getYear(dateLike) {
  if (!dateLike) return null;
  const match = String(dateLike).match(/^(\d{4})/);
  return match ? Number(match[1]) : null;
}

function formatInteger(value) {
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(value || 0);
}

function formatDecimal(value, digits = 1) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value || 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function sumBy(items, getter) {
  return items.reduce((sum, item) => sum + (Number(getter(item)) || 0), 0);
}

function averageBy(items, getter) {
  if (!items.length) return 0;
  return sumBy(items, getter) / items.length;
}

function countBy(values) {
  return values.reduce((acc, value) => {
    if (!value) return acc;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topEntries(entriesObject, limit = 6) {
  return Object.entries(entriesObject)
    .sort((a, b) => b[1] - a[1] || humanize(a[0]).localeCompare(humanize(b[0])))
    .slice(0, limit);
}

function toBarRows(entries, total) {
  return entries.map(([label, value]) => ({
    label: humanize(label),
    value,
    percent: total > 0 ? (value / total) * 100 : 0,
  }));
}

function buildStoreRows(soportes) {
  const storeMap = {};

  soportes.forEach((soporte) => {
    if (!soporte?.tienda) return;
    if (!storeMap[soporte.tienda]) {
      storeMap[soporte.tienda] = { count: 0, spend: 0 };
    }

    storeMap[soporte.tienda].count += 1;
    storeMap[soporte.tienda].spend += Number(soporte.precio) || 0;
  });

  return Object.entries(storeMap)
    .sort((a, b) => b[1].count - a[1].count || b[1].spend - a[1].spend)
    .slice(0, 6)
    .map(([label, value]) => ({ label: humanize(label), ...value }));
}

function getDecadeRows(games) {
  const counts = {};

  games.forEach((game) => {
    const year = getYear(game.fechaLanzamiento);
    if (!year) return;
    const decade = Math.floor(year / 10) * 10;
    const key = `${decade}s`;
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => Number(b[0].slice(0, 4)) - Number(a[0].slice(0, 4)))
    .slice(0, 6)
    .map(([label, value]) => ({ label, value }));
}

function getPlayYearRows(progresos) {
  return Object.entries(countBy(progresos.map((play) => play?.anyoJugado).filter(Boolean)))
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .slice(-6)
    .map(([label, value]) => ({ label, value }));
}

function getPurchaseYearRows(soportes) {
  const years = supportsWithDate(soportes).map((support) => getYear(support.fechaCompra)).filter(Boolean);

  return Object.entries(countBy(years))
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .slice(-6)
    .map(([label, value]) => ({ label, value }));
}

function supportsWithDate(soportes) {
  return soportes.filter((support) => support?.fechaCompra);
}

function getScoreBandRows(progresos) {
  const bands = {
    "0-5": 0,
    "5-7": 0,
    "7-8.5": 0,
    "8.5-10": 0,
  };

  progresos.forEach((play) => {
    const score = Number(play?.nota);
    if (Number.isNaN(score)) return;

    if (score < 5) bands["0-5"] += 1;
    else if (score < 7) bands["5-7"] += 1;
    else if (score < 8.5) bands["7-8.5"] += 1;
    else bands["8.5-10"] += 1;
  });

  return Object.entries(bands)
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({ label, value }));
}

function getDominantLabel(entriesObject) {
  const [first] = topEntries(entriesObject, 1);
  if (!first) return null;
  return { label: humanize(first[0]), value: first[1] };
}

function MiniMetric({ label, value, note }) {
  return (
    <article className="home-metric-card">
      <span className="home-metric-label">{label}</span>
      <strong className="home-metric-value">{value}</strong>
      <span className="home-metric-note">{note}</span>
    </article>
  );
}

function BarRows({ rows, emptyLabel = "Aun sin datos" }) {
  if (!rows.length) {
    return <div className="home-empty-inline">{emptyLabel}</div>;
  }

  return (
    <div className="home-bar-list">
      {rows.map((row) => (
        <div key={row.label} className="home-bar-row">
          <div className="home-bar-meta">
            <span>{row.label}</span>
            <strong>{formatInteger(row.value)}</strong>
          </div>
          <div className="home-bar-track">
            <div className="home-bar-fill" style={{ width: `${Math.max(row.percent, 6)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyGames();
      const baseList = Array.isArray(data) ? data : [];

      const enriched = await Promise.all(
        baseList.map(async (game) => {
          try {
            const detail = await getGameDetail(game.id);
            return { ...game, ...(detail || {}) };
          } catch {
            return { ...game, soporte: game.soporte ?? [], progreso: game.progreso ?? [] };
          }
        })
      );

      setGames(enriched);
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudieron cargar los datos de la coleccion.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const dashboard = useMemo(() => {
    const supports = games.flatMap((game) => (Array.isArray(game.soporte) ? game.soporte : []));
    const playthroughs = games.flatMap((game) => (Array.isArray(game.progreso) ? game.progreso : []));
    const genres = games.flatMap((game) => (Array.isArray(game.generos) ? game.generos : []));

    const platformCounts = countBy(games.map((game) => game.plataforma).filter(Boolean));
    const progressCounts = countBy(playthroughs.map((play) => play?.avance).filter(Boolean));
    const supportStateCounts = countBy(supports.map((support) => support?.estado).filter(Boolean));
    const editionCounts = countBy(supports.map((support) => support?.edicion).filter(Boolean));
    const regionCounts = countBy(supports.map((support) => support?.region).filter(Boolean));
    const genreCounts = countBy(genres.filter(Boolean));
    const distributionCounts = countBy(supports.map((support) => support?.distribucion).filter(Boolean));

    const totalGames = games.length;
    const totalCopies = supports.length;
    const totalPlaythroughs = playthroughs.length;
    const totalHours = sumBy(playthroughs, (play) => play?.horasJugadas);
    const averageScore = averageBy(
      playthroughs.filter((play) => play?.nota != null),
      (play) => play?.nota
    );
    const linkedGames = games.filter((game) => game.igdbGameId || game.igdbUrl).length;
    const gamesWithGenre = games.filter((game) => Array.isArray(game.generos) && game.generos.length > 0).length;
    const gamesWithRelease = games.filter((game) => !!getYear(game.fechaLanzamiento)).length;
    const gamesWithCopies = games.filter((game) => Array.isArray(game.soporte) && game.soporte.length > 0).length;

    const physicalCopies = supports.filter((support) => normalizeText(support?.tipo) === "fisico").length;
    const digitalCopies = supports.filter((support) => normalizeText(support?.tipo) === "digital").length;
    const sealedCopies = supports.filter((support) => !!support?.precintado).length;
    const collectorCopies = supports.filter((support) => normalizeText(support?.edicion) === "coleccionista").length;
    const premiumCopies = supports.filter((support) =>
      ["coleccionista", "limitada", "deluxe"].includes(normalizeText(support?.edicion))
    ).length;
    const completedRuns = playthroughs.filter((play) => normalizeText(play?.avance) === "completado").length;
    const hundredPercentRuns = playthroughs.filter((play) => !!play?.completadoCien).length;
    const backlogRuns = playthroughs.filter((play) => {
      const value = normalizeText(play?.avance);
      return value === "backlog" || value === "proximo";
    }).length;
    const totalSpend = sumBy(supports, (support) => support?.precio);

    const topPlatform = getDominantLabel(platformCounts);
    const topGenre = getDominantLabel(genreCounts);
    const topRegion = getDominantLabel(regionCounts);
    const topStore = buildStoreRows(supports)[0] || null;

    const platformRows = toBarRows(topEntries(platformCounts, 7), totalGames);
    const progressRows = toBarRows(topEntries(progressCounts, 6), totalPlaythroughs);
    const supportStateRows = toBarRows(topEntries(supportStateCounts, 6), totalCopies);
    const editionRows = toBarRows(topEntries(editionCounts, 4), totalCopies);
    const regionRows = toBarRows(topEntries(regionCounts, 5), totalCopies);
    const genreRows = toBarRows(topEntries(genreCounts, 6), genres.length || totalGames);
    const distributionRows = toBarRows(topEntries(distributionCounts, 5), totalCopies);
    const decadeRows = getDecadeRows(games);
    const playYearRows = getPlayYearRows(playthroughs);
    const purchaseYearRows = getPurchaseYearRows(supports);
    const scoreBandRows = getScoreBandRows(playthroughs);
    const storeRows = buildStoreRows(supports);

    const physicalPct = totalCopies > 0 ? (physicalCopies / totalCopies) * 100 : 0;
    const digitalPct = totalCopies > 0 ? (digitalCopies / totalCopies) * 100 : 0;
    const sealedPct = totalCopies > 0 ? (sealedCopies / totalCopies) * 100 : 0;
    const completedPct = totalPlaythroughs > 0 ? (completedRuns / totalPlaythroughs) * 100 : 0;

    const supportMixGradient =
      totalCopies > 0
        ? `conic-gradient(var(--app-accent) 0 ${physicalPct}%, #0f172a ${physicalPct}% ${physicalPct + digitalPct}%, #e2e8f0 ${physicalPct + digitalPct}% 100%)`
        : "conic-gradient(#e2e8f0 0 100%)";

    const progressMixGradient =
      totalPlaythroughs > 0
        ? `conic-gradient(#7c3aed 0 ${completedPct}%, #f97316 ${completedPct}% ${Math.min(completedPct + (backlogRuns / totalPlaythroughs) * 100, 100)}%, #e2e8f0 ${Math.min(completedPct + (backlogRuns / totalPlaythroughs) * 100, 100)}% 100%)`
        : "conic-gradient(#e2e8f0 0 100%)";

    const insights = [
      topPlatform
        ? `La plataforma con mas peso ahora mismo es ${topPlatform.label}, con ${formatInteger(topPlatform.value)} juegos.`
        : "Todavia no hay una plataforma dominante en la coleccion.",
      premiumCopies > 0
        ? `Tienes ${formatInteger(premiumCopies)} ediciones premium entre deluxe, limitadas y coleccionistas.`
        : "Aun no hay ediciones premium registradas en las copias.",
      sealedCopies > 0
        ? `${formatInteger(sealedCopies)} copias siguen precintadas, un ${formatDecimal(sealedPct, 0)}% del total conocido.`
        : "No hay copias marcadas como precintadas en este momento.",
      completedRuns > 0
        ? `Has completado ${formatInteger(completedRuns)} playthroughs y ${formatInteger(hundredPercentRuns)} de ellos llegaron al 100%.`
        : "Todavia no hay playthroughs completados en los datos.",
      topStore
        ? `${topStore.label} es la tienda mas repetida, con ${formatInteger(topStore.count)} compras registradas.`
        : "Todavia no hay una tienda predominante en las compras registradas.",
    ];

    return {
      totalGames,
      totalCopies,
      totalPlaythroughs,
      totalHours,
      averageScore,
      sealedCopies,
      collectorCopies,
      premiumCopies,
      totalSpend,
      completedRuns,
      hundredPercentRuns,
      backlogRuns,
      linkedGames,
      gamesWithGenre,
      gamesWithRelease,
      gamesWithCopies,
      physicalCopies,
      digitalCopies,
      supportMixGradient,
      progressMixGradient,
      topPlatform,
      topGenre,
      topRegion,
      topStore,
      platformRows,
      progressRows,
      supportStateRows,
      editionRows,
      regionRows,
      genreRows,
      distributionRows,
      decadeRows,
      playYearRows,
      purchaseYearRows,
      scoreBandRows,
      storeRows,
      insights,
    };
  }, [games]);

  if (loading) return <div style={{ padding: 20 }}><Spin /></div>;
  if (error) return <div style={{ padding: 20 }}><Alert type="error" message={error} /></div>;

  return (
    <div className="home-page">
      <section className="home-shell">
        <div className="home-head">
          <div className="home-head-copy">
            <span className="home-kicker">Panel de coleccion</span>
            <h1 className="home-title">Lectura global de juegos, copias y playthroughs</h1>
            <p className="home-subtitle">
              Un resumen tipo Power BI para entender de un vistazo como se reparte tu
              biblioteca, que ediciones conservas y como evoluciona tu actividad.
            </p>
          </div>

          <div className="home-spotlight">
            <span className="home-spotlight-label">Resumen rapido</span>
            <strong className="home-spotlight-value">
              {formatInteger(dashboard.totalGames)} juegos / {formatInteger(dashboard.totalCopies)} copias
            </strong>
            <p className="home-spotlight-note">
              {dashboard.topPlatform
                ? `${dashboard.topPlatform.label} lidera la coleccion.`
                : "Empieza a registrar juegos para ver tendencias reales."}
            </p>
          </div>
        </div>

        <div className="home-metrics-grid">
          <MiniMetric label="Juegos" value={formatInteger(dashboard.totalGames)} note="Catalogo principal" />
          <MiniMetric label="Copias" value={formatInteger(dashboard.totalCopies)} note="Fisicas y digitales" />
          <MiniMetric label="Playthroughs" value={formatInteger(dashboard.totalPlaythroughs)} note="Partidas registradas" />
          <MiniMetric label="Horas" value={formatDecimal(dashboard.totalHours, 0)} note="Tiempo jugado conocido" />
          <MiniMetric label="Precintados" value={formatInteger(dashboard.sealedCopies)} note="Copias aun selladas" />
          <MiniMetric label="Gasto" value={formatCurrency(dashboard.totalSpend)} note="Importe con precio conocido" />
        </div>

        <div className="home-dashboard-grid">
          <article className="home-panel home-panel--span-7">
            <div className="home-panel-head">
              <div>
                <span className="home-panel-title"><AiOutlineAppstore /> Plataformas con mas peso</span>
                <p className="home-panel-copy">Distribucion de la coleccion principal por sistema.</p>
              </div>
              {dashboard.topPlatform && (
                <span className="home-panel-badge">
                  Lidera: {dashboard.topPlatform.label}
                </span>
              )}
            </div>
            <BarRows rows={dashboard.platformRows} emptyLabel="Todavia no hay plataformas para comparar." />
          </article>

          <article className="home-panel home-panel--span-5">
            <div className="home-panel-head">
              <div>
                <span className="home-panel-title"><AiOutlineGift /> Perfil de copias</span>
                <p className="home-panel-copy">Fisico frente a digital y piezas de coleccion.</p>
              </div>
            </div>

            <div className="home-ring-layout">
              <div className="home-ring-card">
                <div className="home-ring" style={{ background: dashboard.supportMixGradient }}>
                  <div className="home-ring-hole">
                    <strong>{formatInteger(dashboard.totalCopies)}</strong>
                    <span>copias</span>
                  </div>
                </div>
              </div>

              <div className="home-stat-list">
                <div className="home-stat-row">
                  <span>Fisicas</span>
                  <strong>{formatInteger(dashboard.physicalCopies)}</strong>
                </div>
                <div className="home-stat-row">
                  <span>Digitales</span>
                  <strong>{formatInteger(dashboard.digitalCopies)}</strong>
                </div>
                <div className="home-stat-row">
                  <span>Precintadas</span>
                  <strong>{formatInteger(dashboard.sealedCopies)}</strong>
                </div>
                <div className="home-stat-row">
                  <span>Coleccionista</span>
                  <strong>{formatInteger(dashboard.collectorCopies)}</strong>
                </div>
                <div className="home-stat-row">
                  <span>Premium</span>
                  <strong>{formatInteger(dashboard.premiumCopies)}</strong>
                </div>
              </div>
            </div>
          </article>

          <article className="home-panel home-panel--span-5">
            <div className="home-panel-head">
              <div>
                <span className="home-panel-title"><AiOutlineTrophy /> Estado de playthroughs</span>
                <p className="home-panel-copy">Como se reparte tu actividad entre backlog, juego y completado.</p>
              </div>
            </div>

            <div className="home-ring-layout">
              <div className="home-ring-card">
                <div className="home-ring home-ring--progress" style={{ background: dashboard.progressMixGradient }}>
                  <div className="home-ring-hole">
                    <strong>{formatInteger(dashboard.completedRuns)}</strong>
                    <span>completados</span>
                  </div>
                </div>
              </div>

              <div className="home-stat-list">
                <div className="home-stat-row">
                  <span>Playthroughs</span>
                  <strong>{formatInteger(dashboard.totalPlaythroughs)}</strong>
                </div>
                <div className="home-stat-row">
                  <span>Completados</span>
                  <strong>{formatInteger(dashboard.completedRuns)}</strong>
                </div>
                <div className="home-stat-row">
                  <span>100%</span>
                  <strong>{formatInteger(dashboard.hundredPercentRuns)}</strong>
                </div>
                <div className="home-stat-row">
                  <span>Backlog / Proximo</span>
                  <strong>{formatInteger(dashboard.backlogRuns)}</strong>
                </div>
                <div className="home-stat-row">
                  <span>Nota media</span>
                  <strong>{dashboard.averageScore ? formatDecimal(dashboard.averageScore, 1) : "-"}</strong>
                </div>
              </div>
            </div>
          </article>

          <article className="home-panel home-panel--span-7">
            <div className="home-panel-head">
              <div>
                <span className="home-panel-title"><AiOutlineCheckCircle /> Avance por estado</span>
                <p className="home-panel-copy">Distribucion de las partidas registradas segun el punto en que se encuentran.</p>
              </div>
            </div>
            <BarRows rows={dashboard.progressRows} emptyLabel="Aun no hay playthroughs registrados." />
          </article>

          <article className="home-panel home-panel--span-6">
            <div className="home-panel-head">
              <div>
                <span className="home-panel-title"><AiOutlineGift /> Ediciones y regiones</span>
                <p className="home-panel-copy">Lectura combinada de ediciones especiales y procedencia de las copias.</p>
              </div>
            </div>

            <div className="home-two-columns">
              <div>
                <span className="home-subpanel-title">Ediciones</span>
                <BarRows rows={dashboard.editionRows} emptyLabel="Sin ediciones registradas." />
              </div>
              <div>
                <span className="home-subpanel-title">Regiones</span>
                <BarRows rows={dashboard.regionRows} emptyLabel="Sin regiones registradas." />
              </div>
            </div>
          </article>

          <article className="home-panel home-panel--span-6">
            <div className="home-panel-head">
              <div>
                <span className="home-panel-title"><AiOutlineShoppingCart /> Tiendas y distribucion</span>
                <p className="home-panel-copy">Donde compras mas y que canales aparecen con mayor frecuencia.</p>
              </div>
              {dashboard.topStore && (
                <span className="home-panel-badge">{dashboard.topStore.label}</span>
              )}
            </div>

            <div className="home-two-columns">
              <div className="home-store-list">
                <span className="home-subpanel-title">Tiendas</span>
                {dashboard.storeRows.length ? dashboard.storeRows.map((row) => (
                  <div key={row.label} className="home-store-row">
                    <div>
                      <strong>{row.label}</strong>
                      <span>{formatInteger(row.count)} compras</span>
                    </div>
                    <strong>{row.spend > 0 ? formatCurrency(row.spend) : "-"}</strong>
                  </div>
                )) : <div className="home-empty-inline">Sin tiendas registradas.</div>}
              </div>

              <div>
                <span className="home-subpanel-title">Distribucion</span>
                <BarRows rows={dashboard.distributionRows} emptyLabel="Sin distribucion registrada." />
              </div>
            </div>
          </article>

          <article className="home-panel home-panel--span-6">
            <div className="home-panel-head">
              <div>
                <span className="home-panel-title"><AiOutlineCompass /> Generos y epocas</span>
                <p className="home-panel-copy">Que gustos dominan la coleccion y de que generaciones proceden los juegos.</p>
              </div>
            </div>

            <div className="home-two-columns">
              <div>
                <span className="home-subpanel-title">Generos mas presentes</span>
                <BarRows rows={dashboard.genreRows} emptyLabel="Sin generos disponibles aun." />
              </div>
              <div>
                <span className="home-subpanel-title">Decadas de lanzamiento</span>
                <div className="home-chip-cloud">
                  {dashboard.decadeRows.length ? dashboard.decadeRows.map((row) => (
                    <span key={row.label} className="home-chip">
                      {row.label} · {formatInteger(row.value)}
                    </span>
                  )) : <div className="home-empty-inline">Sin fechas de lanzamiento.</div>}
                </div>
              </div>
            </div>
          </article>

          <article className="home-panel home-panel--span-6">
            <div className="home-panel-head">
              <div>
                <span className="home-panel-title"><AiOutlineGift /> Estado de conservacion</span>
                <p className="home-panel-copy">Como se reparten las copias segun el estado fisico declarado.</p>
              </div>
            </div>
            <BarRows rows={dashboard.supportStateRows} emptyLabel="Aun no hay estados de copia registrados." />
          </article>

          <article className="home-panel home-panel--span-6">
            <div className="home-panel-head">
              <div>
                <span className="home-panel-title"><AiOutlineBarChart /> Actividad por anos</span>
                <p className="home-panel-copy">Ultimos anos con juego registrado para ver el ritmo de actividad.</p>
              </div>
            </div>

            <div className="home-activity-chart">
              {dashboard.playYearRows.length ? dashboard.playYearRows.map((row) => {
                const maxValue = Math.max(...dashboard.playYearRows.map((item) => item.value), 1);
                return (
                  <div key={row.label} className="home-activity-bar">
                    <div
                      className="home-activity-column"
                      style={{ height: `${Math.max((row.value / maxValue) * 100, 10)}%` }}
                    />
                    <strong>{formatInteger(row.value)}</strong>
                    <span>{row.label}</span>
                  </div>
                );
              }) : <div className="home-empty-inline">Aun no hay anos jugados registrados.</div>}
            </div>
          </article>

          <article className="home-panel home-panel--span-6">
            <div className="home-panel-head">
              <div>
                <span className="home-panel-title"><AiOutlineShoppingCart /> Compras por ano</span>
                <p className="home-panel-copy">Ultimos anos con compras registradas usando la fecha de adquisicion.</p>
              </div>
            </div>

            <div className="home-activity-chart">
              {dashboard.purchaseYearRows.length ? dashboard.purchaseYearRows.map((row) => {
                const maxValue = Math.max(...dashboard.purchaseYearRows.map((item) => item.value), 1);
                return (
                  <div key={row.label} className="home-activity-bar">
                    <div
                      className="home-activity-column home-activity-column--alt"
                      style={{ height: `${Math.max((row.value / maxValue) * 100, 10)}%` }}
                    />
                    <strong>{formatInteger(row.value)}</strong>
                    <span>{row.label}</span>
                  </div>
                );
              }) : <div className="home-empty-inline">Aun no hay fechas de compra suficientes.</div>}
            </div>
          </article>

          <article className="home-panel home-panel--span-6">
            <div className="home-panel-head">
              <div>
                <span className="home-panel-title"><AiOutlineStar /> Notas registradas</span>
                <p className="home-panel-copy">Distribucion de valoraciones por tramos para ver donde se mueve tu gusto.</p>
              </div>
            </div>
            <BarRows rows={dashboard.scoreBandRows.map((row) => ({ ...row, percent: dashboard.totalPlaythroughs > 0 ? (row.value / dashboard.totalPlaythroughs) * 100 : 0 }))} emptyLabel="Aun no hay notas registradas." />
          </article>

          <article className="home-panel home-panel--span-6">
            <div className="home-panel-head">
              <div>
                <span className="home-panel-title"><AiOutlineCheckCircle /> Cobertura de metadatos</span>
                <p className="home-panel-copy">Cuanto de la coleccion esta bien enriquecido y documentado dentro de la app.</p>
              </div>
            </div>

            <div className="home-mini-grid">
              <div className="home-mini-card">
                <span>Con IGDB</span>
                <strong>{formatInteger(dashboard.linkedGames)}</strong>
                <small>juegos enlazados</small>
              </div>
              <div className="home-mini-card">
                <span>Con genero</span>
                <strong>{formatInteger(dashboard.gamesWithGenre)}</strong>
                <small>ficha clasificada</small>
              </div>
              <div className="home-mini-card">
                <span>Con lanzamiento</span>
                <strong>{formatInteger(dashboard.gamesWithRelease)}</strong>
                <small>fecha conocida</small>
              </div>
              <div className="home-mini-card">
                <span>Con copias</span>
                <strong>{formatInteger(dashboard.gamesWithCopies)}</strong>
                <small>soportes asociados</small>
              </div>
            </div>
          </article>

          <article className="home-panel home-panel--span-12">
            <div className="home-panel-head">
              <div>
                <span className="home-panel-title"><AiOutlineStar /> Senales de tu coleccion</span>
                <p className="home-panel-copy">Conclusiones rapidas que convierten los datos en lectura util.</p>
              </div>
            </div>

            <div className="home-insight-grid">
              {dashboard.insights.map((insight) => (
                <article key={insight} className="home-insight-card">
                  <span className="home-insight-dot" />
                  <p>{insight}</p>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
