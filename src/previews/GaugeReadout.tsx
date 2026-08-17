import type { PreviewDefinition, Params } from "../types";
import { cubicInOut, cubicOut, toNumber, toString, useAnimElapsed, usePrefersReducedMotion } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { SidePanel } from "./SidePanel";

/* ============================================================
   GaugeReadout · 仪表读数（移植自 video-shotcraft 镜头卡 gauge-readout-moves）
   两式：
   A needle-sweep-selftest —— 满弧扫针自检：指针甩满 270° 再回落真值，多表错峰
   B tape-scroll-fixed-pointer —— 滚带定针：针不动刻度带滚过 + 冲刺刹车回摆
   ============================================================ */

const BASE_FRAMES = 140; // 基准约 4.7s

export const gaugeReadoutDefinition: PreviewDefinition = {
  id: "shot-gauge-readout",
  index: "15",
  name: "GaugeReadout",
  nameEn: "仪表读数",
  category: "metric",
  description: "镜头卡 · gauge-readout-moves：满弧扫针自检 / 滚带定针（两式）",
  controls: [
    {
      key: "mode", label: "仪表式样", type: "select", section: "布局", defaultValue: "needle",
      options: [
        { value: "needle", label: "A · 满弧扫针" },
        { value: "tape", label: "B · 滚带定针" },
      ],
    },
    { key: "label", label: "指标标签", type: "text", section: "文案", defaultValue: "SYSTEM READINESS" },
    { key: "unit", label: "单位", type: "text", section: "文案", defaultValue: "%" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 4.7, min: 2.4, max: 7, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.25, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    mode: "needle",
    label: "SYSTEM READINESS",
    unit: "%",
    side: "left",
    duration: 4.7,
    delay: 0.25,
  },
  component: GaugeReadout,
};

/* ---------- A：满弧扫针 ---------- */

const polar = (a: number, r: number, cx: number, cy: number): [number, number] => [
  cx + r * Math.cos((a * Math.PI) / 180),
  cy + r * Math.sin((a * Math.PI) / 180),
];

const arcPath = (d0: number, d1: number, r: number, cx: number, cy: number): string => {
  const [x0, y0] = polar(135 + d0, r, cx, cy);
  const [x1, y1] = polar(135 + d1, r, cx, cy);
  const large = d1 - d0 > 180 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

const GAUGES = [
  { start: 12, target: 190 },
  { start: 16, target: 120 },
  { start: 20, target: 235 },
];

function needleAngle(f: number, s: number, target: number): number {
  if (f <= s) return 0;
  if (f <= s + 12) return 270 * cubicOut((f - s) / 12);
  if (f <= s + 25) return 270 + (target - 8 - 270) * cubicInOut((f - s - 12) / 13);
  return target - 8 + 8 * cubicOut((f - s - 25) / 7);
}

function Gauge({ start, target, frame }: { start: number; target: number; frame: number }) {
  const R = 66;
  const W = 168;
  const H = 190;
  const CX = W / 2;
  const CY = 96;
  const d = needleAngle(frame, start, target);
  const settle = start + 32;
  const value = Math.round((target / 270) * 100);

  const popScale = frame < settle ? 0.3 : frame < settle + 4 ? 0.3 + 0.88 * ((frame - settle) / 4) : frame < settle + 8 ? 1.18 - 0.18 * ((frame - settle - 4) / 4) : 1;
  const popOp = frame < settle ? 0 : Math.min(1, (frame - settle) / 3);

  const [tipX, tipY] = polar(135, R - 14, CX, CY);
  const [tailX, tailY] = polar(315, 20, CX, CY);

  const ticks = [];
  for (let k = 0; k <= 30; k++) {
    const dd = k * 9;
    const major = k % 3 === 0;
    const a = 135 + dd;
    const [x0, y0] = polar(a, R - 6, CX, CY);
    const [x1, y1] = polar(a, major ? R - 24 : R - 15, CX, CY);
    ticks.push(
      <line
        key={k}
        x1={x0}
        y1={y0}
        x2={x1}
        y2={y1}
        stroke={dd >= 225 ? "var(--accent)" : "var(--ink-dim)"}
        strokeWidth={major ? 3 : 1.5}
        opacity={dd >= 225 ? 0.85 : 1}
      />
    );
  }

  return (
    <div style={{ width: W, height: H, position: "relative", flex: "none" }}>
      <svg width={W} height={H * 0.82} style={{ display: "block" }}>
        <path d={arcPath(0, 270, R, CX, CY)} fill="none" stroke="var(--line)" strokeWidth={7} strokeLinecap="round" />
        <path d={arcPath(225, 270, R, CX, CY)} fill="none" stroke="var(--accent)" strokeWidth={7} strokeLinecap="round" opacity={0.55} />
        {ticks}
        <g transform={`rotate(${d.toFixed(3)} ${CX} ${CY})`}>
          <line x1={tailX} y1={tailY} x2={tipX} y2={tipY} stroke="var(--accent)" strokeWidth={6} strokeLinecap="round" />
        </g>
        <circle cx={CX} cy={CY} r={10} fill="var(--ink)" />
        <circle cx={CX} cy={CY} r={4} fill="var(--accent)" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: H * 0.72,
          textAlign: "center",
          opacity: popOp,
          transform: `scale(${popScale.toFixed(4)})`,
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: "calc(800 * var(--fw, 1))", fontSize: "calc(40px * var(--fs, 1))", color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function NeedleBoard({ frame, label }: { frame: number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "calc(12px * var(--fs, 1))", letterSpacing: "0.34em", color: "var(--ink-dim)", marginBottom: 16 }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {GAUGES.map((g, i) => (
          <Gauge key={i} start={g.start} target={g.target} frame={frame} />
        ))}
      </div>
    </div>
  );
}

/* ---------- B：滚带定针 ---------- */

const PXU = 2.4; // px per unit
const CENTER = 168; // 取景窗中线（带内坐标）
const TAPE_W = 190;

function tapeValue(f: number): number {
  if (f <= 12) return 60;
  if (f <= 55) return 60 + ((f - 12) / 43) * 80;
  if (f <= 78) return 140 + (442 - 140) * cubicInOut((f - 55) / 23);
  if (f <= 88) return 442 + (415 - 442) * cubicOut((f - 78) / 10);
  return 415 + (420 - 415) * cubicOut((f - 88) / 8);
}

function TapeBoard({ frame, label }: { frame: number; label: string }) {
  const v = tapeValue(frame);
  const yOf = (u: number) => CENTER + (v - u) * PXU;

  const ticks = [];
  for (let u = 0; u <= 500; u += 10) {
    const y = yOf(u);
    if (y < 0 || y > 340) continue;
    const major = u % 50 === 0;
    ticks.push(
      <div
        key={u}
        style={{
          position: "absolute",
          top: y - 2,
          right: 0,
          width: major ? 74 : 38,
          height: major ? 4 : 2,
          background: major ? "var(--ink)" : "var(--ink-dim)",
          borderRadius: 2,
          opacity: major ? 0.9 : 0.6,
        }}
      />
    );
    if (major) {
      ticks.push(
        <div
          key={`n${u}`}
          style={{
            position: "absolute",
            top: y - 16,
            right: 92,
            fontFamily: "var(--font-mono)",
            fontWeight: "calc(700 * var(--fw, 1))",
            fontSize: "calc(26px * var(--fs, 1))",
            color: "var(--ink-dim)",
            textAlign: "right",
            width: 76,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {u}
        </div>
      );
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "calc(12px * var(--fs, 1))", letterSpacing: "0.34em", color: "var(--ink-dim)", marginBottom: 16 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 26 }}>
        {/* 刻度带 */}
        <div style={{ position: "relative", width: TAPE_W, height: 336, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0 }}>{ticks}</div>
          {/* 取景窗 */}
          <div
            style={{
              position: "absolute",
              left: -10,
              right: -10,
              top: CENTER - 36,
              height: 72,
              border: `3px solid var(--accent)`,
              borderRadius: 8,
              background: "color-mix(in srgb, var(--accent) 10%, transparent)",
              boxSizing: "border-box",
            }}
          />
        </div>
        {/* 固定三角指针 */}
        <svg width={40} height={44} style={{ alignSelf: "center", flex: "none" }}>
          <polygon points="4,4 38,22 4,40" fill="var(--accent)" />
        </svg>
        {/* 读数窗 */}
        <div
          style={{
            width: 150,
            height: 120,
            alignSelf: "center",
            background: "var(--surface-2)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 22px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ height: 6, width: 84, background: "var(--line)", borderRadius: 3, marginBottom: 12 }} />
          <div style={{ fontFamily: "var(--font-display)", fontWeight: "calc(800 * var(--fw, 1))", fontSize: "calc(52px * var(--fs, 1))", color: "var(--accent)", letterSpacing: "-0.02em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {Math.round(v)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 主组件 ---------- */

export function GaugeReadout({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const mode = toString(params.mode, "needle") === "tape" ? "tape" : "needle";
  const label = toString(params.label, "SYSTEM READINESS");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 4.7);
  const delay = toNumber(params.delay, 0.25);

  const W = 520;
  const elapsed = useAnimElapsed({ duration: duration + 1.8, delay, disabled: reduced });
  const f = reduced ? 999 : (elapsed / duration) * BASE_FRAMES;

  return (
    <div className="preview-frame">
      <PreviewChrome index="15" name="GAUGE READOUT" />
      <SidePanel side={side} width={W} align="center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: side === "right" ? "flex-end" : "flex-start" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "calc(13px * var(--fs, 1))", letterSpacing: "0.4em", color: "var(--ink-dim)", marginBottom: 40, whiteSpace: "nowrap" }}>
            SHOT CARD · GAUGE READOUT · {mode === "needle" ? "NEEDLE SWEEP" : "TAPE SCROLL"}
          </div>
          {mode === "needle" ? <NeedleBoard frame={f} label={label} /> : <TapeBoard frame={f} label={label} />}
        </div>
      </SidePanel>
    </div>
  );
}
