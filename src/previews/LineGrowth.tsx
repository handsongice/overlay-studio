import type { CSSProperties } from "react";
import type { PreviewDefinition, Params } from "../types";
import { clamp, easeOutExpo, toString } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { SidePanel } from "./SidePanel";
import {
  AXIS_W,
  BASELINE_Y,
  CHART_PAD,
  ChartCard,
  PLOT_H,
  PLOT_W,
  PLOT_X,
  PLOT_Y,
  fmtNum,
  linePath,
  niceMax,
  parseLabels,
  parseNums,
  sideFromParam,
  tickLabel,
  timeFromParams,
  useChartTime,
  yTicks,
} from "./chartkit";

/* ============================================================
   LineGrowth · 折线生长（echarts 风格）
   双系列折线按序逐段绘制（pathLength 蒙版），端点落定弹数字，
   强调系列 accent、对照系列灰阶。支持 left / right / both。
   ============================================================ */


export const lineGrowthDefinition: PreviewDefinition = {
  id: "chart-line-growth",
  index: "18",
  name: "LineGrowth",
  nameEn: "折线生长",
  category: "chart",
  description: "echarts 风格折线：双系列逐段绘制 + 端点读数落定 + 网格刻度",
  controls: [
    { key: "title", label: "图表标题", type: "text", section: "文案", defaultValue: "Revenue growth" },
    { key: "subtitle", label: "副标题", type: "text", section: "文案", defaultValue: "quarterly · FY 2025" },
    { key: "seriesA", label: "系列 A · 数值", type: "text", section: "数值", defaultValue: "12, 28, 45, 68, 92, 120" },
    { key: "seriesB", label: "系列 B · 数值", type: "text", section: "数值", defaultValue: "9, 20, 34, 55, 78, 105" },
    { key: "nameA", label: "系列 A · 名称", type: "text", section: "文案", defaultValue: "CURRENT" },
    { key: "nameB", label: "系列 B · 名称", type: "text", section: "文案", defaultValue: "BASELINE" },
    { key: "xLabels", label: "横轴标签", type: "text", section: "文案", defaultValue: "Q1, Q2, Q3, Q4, Q5, Q6" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
        { value: "both", label: "双侧对称" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 3.2, min: 1.5, max: 6, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.25, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    title: "Revenue growth",
    subtitle: "quarterly · FY 2025",
    seriesA: "12, 28, 45, 68, 92, 120",
    seriesB: "9, 20, 34, 55, 78, 105",
    nameA: "CURRENT",
    nameB: "BASELINE",
    xLabels: "Q1, Q2, Q3, Q4, Q5, Q6",
    side: "left",
    duration: 3.2,
    delay: 0.25,
  },
  component: LineGrowth,
};

function Chart({ params, emphasis }: { params: Params; emphasis: "a" | "b" }) {
  const { duration, delay } = timeFromParams(params);
  const { t, reduced } = useChartTime(duration, delay);
  const title = toString(params.title, "Revenue growth");
  const subtitle = toString(params.subtitle, "quarterly · FY 2025");
  const nameA = toString(params.nameA, "CURRENT");
  const nameB = toString(params.nameB, "BASELINE");
  const valsA = parseNums(toString(params.seriesA, ""), [12, 28, 45, 68, 92, 120]);
  const valsB = parseNums(toString(params.seriesB, ""), [9, 20, 34, 55, 78, 105]);
  const xLabels = parseLabels(toString(params.xLabels, ""), ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]);

  const max = niceMax([...valsA, ...valsB]);
  const yTo = (v: number) => BASELINE_Y - (v / max) * PLOT_H;
  const n = Math.max(valsA.length, valsB.length);
  const xs = Array.from({ length: n }, (_, i) => PLOT_X + (i / (n - 1)) * PLOT_W);

  const norm = (arr: number[]): number[] => {
    const out = [...arr];
    while (out.length < n) out.push(out[out.length - 1] ?? 0);
    return out;
  };
  const a = norm(valsA);
  const b = norm(valsB);
  const ysA = a.map((v) => yTo(v));
  const ysB = b.map((v) => yTo(v));

  // 双系列错峰：A 先画，B 滞后 0.15s
  const tA = reduced ? 1 : clamp(t * 1.25, 0, 1);
  const tB = reduced ? 1 : clamp((t - 0.15 / Math.max(duration, 0.01)) * 1.25, 0, 1);
  const drawA = easeOutExpo(tA);
  const drawB = easeOutExpo(tB);
  const dotA = reduced ? 1 : clamp((drawA - 0.94) / 0.06, 0, 1);
  const dotB = reduced ? 1 : clamp((drawB - 0.94) / 0.06, 0, 1);

  const colorA = emphasis === "a" ? "var(--accent)" : "color-mix(in srgb, var(--ink) 48%, transparent)";
  const colorB = emphasis === "b" ? "var(--accent)" : "color-mix(in srgb, var(--ink) 48%, transparent)";

  return (
    <ChartCard title={title} subtitle={subtitle} tag={emphasis === "a" ? "LINE · A" : "LINE · B"}>
      {/* Y 轴刻度 */}
      {yTicks(max, 4).map((v, i) => (
        <div
          key={`yt${i}`}
          style={{
            position: "absolute", left: CHART_PAD - 4, top: PLOT_Y + (PLOT_H / 4) * i - 10,
            width: AXIS_W - 8, textAlign: "right", fontFamily: "var(--font-mono)",
            fontSize: "calc(13px * var(--fs, 1))", fontWeight: "calc(600 * var(--fw, 1))", color: "var(--ink-dim)",
          }}
        >
          {tickLabel(v)}
        </div>
      ))}

      {/* 绘图区 */}
      <div style={{ position: "absolute", left: PLOT_X, top: PLOT_Y, width: PLOT_W, height: PLOT_H }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: (PLOT_H / 4) * i, height: 1, background: "var(--line)" }} />
        ))}
        {xs.map((x, i) => (
          <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: x - PLOT_X, width: 1, background: "var(--line)", opacity: 0.45 }} />
        ))}
        <svg width={PLOT_W} height={PLOT_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path
            d={linePath(xs, ysB)}
            fill="none"
            stroke={colorB}
            strokeWidth={2}
            pathLength={100}
            strokeDasharray={`${(drawB * 100).toFixed(2)} 100`}
            style={{ transition: "none" } as CSSProperties}
          />
          <path
            d={linePath(xs, ysA)}
            fill="none"
            stroke={colorA}
            strokeWidth={3}
            pathLength={100}
            strokeDasharray={`${(drawA * 100).toFixed(2)} 100`}
            style={{ transition: "none" } as CSSProperties}
          />
          {/* 端点 */}
          {dotB > 0 && (
            <g style={{ opacity: dotB }}>
              <circle cx={xs[n - 1]} cy={ysB[n - 1]} r={4} fill={colorB} />
            </g>
          )}
          {dotA > 0 && (
            <g style={{ opacity: dotA }}>
              <circle cx={xs[n - 1]} cy={ysA[n - 1]} r={5} fill={colorA} />
            </g>
          )}
        </svg>
      </div>

      {/* 端点读数 */}
      {dotB > 0 && (
        <div style={{ position: "absolute", left: xs[n - 1] - 46, top: ysB[n - 1] + 12, width: 92, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "calc(12px * var(--fs, 1))", fontWeight: "calc(700 * var(--fw, 1))", color: "var(--ink-dim)", opacity: dotB, fontVariantNumeric: "tabular-nums" }}>
          {fmtNum(valsB[n - 1])}
        </div>
      )}
      {dotA > 0 && (
        <div style={{ position: "absolute", left: xs[n - 1] - 46, top: ysA[n - 1] - 30, width: 92, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "calc(14px * var(--fs, 1))", fontWeight: "calc(800 * var(--fw, 1))", color: emphasis === "a" ? "var(--accent)" : "var(--ink)", opacity: dotA, fontVariantNumeric: "tabular-nums" }}>
          {fmtNum(valsA[n - 1])}
        </div>
      )}

      {/* 横轴标签 */}
      {xLabels.slice(0, n).map((lb, i) => (
        <div key={`xl${i}`} style={{ position: "absolute", left: xs[i] - 30, top: BASELINE_Y + 12, width: 60, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "calc(12px * var(--fs, 1))", fontWeight: "calc(600 * var(--fw, 1))", color: "var(--ink-dim)" }}>
          {lb}
        </div>
      ))}

      {/* 图例 */}
      <div style={{ position: "absolute", right: CHART_PAD, top: 96, display: "flex", gap: 16, fontFamily: "var(--font-mono)", fontSize: "calc(10px * var(--fs, 1))", letterSpacing: "0.18em" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-dim)" }}>
          <i style={{ width: 14, height: 2, background: colorA, display: "inline-block" }} /> {nameA}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-dim)" }}>
          <i style={{ width: 14, height: 2, background: colorB, display: "inline-block" }} /> {nameB}
        </span>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "calc(9px * var(--fs, 1))", letterSpacing: "0.3em", color: "var(--ink-faint)" }}>
        SVG · PATHLENGTH DRAW
      </div>
    </ChartCard>
  );
}

export function LineGrowth({ params }: { params: Params }) {
  const side = sideFromParam(params.side);
  return (
    <div className="pf-chart pf-line-growth">
      <PreviewChrome index="18" name="LineGrowth" />
      <SidePanel side={side} width={520}>
        {(s) => <Chart params={params} emphasis={s === "left" ? "a" : "b"} />}
      </SidePanel>
    </div>
  );
}
