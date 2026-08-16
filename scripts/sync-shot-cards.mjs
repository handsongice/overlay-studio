/**
 * sync-shot-cards.mjs
 * 把 public/shot-cards/ 下的 video-shotcraft 镜头配方卡解析为结构化 TS 元数据。
 * 用法：node scripts/sync-shot-cards.mjs
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CARDS_DIR = join(ROOT, "public", "shot-cards");
const OUT = join(ROOT, "src", "data", "shotCards.generated.ts");

const CATEGORIES = {
  opening: ["开场与品牌", "Opening & Brand"],
  typography: ["文字与字卡", "Typography & Title Cards"],
  "ui-entrance": ["界面登场与陈列", "UI Entrance & Showcase"],
  camera: ["运镜与空间", "Camera & Space"],
  data: ["数据与指标", "Data & Metrics"],
  interaction: ["交互与功能演示", "Interaction & Feature Demo"],
  transition: ["转场", "Transitions"],
  rhythm: ["节奏与蒙太奇", "Rhythm & Montage"],
  effects: ["光效与强调", "Light & Emphasis"],
  outro: ["收尾", "Outro"],
};

/** 黑白灰 · 高级科技感适配（人工精选，保持克制） */
const CURATED = {
  "blur-slide": "ported",
  "odometer-digit-roll": "ported",
  "before-after-slider-scrub": "ported",
  "letterspace-materialize": "ported",
  "split-flap-title": "ported",
  "vertical-word-roll-blur-cycle": "ported",
  "brace-expand": "ported",
  "card-flip-reveal": "ported",
  "list-reveal": "ported",
  "panel-grid-moves": "ported",
  "scan-bracket-sweep": "ported",
  "gauge-readout-moves": "ported",
  "chart-live-moves": "ported",
  "text-column-converge": "ported",
};

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { front: {}, body: text };
  const front = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) front[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { front, body: text.slice(m[0].length) };
}

function parseSections(body) {
  const sections = [];
  const lines = body.split("\n");
  let cur = null;
  for (const line of lines) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      cur = { heading: h[1].trim(), content: [] };
      sections.push(cur);
    } else if (cur) {
      cur.content.push(line);
    }
  }
  return sections.map((s) => ({
    heading: s.heading,
    content: s.content.join("\n").replace(/\n{3,}/g, "\n\n").trim(),
  }));
}

const cards = [];
for (const catDir of readdirSync(CARDS_DIR)) {
  const abs = join(CARDS_DIR, catDir);
  if (!statSync(abs).isDirectory()) continue;
  for (const file of readdirSync(abs)) {
    if (!file.endsWith(".md")) continue;
    const id = file.replace(/\.md$/, "");
    const raw = readFileSync(join(abs, file), "utf8");
    const { front, body } = parseFrontmatter(raw);
    const sections = parseSections(body);
    const curated = CURATED[id] ? true : false;
    const ported = CURATED[id] === "ported" ? true : false;
    cards.push({
      id,
      name: front.name || id,
      category: catDir,
      summary: front["一句话"] || "",
      use: front["适用"] || "",
      duration: front["时长"] || "",
      energy: front["能量"] || "",
      tags: front["标签"] ? front["标签"].split(/[、,，]/).map((s) => s.trim()) : [],
      path: `shot-cards/${catDir}/${file}`,
      curated,
      ported,
      sections: sections.map((s) => s.heading),
    });
  }
}

cards.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.id.localeCompare(b.id);
});

const cats = Object.entries(CATEGORIES)
  .map(([id, [zh, en]]) => ({
    id,
    zh,
    en,
    count: cards.filter((c) => c.category === id).length,
  }))
  .filter((c) => c.count > 0);

const ts = `/* eslint-disable */
// 由 scripts/sync-shot-cards.mjs 自动生成，勿手改。
// 数据源：public/shot-cards/（video-shotcraft · 152 张镜头配方卡）
export interface ShotCardMeta {
  id: string;
  name: string;
  category: string;
  summary: string;
  use: string;
  duration: string;
  energy: string;
  tags: string[];
  path: string;
  curated: boolean;
  ported: boolean;
  sections: string[];
}

export interface ShotCategoryMeta {
  id: string;
  zh: string;
  en: string;
  count: number;
}

export const SHOT_CARDS: ShotCardMeta[] = ${JSON.stringify(cards, null, 2)};

export const SHOT_CATEGORIES: ShotCategoryMeta[] = ${JSON.stringify(cats, null, 2)};

export const SHOT_CARD_COUNT = ${cards.length};
`;

writeFileSync(OUT, ts);
console.log(`OK · ${cards.length} cards → ${relative(ROOT, OUT)}`);
console.log(`   categories: ${cats.map((c) => `${c.id}(${c.count})`).join(" ")}`);
console.log(`   curated: ${cards.filter((c) => c.curated).length} · ported: ${cards.filter((c) => c.ported).length}`);
