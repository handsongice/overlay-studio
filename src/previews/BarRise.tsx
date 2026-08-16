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
   BarRise · 柱状增长（echarts 风格）
   分组双柱逐根升起（组内错峰 + 组间错峰），柱顶读数落定，
   强调系列 accent、对照系列灰阶。支持 left / right / both。
   ============================================================ */

const GROUPS = 4;
const BAR_W = 30;
const BAR_GAP = 10;

export const barRiseDefinition: PreviewDefinition = {
  id: "chart-bar-rise",
  index: "19",
  name: "BarRise",
  nameEn: "柱状增长",
  category: "chart",
  description: "echarts 风格柱状：分组双柱错峰升起 + 柱顶读数 + 网格刻度",
  controls: [
    { key: "title", label: "图表标题", type: "text", section: "文案", defaultValue: "Monthly active users" },
    { key: "subtitle", label: "副标题", type: "text", section: "文案", defaultValue: "by quarter · FY 2025" },
    { key: "seriesA", label: "系列 A · 数值", type: "text", section: "数值", defaultValue: "42, 58, 71, 89" },
    { key: "seriesB", label: "系列 B · 数值", type: "text", section: "数值", defaultValue: "30, 44, 63, 74" },
    { key: "nameA", label: "系列 A · 名称", type: "text", section: "文案", defaultValue: "2025" },
    { key: "nameB", label: "系列 B · 名称", type: "text", section: "文案", defaultValue: "2024" },
    { key: "xLabels", label: "横轴标签", type: "text", section: "文案", defaultValue: "Q1, Q2, Q3, Q4" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
        { value: "both", label: "双侧对称" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 3, min: 1.5, max: 6, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.25, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    title: "Monthly active users",
    subtitle: "by quarter · FY 2025",
    seriesA: "42, 58, 71, 89",
    seriesB: "30, 44, 63, 74",
    nameA: "2025",
    nameB: "2024",
    xLabels: "Q1, Q2, Q3, Q4",
    side: "left",
    duration: 3,
    delay: 0.25,
  },
  component: BarRise,
};

function Chart({ params, emphasis }: { params: Params; emphasis: "a" | "b" }) {
  const { duration, delay } = timeFromParams(params);
  const { t, reduced } = useChartTime(duration, delay);
  const title = toString(params.title, "Monthly active users");
  const subtitle = toString(params.subtitle, "by quarter · FY 2025");
  const nameA = toString(params.nameA, "2025");
  const nameB = toString(params.nameB, "2024");
  const valsA = parseNums(toString(params.seriesA, ""), [42, 58, 71, 89]);
  const valsB = parseNums(toString(params.seriesB, ""), [30, 44, 63, 74]);
  const xLabels = parseLabels(toString(params.xLabels, ""), ["Q1", "Q2", "Q3", "Q4"]);

  const g = Math.min(GROUPS, Math.max(valsA.length, valsB.length, xLabels.length));
  const max = niceMax([...valsA, ...valsB]);
  const yTo = (v: number) => (v / max) * PLOT_H;
  const groupW = PLOT_W / g;
  const offset = (groupW - (BAR_W * 2 + BAR_GAP)) / 2;

  const barProgress = (gi: number, si: number) =>
    reduced ? 1 : easeOutExpo(clamp(t * 1.45 - (gi * 0.1 + si * 0.16), 0, 1));

  const colorA = emphasis === "a" ? "var(--accent)" : "color-mix(in srgb, var(--ink) 52%, transparent)";
  const colorB = emphasis === "b" ? "var(--accent)" : "color-mix(in srgb, var(--ink) 52%, transparent)";

  return (
    <ChartCard title={title} subtitle={subtitle} tag={emphasis === "a" ? "BAR · A" : "BAR · B"}>
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

      {/* 柱体 */}
      {Array.from({ length: g }, (_, gi) => {
        const va = valsA[gi] ?? valsA[valsA.length - 1] ?? 0;
        const vb = valsB[gi] ?? valsB[valsB.length - 1] ?? 0;
        const pa = barProgress(gi, 0);
        const pb = barProgress(gi, 1);
        const x = gi * groupW + offset;
        return (
          <div key={`g${gi}`} style={{ position: "absolute", left: PLOT_X, top: PLOT_Y, width: PLOT_W, height: PLOT_H }}>
            {/* A */}
            <div
              style={{
                position: "absolute", left: x, bottom: 0, width: BAR_W,
                height: Math.max(yTo(va) * pa, 1), borderRadius: "4px 4px 0 0",
                background: colorA,
                opacity: 0.92,
              }}
            />
            {pa > 0.92 && (
              <div style={{ position: "absolute", left: x - 14, bottom: yTo(va) + 6, width: BAR_W + 28, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 800, color: emphasis === "a" ? "var(--accent)" : "var(--ink)", opacity: clamp((pa - 0.92) / 0.08, 0, 1), fontVariantNumeric: "tabular-nums" }}>
                {fmtNum(va)}
              </div>
            )}
            {/* B */}
            <div
              style={{
                position: "absolute", left: x + BAR_W + BAR_GAP, bottom: 0, width: BAR_W,
                height: Math.max(yTo(vb) * pb, 1), borderRadius: "4px 4px 0 0",
                background: colorB,
                opacity: 0.55,
              }}
            />
            {pb > 0.92 && emphasis === "b" && (
              <div style={{ position: "absolute", left: x + BAR_W + BAR_GAP - 14, bottom: yTo(vb) + 6, width: BAR_W + 28, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 800, color: "var(--accent)", opacity: clamp((pb - 0.92) / 0.08, 0, 1), fontVariantNumeric: "tabular-nums" }}>
                {fmtNum(vb)}
              </div>
            )}
          </div>
        );
      })}

      {/* 基线 */}
      <div style={{ position: "absolute", left: PLOT_X, right: CHART_PAD, top: BASELINE_Y, height: 1, background: "var(--line-strong)" }} />

      {/* 横轴标签 */}
      {xLabels.slice(0, g).map((lb, i) => (
        <div key={`xl${i}`} style={{ position: "absolute", left: PLOT_X + i * groupW, top: BASELINE_Y + 12, width: groupW, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--ink-dim)" }}>
          {lb}
        </div>
      ))}

      {/* 图例 */}
      <div style={{ position: "absolute", right: CHART_PAD, top: 96, display: "flex", gap: 16, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-dim)" }}>
          <i style={{ width: 14, height: 10, background: colorA, display: "inline-block", borderRadius: 2, opacity: 0.9 }} /> {nameA}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-dim)" }}>
          <i style={{ width: 14, height: 10, background: colorB, display: "inline-block", borderRadius: 2, opacity: 0.55 }} /> {nameB}
        </span>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.3em", color: "var(--ink-faint)" }}>
        STAGGER · 4×2 BARS
      </div>
    </ChartCard>
  );
}

export function BarRise({ params }: { params: Params }) {
  const side = sideFromParam(params.side);
  return (
    <div className="pf-chart pf-bar-rise">
      <PreviewChrome index="19" name="BarRise" />
      <SidePanel side={side} width={520}>
        {(s) => <Chart params={params} emphasis={s === "left" ? "a" : "b"} />}
      </SidePanel>
    </div>
  );
}
