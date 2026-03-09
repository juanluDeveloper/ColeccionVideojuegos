import React, { useEffect, useMemo, useState } from "react";
import { Modal, Input, List, Button, Typography, Spin, Empty } from "antd";
import { searchIgdbGames } from "../../api/gamesApi";
import "./IgdbLinkModal.css";

const { Text } = Typography;

function igdbThumbUrl(imageId) {
  if (!imageId) return null;
  // Fast thumbnail for pick-list
  return `https://images.igdb.com/igdb/image/upload/t_cover_small/${imageId}.jpg`;
}

export default function IgdbLinkModal({
  open,
  initialQuery,
  onCancel,
  onSelect,
  existingIgdbGameId,
}) {
  const [q, setQ] = useState(initialQuery || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!open) return;
    setQ(initialQuery || "");
    setResults([]);
    setError("");
  }, [open, initialQuery]);

  const canSearch = useMemo(() => q.trim().length >= 2, [q]);

  const runSearch = async () => {
    if (!canSearch) return;
    setLoading(true);
    setError("");
    try {
      const data = await searchIgdbGames(q.trim(), 12);
      setResults(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("No se pudo buscar en IGDB.");
    } finally {
      setLoading(false);
    }
  };

  // auto-search on open (nice UX)
  useEffect(() => {
    if (!open) return;
    if (canSearch) runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      open={open}
      title="Vincular con IGDB"
      onCancel={onCancel}
      footer={null}
      centered
      destroyOnClose
    >
      <div className="igdbModal">
        <Text type="secondary">
          Busca el juego correcto en IGDB para obtener portada y arte. Esta acción solo vincula metadatos.
        </Text>

        <div className="igdbModal__search">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ej: Hollow Knight"
            onPressEnter={runSearch}
            allowClear
          />
          <Button type="primary" onClick={runSearch} disabled={!canSearch}>
            Buscar
          </Button>
        </div>

        {loading && (
          <div className="igdbModal__center">
            <Spin />
          </div>
        )}

        {!loading && error && <div className="igdbModal__error">{error}</div>}

        {!loading && !error && results.length === 0 && (
          <Empty description="Sin resultados todavía" />
        )}

        {!loading && results.length > 0 && (
          <List
            itemLayout="horizontal"
            dataSource={results}
            className="igdbModal__list"
            renderItem={(item) => {
              const imageId = item?.cover?.image_id;
              const thumb = igdbThumbUrl(imageId);
              const isCurrent = existingIgdbGameId && String(item?.id) === String(existingIgdbGameId);

              return (
                <List.Item
                  className={`igdbModal__item ${isCurrent ? "isCurrent" : ""}`}
                  actions={[
                    <Button
                      key="select"
                      type={isCurrent ? "default" : "primary"}
                      disabled={isCurrent}
                      onClick={() => onSelect?.(item)}
                    >
                      {isCurrent ? "Vinculado" : "Seleccionar"}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="igdbModal__thumb">
                        {thumb ? (
                          <img src={thumb} alt={item?.name} />
                        ) : (
                          <div className="igdbModal__thumbPlaceholder">No cover</div>
                        )}
                      </div>
                    }
                    title={<span>{item?.name ?? "—"}</span>}
                    description={
                      <span className="igdbModal__desc">
                        <Text type="secondary">IGDB ID:</Text> {item?.id ?? "—"}
                        {item?.slug ? (
                          <>
                            <span className="igdbModal__dot">•</span>
                            <Text type="secondary">Slug:</Text> {item.slug}
                          </>
                        ) : null}
                      </span>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}

        <div className="igdbModal__footerHint">
          <Text type="secondary">Games metadata is powered by </Text>
          <a href="https://www.igdb.com/" target="_blank" rel="noreferrer">
            IGDB.com
          </a>
          <Text type="secondary">.</Text>
        </div>
      </div>
    </Modal>
  );
}
