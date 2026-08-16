import { useId } from "react";
import type { PreviewDefinition, Params } from "../types";
import { toString } from "../lib/motion";
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
  niceMax,
  parseNums,
  sideFromParam,
  smoothPath,
  tickLabel,
  timeFromParams,
  useChartTime,
  yTicks,
} from "./chartkit";

/* ============================================================
   AreaFlow · 面积流动（echarts 风格）
   平滑面积从左向右显影（clip 蒙版），渐变弱填充 + 流动光点，
   读数随光标实时跳动。支持 left / right / both。
   ============================================================ */

export const areaFlowDefinition: PreviewDefinition = {
  id: "chart-area-flow",
  index: "21",
  name: "AreaFlow",
  nameEn: "面积流动",
  category: "chart",
  description: "echarts 风格面积：平滑曲线显影 + 渐变填充 + 光标读数流动",
  controls: [
    { key: "title", label: "图表标题", type: "text", section: "文案", defaultValue: "Data throughput" },
    { key: "subtitle", label: "副标题", type: "text", section: "文案", defaultValue: "stream · last 60 s · GB/s" },
    { key: "values", label: "数据序列", type: "text", section: "数值", defaultValue: "20, 34, 52, 71, 95, 118" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
        { value: "both", label: "双侧对称" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 3.4, min: 1.5, max: 6, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.25, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    title: "Data throughput",
    subtitle: "stream · last 60 s · GB/s",
    values: "20, 34, 52, 71, 95, 118",
    side: "left",
    duration: 3.4,
    delay: 0.25,
  },
  component: AreaFlow,
};

function Chart({ params }: { params: Params }) {
  const uid = useId().replace(/[:]/g, "");
  const { duration, delay } = timeFromParams(params);
  const { p, pLin, reduced } = useChartTime(duration, delay);
  const title = toString(params.title, "Data throughput");
  const subtitle = toString(params.subtitle, "stream · last 60 s · GB/s");
  const vals = parseNums(toString(params.values, ""), [20, 34, 52, 71, 95, 118]);

  const max = niceMax(vals);
  const yTo = (v: number) => BASELINE_Y - (v / max) * PLOT_H;
  const n = vals.length;
  const xs = Array.from({ length: n }, (_, i) => PLOT_X + (i / (n - 1)) * PLOT_W);
  const ys = vals.map((v) => yTo(v));

  const path = smoothPath(xs, ys);
  const area = `${path} L${xs[n - 1].toFixed(2)},${BASELINE_Y.toFixed(2)} L${xs[0].toFixed(2)},${BASELINE_Y.toFixed(2)} Z`;

  // 光标沿曲线插值
  const fp = pLin * (n - 1);
  const i0 = Math.min(Math.floor(fp), n - 2);
  const fr = fp - i0;
  const hx = xs[i0] + (xs[i0 + 1] - xs[i0]) * fr;
  const hy = ys[i0] + (ys[i0 + 1] - ys[i0]) * fr;
  const live = Math.round(vals[i0] + (vals[i0 + 1] - vals[i0]) * fr);

  const clipId = `af-clip-${uid}`;
  const gradId = `af-grad-${uid}`;

  return (
    <ChartCard title={title} subtitle={subtitle} tag="AREA · FLOW">
      {/* Y 轴刻度 */}
      {yTicks(max, 4).map((v, i) => (
        <div
          key={`yt${i}`}
          style={{
            position: "absolute", left: CHART_PAD - 4, top: PLOT_Y + (PLOT_H / 4) * i - 10,
            width: AXIS_W - 8, textAlign: "right", fontFamily: "var(--font-mono)",
            fontSize: 13, fontWeight: 600, color: "var(--ink-dim)",
          }}
        >
          {tickLabel(v)}
        </div>
      ))}

      {/* 网格 */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={`h${i}`} style={{ position: "absolute", left: PLOT_X, right: CHART_PAD, top: PLOT_Y + (PLOT_H / 4) * i, height: 1, background: "var(--line)" }} />
      ))}

      <div style={{ position: "absolute", left: PLOT_X, top: PLOT_Y, width: PLOT_W, height: PLOT_H }}>
        <svg width={PLOT_W} height={PLOT_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.16 }} />
              <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
            </linearGradient>
            <clipPath id={clipId}>
              <rect x={0} y={-20} width={Math.max(p * PLOT_W, 0)} height={PLOT_H + 40} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <path d={area} fill={`url(#${gradId})`} />
            <path d={path} fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          </g>
          {/* 光标 */}
          {!reduced && (
            <g>
              <line x1={hx} y1={PLOT_H} x2={hx} y2={hy} stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 4" opacity={0.55} />
              <circle cx={hx} cy={hy} r={14} fill="var(--accent)" opacity={0.22} />
              <circle cx={hx} cy={hy} r={5} fill="var(--accent)" />
            </g>
          )}
        </svg>
      </div>

      {/* 实时读数 */}
      <div style={{ position: "absolute", right: CHART_PAD, top: 94, textAlign: "right" }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: "var(--accent)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
          {fmtNum(live)}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-dim)", marginTop: 2, fontFamily: "var(--font-mono)", letterSpacing: "0.24em" }}>
          GB/S · LIVE
        </div>
      </div>

      {/* 横轴标签 */}
      {["-60s", "-45s", "-30s", "-15s", "now"].map((lb, i) => (
        <div key={`xl${i}`} style={{ position: "absolute", left: PLOT_X + (PLOT_W / 4) * i - 30, top: BASELINE_Y + 12, width: 60, textAlign: i === 4 ? "right" : i === 0 ? "left" : "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--ink-dim)" }}>
          {lb}
        </div>
      ))}

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.3em", color: "var(--ink-faint)" }}>
        CLIP REVEAL · LIVE HEAD
      </div>
    </ChartCard>
  );
}

export function AreaFlow({ params }: { params: Params }) {
  const side = sideFromParam(params.side);
  return (
    <div className="pf-chart pf-area-flow">
      <PreviewChrome index="21" name="AreaFlow" />
      <SidePanel side={side} width={520}>
        <Chart params={params} />
      </SidePanel>
    </div>
  );
}
