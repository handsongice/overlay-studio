import type { ReactNode } from "react";
import {
  clamp,
  easeOutExpo,
  toNumber,
  useAnimElapsed,
  usePrefersReducedMotion,
} from "../lib/motion";

/* ============================================================
   chartkit · 图表动效公共件（echarts 风格、SVG 自绘、主题化）
   统一卡片外壳 / 几何常量 / 序列解析 / 时间轴
   克制风格：accent 只作点睛，其余走灰阶透明度
   ============================================================ */

export const CHART_W = 520;
export const CHART_H = 368;
export const CHART_PAD = 40;
export const AXIS_W = 52;
export const PLOT_X = CHART_PAD + AXIS_W; // 92
export const PLOT_W = CHART_W - CHART_PAD * 2 - AXIS_W; // 388
export const PLOT_Y = 116;
export const PLOT_H = 196;
export const BASELINE_Y = PLOT_Y + PLOT_H; // 312

export const SERIES_COLORS = [
  "var(--accent)",
  "color-mix(in srgb, var(--ink) 55%, transparent)",
  "color-mix(in srgb, var(--ink) 30%, transparent)",
  "color-mix(in srgb, var(--ink) 16%, transparent)",
];

export function ChartCard({
  title,
  subtitle,
  tag,
  children,
}: {
  title: string;
  subtitle: string;
  tag?: string;
  children: ReactNode;
}) {
  return (
    <div className="chart-card">
      <div className="chart-card-head">
        <div>
          <div className="chart-card-title">{title}</div>
          <div className="chart-card-sub">{subtitle}</div>
        </div>
        {tag && <div className="chart-card-tag">{tag}</div>}
      </div>
      {children}
    </div>
  );
}

/** 逗号/分号分隔的数值序列 */
export function parseNums(raw: string, fallback: number[]): number[] {
  const arr = raw
    .split(/[,，;；]/)
    .map((s) => s.trim())
    .map(Number)
    .filter((n) => Number.isFinite(n));
  return arr.length >= 2 ? arr : fallback;
}

/** 逗号分隔的标签序列 */
export function parseLabels(raw: string, fallback: string[]): string[] {
  const arr = raw
    .split(/[,，;；]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length >= 2 ? arr : fallback;
}

/** 名称:数值 分段（环形图用） */
export function parseSegments(
  raw: string,
  fallback: { name: string; value: number }[],
): { name: string; value: number }[] {
  const out: { name: string; value: number }[] = [];
  for (const part of raw.split(/[,，;；]/)) {
    const m = part.match(/^\s*(.+?)\s*[:：]\s*([\d.]+)\s*%?\s*$/);
    if (m) {
      const v = Number(m[2]);
      if (Number.isFinite(v)) out.push({ name: m[1].trim(), value: v });
    }
  }
  return out.length >= 2 ? out : fallback;
}

export function fmtNum(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 简洁刻度：如 128400 → "128.4k" */
export function tickLabel(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return String(Math.round(v));
}

/** 把数据规整成"漂亮"上限（20/50/100 刻度） */
export function niceMax(values: number[]): number {
  const raw = Math.max(...values, 1);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  let nice = 1;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 2.5) nice = 2.5;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * mag;
}

/** 图表统一时间轴：返回整体进度 p（0→1，easeOutExpo） */
export function useChartTime(duration: number, delay: number) {
  const reduced = usePrefersReducedMotion();
  const elapsed = useAnimElapsed({
    duration: duration + delay,
    disabled: reduced,
  });
  const t = reduced ? 1 : clamp((elapsed - delay) / Math.max(duration, 0.01), 0, 1);
  const p = easeOutExpo(t);
  const pLin = reduced ? 1 : clamp((elapsed - delay) / Math.max(duration, 0.01), 0, 1);
  return { t, p, pLin, reduced };
}

/** 折线路径 */
export function linePath(
  xs: number[],
  ys: number[],
): string {
  return xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${ys[i].toFixed(2)}`)
    .join(" ");
}

/** 平滑折线（catmull-rom → bezier） */
export function smoothPath(xs: number[], ys: number[]): string {
  if (xs.length < 2) return linePath(xs, ys);
  let d = `M${xs[0].toFixed(2)},${ys[0].toFixed(2)}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[Math.max(i - 1, 0)];
    const y0 = ys[Math.max(i - 1, 0)];
    const x1 = xs[i];
    const y1 = ys[i];
    const x2 = xs[i + 1];
    const y2 = ys[i + 1];
    const x3 = xs[Math.min(i + 2, xs.length - 1)];
    const y3 = ys[Math.min(i + 2, ys.length - 1)];
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}`;
  }
  return d;
}

export function yTicks(max: number, count = 4): number[] {
  const out: number[] = [];
  for (let i = 0; i <= count; i++) out.push((max / count) * i);
  return out;
}

export function sideFromParam(v: string | number | boolean): "left" | "right" | "both" {
  const s = String(v);
  return s === "right" ? "right" : s === "both" ? "both" : "left";
}

export function timeFromParams(params: Record<string, string | number | boolean>) {
  return {
    duration: toNumber(params.duration, 3),
    delay: toNumber(params.delay, 0.25),
  };
}
