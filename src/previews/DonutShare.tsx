import type { PreviewDefinition, Params } from "../types";
import { clamp, easeOutExpo, toString, useCountUp } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { SidePanel } from "./SidePanel";
import {
  CHART_PAD,
  ChartCard,
  SERIES_COLORS,
  parseSegments,
  sideFromParam,
  timeFromParams,
  useChartTime,
} from "./chartkit";

/* ============================================================
   DonutShare · 环形占比（echarts 风格）
   扇区按序扫出（弧长蒙版），中心读数滚动，右侧图例错峰入场。
   首扇区 accent 点睛、其余灰阶。支持 left / right / both。
   ============================================================ */

const CX = 150;
const CY = 228;
const R = 90;
const STROKE = 26;

export const donutShareDefinition: PreviewDefinition = {
  id: "chart-donut-share",
  index: "20",
  name: "DonutShare",
  nameEn: "环形占比",
  category: "chart",
  description: "echarts 风格环形：扇区扫出 + 中心占比滚动 + 图例错峰",
  controls: [
    { key: "title", label: "图表标题", type: "text", section: "文案", defaultValue: "Revenue mix" },
    { key: "subtitle", label: "副标题", type: "text", section: "文案", defaultValue: "FY 2025 · by segment" },
    { key: "segments", label: "分段（名:值）", type: "text", section: "数值", defaultValue: "云服务:46, 企业方案:28, 增值服务:16, 其他:10", placeholder: "名称:数值，逗号分隔" },
    { key: "centerLabel", label: "中心标签", type: "text", section: "文案", defaultValue: "最大占比" },
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
    title: "Revenue mix",
    subtitle: "FY 2025 · by segment",
    segments: "云服务:46, 企业方案:28, 增值服务:16, 其他:10",
    centerLabel: "最大占比",
    side: "left",
    duration: 3,
    delay: 0.25,
  },
  component: DonutShare,
};

function arcPath(startDeg: number, endDeg: number): string {
  const a0 = ((startDeg - 90) * Math.PI) / 180;
  const a1 = ((endDeg - 90) * Math.PI) / 180;
  const x0 = CX + R * Math.cos(a0);
  const y0 = CY + R * Math.sin(a0);
  const x1 = CX + R * Math.cos(a1);
  const y1 = CY + R * Math.sin(a1);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
}

function Chart({ params }: { params: Params }) {
  const { duration, delay } = timeFromParams(params);
  const { t, reduced } = useChartTime(duration, delay);
  const title = toString(params.title, "Revenue mix");
  const subtitle = toString(params.subtitle, "FY 2025 · by segment");
  const centerLabel = toString(params.centerLabel, "最大占比");
  const segs = parseSegments(toString(params.segments, ""), [
    { name: "云服务", value: 46 },
    { name: "企业方案", value: 28 },
    { name: "增值服务", value: 16 },
    { name: "其他", value: 10 },
  ]);
  const total = segs.reduce((s, x) => s + x.value, 0);
  const biggest = segs.reduce((a, b) => (b.value > a.value ? b : a), segs[0]);
  const centerValue = useCountUp(biggest.value, {
    duration: Math.min(duration, 2),
    delay: 0.35,
    disabled: reduced,
  });

  let start = 0;
  const arcs = segs.map((sg, i) => {
    const frac = sg.value / total;
    const end = start + frac * 360;
    const p = reduced ? 1 : easeOutExpo(clamp(t * 1.5 - i * 0.14, 0, 1));
    const rowIn = reduced ? 1 : clamp(t * 1.6 - (0.35 + i * 0.12), 0, 1);
    const arc = { ...sg, frac, start, end, p, rowIn, color: SERIES_COLORS[i % SERIES_COLORS.length] };
    start = end;
    return arc;
  });

  return (
    <ChartCard title={title} subtitle={subtitle} tag="DONUT · SHARE">
      {/* 轨道环 */}
      <svg width={CHART_PAD + 300} height={300} style={{ position: "absolute", left: 0, top: 82, overflow: "visible" }}>
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="var(--ink-hair)"
          strokeWidth={STROKE}
        />
        {arcs.map((a, i) => (
          <path
            key={i}
            d={arcPath(a.start, a.end)}
            fill="none"
            stroke={a.color}
            strokeWidth={STROKE}
            pathLength={1}
            strokeDasharray={`${(a.p * 1).toFixed(4)} 1`}
            strokeLinecap="butt"
            style={{ opacity: 0.25 + 0.75 * a.p }}
          />
        ))}
      </svg>

      {/* 中心读数 */}
      <div style={{ position: "absolute", left: CX - 80, top: CY - 58, width: 160, textAlign: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: "var(--accent)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
          {Math.round(centerValue)}%
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-dim)", marginTop: 2, fontFamily: "var(--font-mono)", letterSpacing: "0.14em" }}>
          {biggest.name.toUpperCase()}
        </div>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--ink-faint)", marginTop: 8, fontFamily: "var(--font-mono)" }}>
          {centerLabel.toUpperCase()}
        </div>
      </div>

      {/* 图例 */}
      <div style={{ position: "absolute", left: 272, top: 118, right: CHART_PAD, display: "flex", flexDirection: "column", gap: 0 }}>
        {arcs.map((a, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 0", opacity: a.rowIn, transform: `translateX(${(1 - a.rowIn) * 14}px)`,
              borderBottom: i < arcs.length - 1 ? "1px solid var(--line)" : "none",
            }}
          >
            <i style={{ width: 8, height: 8, borderRadius: 2, background: a.color, display: "inline-block", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--ink)", letterSpacing: "0.01em" }}>{a.name}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: i === 0 ? "var(--accent)" : "var(--ink-dim)", fontVariantNumeric: "tabular-nums" }}>
              {Math.round(a.frac * 100)}%
            </span>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.3em", color: "var(--ink-faint)" }}>
        ARC SWEEP · STAGGER
      </div>
    </ChartCard>
  );
}

export function DonutShare({ params }: { params: Params }) {
  const side = sideFromParam(params.side);
  return (
    <div className="pf-chart pf-donut-share">
      <PreviewChrome index="20" name="DonutShare" />
      <SidePanel side={side} width={520}>
        <Chart params={params} />
      </SidePanel>
    </div>
  );
}
