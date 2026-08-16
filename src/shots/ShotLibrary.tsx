import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SHOT_CARDS,
  SHOT_CATEGORIES,
  SHOT_CARD_COUNT,
  type ShotCardMeta,
} from "../data/shotCards.generated";
import { renderMarkdown } from "./markdown";

/* ============================================================
   镜头卡库 · Shot Card Library
   video-shotcraft 152 张镜头配方卡：分类浏览 / 搜索 / 黑白灰适配筛选 / 详情
   ============================================================ */

type Filter = "all" | "curated" | "ported";

interface ShotDetail {
  name: string;
  summary: string;
  use: string;
  duration: string;
  energy: string;
  sections: { heading: string; content: string }[];
}

const mdCache = new Map<string, ShotDetail>();

function parseShotMarkdown(raw: string): ShotDetail {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const front: Record<string, string> = {};
  const body = m ? raw.slice(m[0].length) : raw;
  if (m) {
    for (const line of m[1].split("\n")) {
      const i = line.indexOf(":");
      if (i > 0) front[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  const sections: { heading: string; content: string[] }[] = [];
  let cur: { heading: string; content: string[] } | null = null;
  for (const line of body.split("\n")) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      cur = { heading: h[1].trim(), content: [] };
      sections.push(cur);
    } else if (cur) {
      cur.content.push(line);
    }
  }
  return {
    name: front.name ?? "",
    summary: front["一句话"] ?? "",
    use: front["适用"] ?? "",
    duration: front["时长"] ?? "",
    energy: front["能量"] ?? "",
    sections: sections.map((s) => ({
      heading: s.heading,
      content: s.content.join("\n").replace(/\n{3,}/g, "\n\n").trim(),
    })),
  };
}

async function loadDetail(path: string): Promise<ShotDetail> {
  const hit = mdCache.get(path);
  if (hit) return hit;
  const res = await fetch(import.meta.env.BASE_URL + path);
  if (!res.ok) throw new Error(`卡片加载失败: ${path}`);
  const detail = parseShotMarkdown(await res.text());
  mdCache.set(path, detail);
  return detail;
}

const ENERGY_LEVEL = ["低", "中低", "中", "中高", "高"];

function energyIndex(energy: string): number {
  for (let i = 0; i < ENERGY_LEVEL.length; i++) {
    if (energy.includes(ENERGY_LEVEL[i])) return i;
  }
  return -1;
}

interface ShotLibraryProps {
  onOpenComponent: (id: string) => void;
}

export function ShotLibrary({ onOpenComponent }: ShotLibraryProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<ShotCardMeta | null>(null);
  const [detail, setDetail] = useState<ShotDetail | null>(null);
  const [detailError, setDetailError] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SHOT_CARDS.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (filter === "curated" && !c.curated) return false;
      if (filter === "ported" && !c.ported) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.use.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, category, filter]);

  const groups = useMemo(() => {
    if (category !== "all") return [{ id: category, cards: filtered }];
    return SHOT_CATEGORIES.map((c) => ({
      id: c.id,
      cards: filtered.filter((card) => card.category === c.id),
    })).filter((g) => g.cards.length > 0);
  }, [category, filtered]);

  const selectedMeta = selected;
  const catMeta = selectedMeta
    ? SHOT_CATEGORIES.find((c) => c.id === selectedMeta.category)
    : null;

  useEffect(() => {
    if (!selectedMeta) return;
    let alive = true;
    setDetail(null);
    setDetailError(false);
    loadDetail(selectedMeta.path)
      .then((d) => {
        if (alive) setDetail(d);
      })
      .catch(() => {
        if (alive) setDetailError(true);
      });
    return () => {
      alive = false;
    };
  }, [selectedMeta]);

  const openComponent = useCallback(() => {
    if (!selectedMeta) return;
    const map: Record<string, string> = {
      "blur-slide": "shot-blur-slide",
      "odometer-digit-roll": "shot-odometer-roll",
      "before-after-slider-scrub": "shot-scrub-compare",
    };
    const pid = map[selectedMeta.id];
    if (pid) onOpenComponent(pid);
  }, [selectedMeta, onOpenComponent]);

  const counts = useMemo(() => {
    const curated = SHOT_CARDS.filter((c) => c.curated).length;
    const ported = SHOT_CARDS.filter((c) => c.ported).length;
    return { all: SHOT_CARD_COUNT, curated, ported };
  }, []);

  return (
    <div className="library">
      {/* 工具条 */}
      <div className="lib-toolbar">
        <div className="lib-search">
          <span className="lib-search-icon">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索镜头名 / 关键词 / 用途…"
            spellCheck={false}
          />
          {query && (
            <button className="lib-search-clear" onClick={() => setQuery("")}>
              ×
            </button>
          )}
        </div>
        <div className="lib-filters" role="tablist">
          {(
            [
              ["all", `全部 ${counts.all}`],
              ["curated", `黑白灰适配 ${counts.curated}`],
              ["ported", `已移植 ${counts.ported}`],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`lib-filter${filter === key ? " active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="lib-count">
          <b>{filtered.length}</b> / {counts.all} CARDS
        </div>
      </div>

      <div className="lib-body">
        {/* 分类栏 */}
        <aside className="lib-cats">
          <div className="lib-cats-title">CATEGORY</div>
          <button
            type="button"
            className={`lib-cat${category === "all" ? " active" : ""}`}
            onClick={() => setCategory("all")}
          >
            <span className="lib-cat-name">全部镜头</span>
            <span className="lib-cat-count">{counts.all}</span>
          </button>
          {SHOT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`lib-cat${category === c.id ? " active" : ""}`}
              onClick={() => setCategory(c.id)}
            >
              <span className="lib-cat-name">
                {c.zh}
                <small>{c.en}</small>
              </span>
              <span className="lib-cat-count">{c.count}</span>
            </button>
          ))}
          <div className="lib-cats-foot">
            SOURCE · video-shotcraft
            <br />
            PHASE 02 · CARD LIBRARY
          </div>
        </aside>

        {/* 卡片网格 */}
        <main className="lib-main">
          {groups.length === 0 ? (
            <div className="lib-empty">
              <span className="lib-empty-mark">∅</span>
              <span>没有匹配的镜头卡</span>
              <small>换个关键词或筛选条件试试</small>
            </div>
          ) : (
            groups.map((g) => (
              <section key={g.id} className="lib-group">
                {category === "all" && (
                  <div className="lib-group-head">
                    <span className="lib-group-name">
                      {SHOT_CATEGORIES.find((c) => c.id === g.id)?.zh}
                    </span>
                    <span className="lib-group-en">
                      {SHOT_CATEGORIES.find((c) => c.id === g.id)?.en.toUpperCase()}
                    </span>
                    <span className="lib-group-count">{g.cards.length}</span>
                  </div>
                )}
                <div className="lib-grid">
                  {g.cards.map((card) => {
                    const ei = energyIndex(card.energy);
                    return (
                      <button
                        key={card.id}
                        type="button"
                        className={`lib-card${selected?.id === card.id ? " active" : ""}`}
                        onClick={() => setSelected(card)}
                      >
                        <div className="lib-card-top">
                          <span className="lib-card-cat">
                            {SHOT_CATEGORIES.find((c) => c.id === card.category)?.zh}
                          </span>
                          <span className="lib-card-badges">
                            {card.ported && <i className="badge badge-ported">已移植</i>}
                            {card.curated && !card.ported && (
                              <i className="badge badge-curated">适配</i>
                            )}
                          </span>
                        </div>
                        <div className="lib-card-name">{card.name}</div>
                        <p className="lib-card-summary">{card.summary}</p>
                        <div className="lib-card-foot">
                          <span className="lib-energy" title={`能量: ${card.energy}`}>
                            <i
                              className="lib-energy-dot"
                              style={
                                ei >= 0
                                  ? { opacity: 0.28 + (ei / (ENERGY_LEVEL.length - 1)) * 0.72 }
                                  : undefined
                              }
                            />
                            {card.energy.replace(/^约/, "")}
                          </span>
                          <span className="lib-duration">{card.duration}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </main>

        {/* 详情抽屉 */}
        {selectedMeta && (
          <aside className="lib-detail">
            <div className="lib-detail-head">
              <div className="lib-detail-title">
                <span className="lib-detail-cat">{catMeta?.zh}</span>
                <h2>{selectedMeta.name}</h2>
                <small>
                  {catMeta?.en.toUpperCase()} · {selectedMeta.path.replace(/^shot-cards\//, "")}
                </small>
              </div>
              <button className="lib-detail-close" onClick={() => setSelected(null)}>
                ×
              </button>
            </div>

            <div className="lib-detail-scroll">
              {detailError ? (
                <div className="lib-detail-error">卡片内容加载失败</div>
              ) : !detail ? (
                <div className="lib-detail-loading">
                  <i />
                  <span>LOADING CARD…</span>
                </div>
              ) : (
                <>
                  <p className="lib-lead">{detail.summary}</p>

                  {detail.use && (
                    <div className="lib-meta">
                      <span className="lib-meta-label">适用</span>
                      <p>{detail.use}</p>
                    </div>
                  )}

                  <div className="lib-chips">
                    {detail.duration && (
                      <span className="chip">
                        <i className="chip-dot" /> 时长 {detail.duration}
                      </span>
                    )}
                    {detail.energy && (
                      <span className="chip">
                        <i className="chip-dot" /> 能量 {detail.energy}
                      </span>
                    )}
                  </div>

                  {selectedMeta.ported && (
                    <button className="btn btn-solid lib-open" onClick={openComponent}>
                      ↑ 在预览台打开此动效
                    </button>
                  )}

                  <div className="lib-sections">
                    {detail.sections.map((s) => (
                      <section key={s.heading} className="lib-section">
                        <h3>{s.heading}</h3>
                        <div className="lib-section-body">
                          {renderMarkdown(s.content, `sec-${s.heading}`)}
                        </div>
                      </section>
                    ))}
                  </div>
                </>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
