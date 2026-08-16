import { REGISTRY } from "./registry";
import { nextId, type ComposeItem } from "./composeState";
import type { Params } from "./types";

/* ============================================================
   Overlay JSON / SRT 导入
   - parseSrt：SRT 字幕 → 时间轴片段（供 Skill 生成脚本与内置工具复用）
   - overlayJsonToComposeItems：把《特效生成》Skill 输出的 overlay JSON
     转成 Overlay Studio 画布上的 ComposeItem（kind → 现有卡片映射，
     严格只使用现有卡片库；时间严格用 start/end）。
   ============================================================ */

export interface SrtCue {
  start: number; // 秒
  end: number; // 秒
  text: string;
}

/** SRT 时间戳（00:00:03,200 或 00:00:03.200）→ 秒 */
export function srtTimeToSeconds(ts: string): number | null {
  const m = ts.trim().replace(",", ".").match(/^(\d+):(\d{1,2}):(\d{1,2}(?:\.\d+)?)$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const sec = Number(m[3]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || !Number.isFinite(sec)) return null;
  return h * 3600 + min * 60 + sec;
}

/** 解析 SRT 字幕 → 时间轴片段（跳过序号与空行） */
export function parseSrt(srt: string): SrtCue[] {
  const blocks = srt
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  const cues: SrtCue[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const timeIdx = lines.findIndex((l) => l.includes("-->"));
    if (timeIdx < 0) continue;
    const [from, to] = lines[timeIdx].split("-->").map((s) => s.trim().split(/\s+/)[0]);
    const start = srtTimeToSeconds(from ?? "");
    const end = srtTimeToSeconds(to ?? "");
    if (start == null || end == null || end <= start) continue;
    const text = lines.slice(timeIdx + 1).join(" ");
    if (!text) continue;
    cues.push({ start, end, text });
  }
  return cues;
}

/* ---------- kind（5 分类）→ 现有卡片库 ---------- */

export type OverlayKind =
  | "metric"
  | "chart"
  | "typography"
  | "compare"
  | "ui-entrance";

const KINDS = new Set<OverlayKind>([
  "metric",
  "chart",
  "typography",
  "compare",
  "ui-entrance",
]);

/** 每张卡片的“主文本”控件（Skill 只给 text 时回填用） */
const PRIMARY_TEXT: Record<string, string> = {
  "metric-focus": "label",
  "shot-odometer-roll": "label",
  "shot-gauge-readout": "label",
  "bottom-band": "label",
  "compare-split": "leftLabel",
  "shot-scrub-compare": "beforeLabel",
  "quote-lockup": "quote",
  "shot-blur-slide": "headline",
  "shot-letterspace": "text",
  "shot-brace-expand": "title",
  "shot-split-flap": "text",
  "shot-word-roll": "stem",
  "shot-column-converge": "leftWord",
  "shot-list-reveal": "items",
  "shot-scan-sweep": "caption",
  "shot-card-flip": "label1",
  "shot-panel-grid": "eyebrow",
  "shot-chart-live": "title",
  "chart-line-growth": "title",
  "chart-bar-rise": "title",
  "chart-donut-share": "title",
  "chart-area-flow": "title",
  "timeline-strip": "title",
};

/** 分类回退：kind 没给 componentId 时取该分类第一张卡（按 index 排序） */
const kindFallback: Record<OverlayKind, string | null> = {
  metric: "metric-focus",
  chart: "chart-line-growth",
  typography: "quote-lockup",
  compare: "compare-split",
  "ui-entrance": "shot-list-reveal",
};

export interface OverlayCardSpec {
  id?: string;
  kind?: string;
  componentId?: string;
  start?: number;
  end?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  fontSize?: number;
  text?: string;
  params?: Record<string, unknown>;
}

export interface OverlayParseResult {
  items: ComposeItem[];
  errors: string[];
}

/** 校验并把一张 overlay 卡片 spec 转成 ComposeItem（id 由系统重新生成） */
function specToItem(spec: OverlayCardSpec, idx: number): ComposeItem | null {
  const errors: string[] = [];
  const tag = spec.id ? `#${spec.id}` : `第 ${idx + 1} 张`;
  if (!spec || typeof spec !== "object") {
    errors.push(`${tag}：不是对象`);
    return null;
  }
  // 1) 定位现有卡片：优先 componentId，其次 kind 分类
  let componentId = "";
  if (typeof spec.componentId === "string") {
    const def = REGISTRY.find((d) => d.id === spec.componentId);
    if (def) componentId = def.id;
    else errors.push(`${tag}：componentId "${spec.componentId}" 不在现有卡片库`);
  }
  if (!componentId && typeof spec.kind === "string") {
    const kind = spec.kind.toLowerCase() as OverlayKind;
    if (KINDS.has(kind)) {
      const fb = kindFallback[kind];
      if (fb) componentId = fb;
    } else {
      errors.push(`${tag}：kind "${spec.kind}" 不是 metric/chart/typography/compare/ui-entrance`);
    }
  }
  if (!componentId) {
    errors.push(`${tag}：无法匹配现有卡片（需提供 componentId 或合法 kind）`);
    return null;
  }
  const def = REGISTRY.find((d) => d.id === componentId)!;

  // 2) 时间：严格使用 start/end（秒），必须 end > start
  const start = typeof spec.start === "number" ? spec.start : null;
  const end = typeof spec.end === "number" ? spec.end : null;
  if (start == null || end == null || !Number.isFinite(start) || !Number.isFinite(end)) {
    errors.push(`${tag}：缺少合法的 start/end（秒）`);
    return null;
  }
  if (end <= start) {
    errors.push(`${tag}：end（${end}）必须大于 start（${start}）`);
    return null;
  }

  // 3) 尺寸/位置：x/y/w 直接用，h 可缺省（自动测量）
  const x = typeof spec.x === "number" && Number.isFinite(spec.x) ? Math.round(spec.x) : 24;
  const y = typeof spec.y === "number" && Number.isFinite(spec.y) ? Math.round(spec.y) : 260;
  const w = typeof spec.w === "number" && Number.isFinite(spec.w) && spec.w > 0 ? Math.round(spec.w) : 520;
  const h = typeof spec.h === "number" && Number.isFinite(spec.h) && spec.h > 0 ? Math.round(spec.h) : undefined;

  // 4) 参数：只保留现有控件定义的键 + 外观覆盖键（__font/__text/__bg/__accent）
  const validKeys = new Set<string>(def.controls.map((c) => c.key));
  const params: Params = { ...def.defaults };
  if (spec.params && typeof spec.params === "object") {
    for (const [k, v] of Object.entries(spec.params)) {
      const isAppearance = k.startsWith("__");
      if (validKeys.has(k) || isAppearance) {
        const t = typeof v;
        if (t === "string" || t === "number" || t === "boolean") {
          params[k] = v as Params[string];
        }
      }
    }
  }
  // 5) text 回填到卡片主文本控件（params 优先）
  if (typeof spec.text === "string" && spec.text.trim()) {
    const pk = PRIMARY_TEXT[componentId];
    if (pk && validKeys.has(pk) && !(spec.params && Object.prototype.hasOwnProperty.call(spec.params, pk))) {
      params[pk] = spec.text.trim();
    }
  }

  return {
    id: nextId(),
    componentId,
    params,
    x: Math.max(0, Math.min(1920 - w, x)),
    y: Math.max(0, Math.min(1080 - (h ?? 280), y)),
    w,
    h,
    start,
    end,
  };
}

/** 解析 overlay JSON（{ overlay: [...] } 或裸数组）→ ComposeItem 列表 */
export function overlayJsonToComposeItems(json: unknown): OverlayParseResult {
  const errors: string[] = [];
  let arr: unknown = json;
  if (json && typeof json === "object" && !Array.isArray(json)) {
    const o = json as Record<string, unknown>;
    if (Array.isArray(o.overlay)) arr = o.overlay;
    else if (Array.isArray(o.cards)) arr = o.cards;
    else {
      return { items: [], errors: ["JSON 需要是数组或 { overlay: [...] } 结构"] };
    }
  }
  if (!Array.isArray(arr)) {
    return { items: [], errors: ["JSON 需要是数组或 { overlay: [...] } 结构"] };
  }
  const items: ComposeItem[] = [];
  arr.forEach((raw, i) => {
    const it = specToItem(raw as OverlayCardSpec, i);
    if (it) items.push(it);
  });
  return { items, errors };
}
