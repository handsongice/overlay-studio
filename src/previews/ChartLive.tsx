import type { PreviewDefinition, Params } from "../types";
import { clamp01, cubicInOut, cubicOut, easeOutBack, toNumber, toString, useAnimElapsed, usePrefersReducedMotion } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { SidePanel } from "./SidePanel";

/* ============================================================
   ChartLive · 活体图表（移植自 video-shotcraft 镜头卡 chart-live-moves）
   三式：
   A oscilloscope-stream —— 示波流线：曲线实时写入 + 突发尖峰 + 读数跳动
   B unit-dot-swarm-regroup —— 单位点阵：320 点散布→聚簇→列柱→聚成数字
   C axis-rescale-shock —— 轴爆表：新值冲出画框逼 y 轴重标
   数据即剧情：必须真图表语境（真轴标/真数据/真文案）。
   ============================================================ */

const BASE_FRAMES = 150; // 基准 5.0s

export const chartLiveDefinition: PreviewDefinition = {
  id: "shot-chart-live",
  index: "16",
  name: "ChartLive",
  nameEn: "活体图表",
  category: "chart",
  description: "镜头卡 · chart-live-moves：示波流线 / 点阵重组 / 轴爆表重标（三式）",
  controls: [
    {
      key: "mode", label: "图表式样", type: "select", section: "布局", defaultValue: "osc",
      options: [
        { value: "osc", label: "A · 示波流线" },
        { value: "dots", label: "B · 点阵重组" },
        { value: "axis", label: "C · 轴爆表" },
      ],
    },
    { key: "title", label: "图表标题", type: "text", section: "文案", defaultValue: "Requests per second" },
    { key: "subtitle", label: "副标题", type: "text", section: "文案", defaultValue: "api-gateway · production · last 60 s" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 5, min: 2.5, max: 8, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.25, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    mode: "osc",
    title: "Requests per second",
    subtitle: "api-gateway · production · last 60 s",
    side: "left",
    duration: 5,
    delay: 0.25,
  },
  component: ChartLive,
};

const CARD_W = 520;
const CARD_H = 368;
const PAD = 40;
const AXIS_W = 52;
const PLOT_X = PAD + AXIS_W;
const PLOT_W = CARD_W - PAD * 2 - AXIS_W;
const PLOT_H = 200;
const PLOT_Y = 120;

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ width: CARD_W, height: CARD_H, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, boxSizing: "border-box", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: PAD, top: 30, fontFamily: "var(--font-display)" }}>
        <div style={{ fontSize: "calc(21px * var(--fs, 1))", fontWeight: "calc(700 * var(--fw, 1))", color: "var(--ink)", letterSpacing: "-0.01em" }}>{title}</div>
        <div style={{ fontSize: "calc(13px * var(--fs, 1))", fontWeight: "calc(500 * var(--fw, 1))", color: "var(--ink-dim)", marginTop: 5, fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

const fmt = (n: number): string => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/* ---------- A：示波流线 ---------- */

const HOLD = 12;
const FREEZE_START = 100;
const FREEZE_END = 112;
const SPEED = 7;
const AMP = 0.72;
const SPIKE_X0 = 300;
const SPIKE_W = 160;
const SPIKE_GAIN = 1.2;

const env = (x: number): number => {
  if (x <= SPIKE_X0 || x >= SPIKE_X0 + SPIKE_W) return 1;
  const p = (x - SPIKE_X0) / SPIKE_W;
  return 1 + SPIKE_GAIN * (0.5 - 0.5 * Math.cos(p * Math.PI * 2));
};
const effTime = (f: number): number => {
  const t = (n: number) => Math.max(n - HOLD, 0) * SPEED;
  if (f <= FREEZE_START) return t(f);
  const brakeDist = (t(FREEZE_END) - t(FREEZE_START)) * 0.45;
  return t(FREEZE_START) + brakeDist * cubicOut((f - FREEZE_START) / (FREEZE_END - FREEZE_START));
};
const wave = (x: number): number =>
  0.34 * Math.sin(x * 0.021) + 0.27 * Math.sin(x * 0.052 + 1.7) + 0.18 * Math.sin(x * 0.013 + 4.2) + 0.12 * Math.sin(x * 0.087 + 2.3);
const signal = (x: number): number => wave(x) * env(x) * AMP;
const yOf = (x: number): number => PLOT_H / 2 - signal(x) * (PLOT_H / 2);
const valueOf = (x: number): number => Math.round(1000 + signal(x) * 1000);

const Y_TICKS = ["2.0k", "1.5k", "1.0k", "0.5k", "0"];
const X_TICKS = ["-60s", "-40s", "-20s", "now"];

function OscChart({ frame }: { frame: number }) {
  const T = effTime(frame);
  const N = 200;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const px = (i / N) * PLOT_W;
    pts.push(`${px.toFixed(2)},${yOf(T - (PLOT_W - px)).toFixed(2)}`);
  }
  const headY = yOf(T);
  const frozen = frame >= FREEZE_END;
  const spikeK = clamp01((env(T) - 1) / SPIKE_GAIN);
  const hot = spikeK > 0.22;
  const readout = fmt(valueOf(T));
  const readScale = 1 + 0.32 * spikeK;

  return (
    <Card title="Requests per second" subtitle="api-gateway · production · last 60 s">
      <div
        style={{
          position: "absolute",
          right: PAD,
          top: 26,
          textAlign: "right",
          fontFamily: "var(--font-display)",
          transform: `scale(${readScale.toFixed(4)})`,
          transformOrigin: "right top",
        }}
      >
        <div style={{ fontSize: "calc(32px * var(--fs, 1))", fontWeight: "calc(800 * var(--fw, 1))", color: hot ? "var(--accent)" : "var(--ink)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
          {readout}
        </div>
        <div style={{ fontSize: "calc(12px * var(--fs, 1))", fontWeight: "calc(600 * var(--fw, 1))", color: hot ? "var(--accent)" : "var(--ink-dim)", marginTop: 2, fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}>
          REQ/S · LIVE
        </div>
      </div>

      {Y_TICKS.map((t, i) => (
        <div key={`yt${i}`} style={{ position: "absolute", left: PAD - 4, top: PLOT_Y + (PLOT_H / 4) * i - 10, width: AXIS_W - 8, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "calc(13px * var(--fs, 1))", fontWeight: "calc(600 * var(--fw, 1))", color: "var(--ink-dim)" }}>
          {t}
        </div>
      ))}

      <div style={{ position: "absolute", left: PLOT_X, top: PLOT_Y, width: PLOT_W, height: PLOT_H }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: (PLOT_H / 4) * i, height: 1, background: "var(--line)", opacity: 0.8 }} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: (PLOT_W / 3) * i, width: 1, background: "var(--line)", opacity: 0.5 }} />
        ))}
        <svg width={PLOT_W} height={PLOT_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <polyline points={pts.join(" ")} fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {!frozen && (
            <>
              <circle cx={PLOT_W} cy={headY} r={16} fill="var(--accent)" opacity={0.28} />
              <circle cx={PLOT_W} cy={headY} r={6} fill="var(--accent)" />
            </>
          )}
        </svg>
      </div>

      <div style={{ position: "absolute", left: PLOT_X, top: PLOT_Y + PLOT_H + 10, width: PLOT_W }}>
        {X_TICKS.map((t, i) => (
          <div key={`xt${i}`} style={{ position: "absolute", left: (PLOT_W / 3) * i - 30, width: 60, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "calc(12px * var(--fs, 1))", fontWeight: "calc(600 * var(--fw, 1))", color: "var(--ink-dim)" }}>
            {t}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- B：点阵重组 ---------- */

const N = 260;
const DOT_R = 5;
const M1 = 12;
const M2 = 48;
const M3 = 84;
const DUR = 20;
const STAG = 8;
const rnd = (i: number, salt: number): number => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const scatter = (i: number): [number, number] => [30 + rnd(i, 1) * 460, 60 + rnd(i, 2) * 330];
const groupOf = (i: number): number => (i < 150 ? 0 : i < 230 ? 1 : 2);
const idxInGroup = (i: number): number => (i < 150 ? i : i < 230 ? i - 150 : i - 230);
const GROUP_N = [150, 80, 30];
const GROUP_LABEL = ["Free · 6,240", "Pro · 3,520", "Enterprise · 1,080"];
const CLUSTER_C: [number, number][] = [
  [140, 230],
  [260, 210],
  [380, 240],
];
const CLUSTER_R = GROUP_N.map((n) => 40 + n * 0.34);
const cluster = (i: number): [number, number] => {
  const g = groupOf(i);
  const r = Math.sqrt(rnd(i, 3)) * CLUSTER_R[g];
  const a = rnd(i, 4) * Math.PI * 2;
  return [CLUSTER_C[g][0] + r * Math.cos(a), CLUSTER_C[g][1] + r * Math.sin(a)];
};
const BAR_BASE = 360;
const BAR_X = [140, 260, 380];
const SPACING = 12;
const bar = (i: number): [number, number] => {
  const g = groupOf(i);
  const j = idxInGroup(i);
  const col = j % 8;
  const row = Math.floor(j / 8);
  return [BAR_X[g] + (col - 3.5) * SPACING, BAR_BASE - row * SPACING];
};
const ONE = ["00100", "01100", "00100", "00100", "00100", "00100", "01110"];
const TWO = ["01110", "10001", "00001", "00010", "00100", "01000", "11111"];
const EIGHT = ["01110", "10001", "10001", "01110", "10001", "10001", "01110"];
const FOUR = ["00110", "01010", "10010", "11111", "00010", "00010", "00010"];
const SEVEN = ["11111", "00001", "00010", "00100", "00100", "00100", "00100"];
const CELL = 22;
const SUB = 11;
const Y0 = 200;
const cellPts = (x: number, y: number): [number, number][] => [
  [x, y],
  [x + SUB, y],
  [x, y + SUB],
  [x + SUB, y + SUB],
];
const buildDigit = (bitmap: string[], x0: number): [number, number][] => {
  const out: [number, number][] = [];
  bitmap.forEach((rowStr, r) => {
    rowStr.split("").forEach((c, col) => {
      if (c === "1") out.push(...cellPts(x0 + col * CELL, Y0 + r * CELL));
    });
  });
  return out;
};
const DIGIT_PTS: [number, number][] = [
  ...buildDigit(ONE, 80),
  ...buildDigit(TWO, 180),
  ...cellPts(288, Y0 + 5.4 * CELL),
  ...cellPts(282, Y0 + 6.3 * CELL),
  ...buildDigit(EIGHT, 320),
  ...buildDigit(FOUR, 420),
  ...buildDigit(SEVEN, 520 - 150),
];
const digit = (i: number): [number, number] => {
  const p = DIGIT_PTS[i % DIGIT_PTS.length];
  return [p[0] + (rnd(i, 5) - 0.5) * 4, p[1] + (rnd(i, 6) - 0.5) * 4];
};
const lerp2 = (a: [number, number], b: [number, number], t: number): [number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];
const fade = (f: number, inA: number, inB: number, outA?: number, outB?: number): number => {
  const fi = clamp01((f - inA) / (inB - inA));
  if (outA === undefined || outB === undefined) return fi;
  const fo = 1 - clamp01((f - outA) / (outB - outA));
  return Math.min(fi, fo);
};
const migP = (f: number, start: number, stag: number): number => {
  const u = clamp01((f - start - stag) / DUR);
  return 1 - Math.pow(1 - u, 2.4); // spring 近似：先快后慢微过冲
};

function DotsChart({ frame }: { frame: number }) {
  const dots = Array.from({ length: N }, (_, i) => {
    const stag = rnd(i, 7) * STAG;
    let p = scatter(i);
    p = lerp2(p, cluster(i), migP(frame, M1, stag));
    p = lerp2(p, bar(i), migP(frame, M2, stag));
    p = lerp2(p, digit(i), migP(frame, M3, stag));
    return p;
  });
  const clusterLabelOp = fade(frame, 38, 46, M2, M2 + 8);
  const barLabelOp = fade(frame, 72, 80, M3, M3 + 8);
  const captionOp = fade(frame, 114, 126);

  return (
    <div style={{ width: CARD_W, height: CARD_H, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, boxSizing: "border-box", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: PAD, top: 28, fontFamily: "var(--font-display)" }}>
        <div style={{ fontSize: "calc(21px * var(--fs, 1))", fontWeight: "calc(700 * var(--fw, 1))", color: "var(--ink)" }}>Customer growth</div>
        <div style={{ fontSize: "calc(12px * var(--fs, 1))", marginTop: 5, color: "var(--ink-dim)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>EACH DOT ≈ 40 CUSTOMERS</div>
      </div>

      <svg width={CARD_W} height={CARD_H} style={{ position: "absolute", inset: 0 }}>
        {dots.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={DOT_R} fill={groupOf(i) === 2 ? "var(--accent)" : groupOf(i) === 1 ? "var(--ink)" : "var(--ink-dim)"} opacity={groupOf(i) === 2 ? 0.95 : groupOf(i) === 1 ? 0.85 : 0.7} />
        ))}
      </svg>

      {clusterLabelOp > 0 &&
        CLUSTER_C.map((c, g) => (
          <div key={`cl${g}`} style={{ position: "absolute", left: c[0] - 120, top: c[1] - CLUSTER_R[g] - 40, width: 240, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "calc(14px * var(--fs, 1))", fontWeight: "calc(700 * var(--fw, 1))", color: g === 2 ? "var(--accent)" : "var(--ink)", opacity: clusterLabelOp }}>
            {GROUP_LABEL[g]}
          </div>
        ))}

      {barLabelOp > 0 && (
        <>
          <div style={{ position: "absolute", left: 30, width: 460, top: BAR_BASE + 14, height: 2, background: "var(--line)", opacity: barLabelOp }} />
          {BAR_X.map((x, g) => (
            <div key={`bl${g}`} style={{ position: "absolute", left: x - 80, top: BAR_BASE + 26, width: 160, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "calc(14px * var(--fs, 1))", fontWeight: "calc(700 * var(--fw, 1))", color: g === 2 ? "var(--accent)" : "var(--ink-dim)", opacity: barLabelOp }}>
              {["Free", "Pro", "Enterprise"][g]}
            </div>
          ))}
        </>
      )}

      {captionOp > 0 && (
        <div style={{ position: "absolute", left: 0, width: CARD_W, top: Y0 + 7 * CELL + 52, textAlign: "center", fontFamily: "var(--font-display)", fontSize: "calc(20px * var(--fs, 1))", fontWeight: "calc(600 * var(--fw, 1))", color: "var(--ink-dim)", opacity: captionOp, letterSpacing: 2 }}>
          Total customers · 10,840
        </div>
      )}
    </div>
  );
}

/* ---------- C：轴爆表 ---------- */

const DATA = [22, 30, 26, 38, 35, 47, 44, 58, 55, 66, 72, 340];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const HOLD_C = 12;
const DRAW_END = HOLD_C + 34;
const SHOCK_END = DRAW_END + 16;
const BEAT = SHOCK_END + 16;
const RESCALE_END = BEAT + 12;
const MARK_END = RESCALE_END + 8;
const VAL_END = MARK_END + 10;

function AxisChart({ frame }: { frame: number }) {
  const range = 100 + (400 - 100) * cubicOut(clamp01((frame - BEAT) / (RESCALE_END - BEAT)));
  const yOf = (v: number) => PLOT_H - (v / range) * PLOT_H;

  const drawT = clamp01((frame - HOLD) / (DRAW_END - HOLD)) * (DATA.length - 2);
  const shockT = cubicInOut(clamp01((frame - (DRAW_END + 2)) / (SHOCK_END - DRAW_END - 2)));
  const SHOCK_Y = -(PLOT_Y + 150);
  const rescaleP = cubicOut(clamp01((frame - BEAT) / (RESCALE_END - BEAT)));
  const swap = cubicOut(clamp01((frame - BEAT) / (BEAT + 10 - BEAT)));
  const markS = easeOutBack(clamp01((frame - RESCALE_END) / (MARK_END - RESCALE_END)));
  const valS = easeOutBack(clamp01((frame - MARK_END) / (VAL_END - MARK_END)));
  const kick =
    frame >= SHOCK_END && frame < SHOCK_END + 8
      ? 6 * (1 - (frame - SHOCK_END) / 8) * Math.sin((frame - SHOCK_END) * 2.6)
      : 0;

  const xOf = (i: number) => (i / (DATA.length - 1)) * PLOT_W;

  const basePts: string[] = [];
  const upto = Math.min(drawT, DATA.length - 2);
  for (let i = 0; i <= Math.floor(upto); i++) basePts.push(`${xOf(i).toFixed(2)},${yOf(DATA[i]).toFixed(2)}`);
  if (upto < DATA.length - 2 && upto > Math.floor(upto)) {
    const i = Math.floor(upto);
    const fi = upto - i;
    basePts.push(`${(xOf(i) + (xOf(i + 1) - xOf(i)) * fi).toFixed(2)},${(yOf(DATA[i]) + (yOf(DATA[i + 1]) - yOf(DATA[i])) * fi).toFixed(2)}`);
  }

  const x0 = xOf(DATA.length - 2);
  const y0 = yOf(DATA[DATA.length - 2]);
  const x1 = x0 + (xOf(DATA.length - 1) - x0) * shockT;
  const yEnd = SHOCK_Y + (yOf(DATA[DATA.length - 1]) - SHOCK_Y) * rescaleP;
  const y1 = y0 + (yEnd - y0) * shockT;
  const shockSeg = shockT > 0 ? [`${x0.toFixed(2)},${y0.toFixed(2)}`, `${x1.toFixed(2)},${y1.toFixed(2)}`] : [];

  const OLD_TICKS = ["$25k", "$50k", "$75k", "$100k"];
  const NEW_TICKS = ["$100k", "$200k", "$300k", "$400k"];

  return (
    <Card title="Monthly revenue" subtitle="FY2026 · all products · USD">
      <div style={{ position: "absolute", left: PLOT_X, top: PLOT_Y, width: PLOT_W, height: PLOT_H, transform: `translateY(${kick.toFixed(2)}px)` }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={`g${i}`} style={{ position: "absolute", left: 0, right: 0, top: (PLOT_H / 4) * i, height: 1, background: "var(--line)" }} />
        ))}
        {[1, 3, 5, 7].map((i) => (
          <div key={`gd${i}`} style={{ position: "absolute", left: 0, right: 0, top: (PLOT_H / 8) * i, height: 1, background: "var(--line)", opacity: 0.8 * swap }} />
        ))}
        {OLD_TICKS.map((v, i) => {
          const y = (PLOT_H / 4) * (3 - i);
          return (
            <div key={`t${i}`} style={{ position: "absolute", left: -AXIS_W, top: y - 12, width: AXIS_W - 12, height: 24, textAlign: "right" }}>
              <div style={{ position: "absolute", inset: 0, fontFamily: "var(--font-mono)", fontWeight: "calc(700 * var(--fw, 1))", fontSize: "calc(13px * var(--fs, 1))", color: "var(--ink-dim)", textAlign: "right", opacity: 1 - swap, transform: `translateY(${swap * 20}px)` }}>
                {v}
              </div>
              <div style={{ position: "absolute", inset: 0, fontFamily: "var(--font-mono)", fontWeight: "calc(700 * var(--fw, 1))", fontSize: "calc(13px * var(--fs, 1))", color: "var(--ink)", textAlign: "right", opacity: swap, transform: `translateY(${(swap - 1) * 20}px)` }}>
                {NEW_TICKS[i]}
              </div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: -AXIS_W, top: PLOT_H - 12, width: AXIS_W - 12, fontFamily: "var(--font-mono)", fontWeight: "calc(700 * var(--fw, 1))", fontSize: "calc(13px * var(--fs, 1))", color: "var(--ink-dim)", textAlign: "right" }}>$0</div>

        <svg width={PLOT_W} height={PLOT_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <polyline points={basePts.join(" ")} fill="none" stroke="var(--ink)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {shockSeg.length > 0 && (
            <polyline points={shockSeg.join(" ")} fill="none" stroke="var(--accent)" strokeWidth={frame < RESCALE_END ? 6 : 3.5} strokeLinejoin="round" strokeLinecap="round" />
          )}
          {markS > 0 && (
            <>
              <circle cx={x1} cy={y1} r={8 * markS} fill="var(--accent)" />
              <circle cx={x1} cy={y1} r={14 * markS} fill="none" stroke="var(--accent)" strokeWidth={2} opacity={0.55} />
            </>
          )}
        </svg>

        {valS > 0 && (
          <div
            style={{
              position: "absolute",
              left: x1 - 120,
              top: y1 - 40,
              width: 108,
              height: 40,
              background: "var(--accent)",
              borderRadius: 8,
              color: "var(--accent-ink)",
              fontFamily: "var(--font-display)",
              fontWeight: "calc(800 * var(--fw, 1))",
              fontSize: "calc(20px * var(--fs, 1))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${valS.toFixed(4)})`,
              transformOrigin: "right center",
            }}
          >
            $340k
          </div>
        )}

        {MONTHS.map((m, i) => (
          <div key={`m${i}`} style={{ position: "absolute", left: xOf(i) - 24, top: PLOT_H + 14, width: 48, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "calc(11px * var(--fs, 1))", fontWeight: "calc(600 * var(--fw, 1))", color: i === DATA.length - 1 ? "var(--accent)" : "var(--ink-dim)" }}>
            {m}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- 主组件 ---------- */

export function ChartLive({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const mode = toString(params.mode, "osc");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 5);
  const delay = toNumber(params.delay, 0.25);

  const W = 520;
  const elapsed = useAnimElapsed({ duration: duration + 2, delay, disabled: reduced });
  const f = reduced ? 999 : (elapsed / duration) * BASE_FRAMES;

  const MODE_LABEL: Record<string, string> = { osc: "OSC STREAM", dots: "DOT REGROUP", axis: "AXIS SHOCK" };

  return (
    <div className="preview-frame">
      <PreviewChrome index="16" name="CHART LIVE" />
      <SidePanel side={side} width={W} align="center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: side === "right" ? "flex-end" : "flex-start" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "calc(13px * var(--fs, 1))", letterSpacing: "0.4em", color: "var(--ink-dim)", marginBottom: 34, whiteSpace: "nowrap", maxWidth: W, overflow: "hidden", textOverflow: "ellipsis" }}>
            CHART LIVE · {MODE_LABEL[mode] ?? "OSC STREAM"}
          </div>
          {mode === "dots" ? <DotsChart frame={f} /> : mode === "axis" ? <AxisChart frame={f} /> : <OscChart frame={f} />}
        </div>
      </SidePanel>
    </div>
  );
}
