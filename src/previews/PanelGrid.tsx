import type { PreviewDefinition, Params } from "../types";
import { cubicInOut, cubicOut, seg, toNumber, toString, useAnimElapsed, usePrefersReducedMotion } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { SidePanel } from "./SidePanel";

/* ============================================================
   PanelGrid · 网格节奏卡（移植自 video-shotcraft 镜头卡 panel-grid-moves）
   三式（mode）：
   A reflow —— 6 卡横排 → 节拍点集体换位成 2×3 网格（FLIP 重排）
   B mosaic —— 九宫格按十六分音符逐格闪切填满（确定性打乱顺序）
   C split  —— 同页三机位：全景 / 卡片特写 / 数字区特写，斜边分格弹入
   全部收束在安全区外侧的侧栏内，不侵入中央人物区。
   ============================================================ */

const BASE_DUR = 155; // 基准约 5.2s

export const panelGridDefinition: PreviewDefinition = {
  id: "shot-panel-grid",
  index: "17",
  name: "PanelGrid",
  nameEn: "网格节奏",
  category: "ui-entrance",
  description: "镜头卡 · panel-grid-moves：网格重排 / 九宫闪切 / 漫画分格（三式）",
  controls: [
    {
      key: "mode", label: "节奏式样", type: "select", section: "布局", defaultValue: "reflow",
      options: [
        { value: "reflow", label: "A · 网格重排" },
        { value: "mosaic", label: "B · 九宫闪切" },
        { value: "split", label: "C · 漫画分格" },
      ],
    },
    { key: "eyebrow", label: "眉题", type: "text", section: "文案", defaultValue: "SHOT CARD · PANEL GRID" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 5.2, min: 2.6, max: 8, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.3, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    mode: "reflow",
    eyebrow: "SHOT CARD · PANEL GRID",
    side: "left",
    duration: 5.2,
    delay: 0.3,
  },
  component: PanelGrid,
};

const W = 520;
const PANEL_H = 400;

/* ---------- 假仪表盘内容（供三式共用） ---------- */

const BARS = [42, 66, 38, 78, 54, 88, 46, 70, 60];

function MiniDash() {
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
      {/* 顶部栏 */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 64, borderBottom: "1px solid var(--line)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 10, padding: "0 22px" }}>
        <i style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--ink-faint)" }} />
        <i style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--ink-faint)" }} />
        <i style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--ink-faint)" }} />
        <span style={{ marginLeft: 16, width: 220, height: 8, borderRadius: 4, background: "var(--ink-faint)" }} />
        <span style={{ marginLeft: 10, width: 120, height: 8, borderRadius: 4, background: "var(--ink-hair)" }} />
      </div>
      {/* 左卡片：KPI 数字块（分格 C 的数字区特写锚点） */}
      <div style={{ position: "absolute", left: 96, top: 120, width: 340, height: 150, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontWeight: "calc(700 * var(--fw, 1))", fontSize: "calc(64px * var(--fs, 1))", color: "var(--ink)", letterSpacing: "-0.03em", lineHeight: 1 }}>1,284</div>
        <div style={{ width: 130, height: 6, borderRadius: 3, background: "var(--ink-faint)" }} />
      </div>
      {/* 柱状图 */}
      <div style={{ position: "absolute", left: 96, top: 310, width: 900, height: 260, border: "1px solid var(--line)", borderRadius: 12, background: "var(--surface)", padding: "26px 26px 18px", display: "flex", alignItems: "flex-end", gap: 16 }}>
        {BARS.map((h, i) => (
          <i key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "4px 4px 0 0", background: i === 5 ? "var(--accent)" : "color-mix(in srgb, var(--ink) 34%, transparent)" }} />
        ))}
      </div>
      {/* 右侧行列表 */}
      <div style={{ position: "absolute", right: 96, top: 120, width: 640, display: "flex", flexDirection: "column", gap: 14 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <i style={{ width: 90, height: 8, borderRadius: 4, background: "var(--ink-faint)" }} />
            <i style={{ flex: 1, height: 8, borderRadius: 4, background: i === 1 ? "var(--accent-soft)" : "var(--ink-hair)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* 侧栏版卡（reflow / mosaic 用） */
function MiniCard({ seed, small }: { seed: number; small?: boolean }) {
  const r = (n: number) => {
    const x = Math.sin(n * 127.1) * 43758.5453;
    return x - Math.floor(x);
  };
  const bars = [3, 4, 2, 5, 3, 6].map((h) => h + Math.floor(r(seed * 7 + h) * 2));
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--line)", overflow: "hidden", padding: small ? 10 : 12, display: "flex", flexDirection: "column", gap: small ? 7 : 9 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <i style={{ width: small ? 7 : 9, height: small ? 7 : 9, borderRadius: "50%", background: "var(--accent)", opacity: 0.9 }} />
        <i style={{ width: small ? 46 : 60, height: small ? 5 : 6, borderRadius: 3, background: "var(--ink-faint)" }} />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: small ? 4 : 5, flex: 1, paddingTop: 4 }}>
        {bars.map((h, i) => (
          <i key={i} style={{ flex: 1, height: `${h * 13}%`, borderRadius: "2px 2px 0 0", background: i === 2 ? "var(--accent)" : "color-mix(in srgb, var(--ink) 30%, transparent)", opacity: i === 2 ? 0.95 : 0.65 }} />
        ))}
      </div>
      <i style={{ width: "72%", height: small ? 4 : 5, borderRadius: 3, background: "var(--ink-hair)" }} />
    </div>
  );
}

/* ---------- A：网格重排 ---------- */

const N = 6;
const ROW_W = 78;
const ROW_H = 96;
const ROW_GAP = 8;
const ROW_X0 = (W - (N * ROW_W + (N - 1) * ROW_GAP)) / 2;
const ROW_Y = 8;
const GRID_W = 252;
const GRID_H = 108;
const GRID_GAP = 12;
const GRID_COLS = 2;
const GRID_X0 = (W - (GRID_COLS * GRID_W + (GRID_COLS - 1) * GRID_GAP)) / 2;
const GRID_Y0 = 128;
const BEAT = 42;
const FLY = 18;
const STAGGER = 3;
const SETTLE = 4;

function Reflow({ frame }: { frame: number }) {
  const pulse = seg(frame, BEAT + (N - 1) * STAGGER + FLY + SETTLE + 2, BEAT + (N - 1) * STAGGER + FLY + SETTLE + 6) * (1 - seg(frame, BEAT + (N - 1) * STAGGER + FLY + SETTLE + 8, BEAT + (N - 1) * STAGGER + FLY + SETTLE + 11));
  return (
    <div style={{ position: "relative", width: W, height: PANEL_H, filter: pulse > 0 ? `brightness(${1 - 0.14 * pulse})` : undefined }}>
      {Array.from({ length: N }, (_, i) => {
        const t0 = BEAT + i * STAGGER;
        const x0 = ROW_X0 + i * (ROW_W + ROW_GAP) + ROW_W / 2;
        const y0 = ROW_Y + ROW_H / 2;
        const col = Math.floor(i / (N / GRID_COLS));
        const row = i % (N / GRID_COLS);
        const x1 = GRID_X0 + col * (GRID_W + GRID_GAP) + GRID_W / 2;
        const y1 = GRID_Y0 + row * (GRID_H + GRID_GAP) + GRID_H / 2;
        const u = seg(frame, t0, t0 + FLY, cubicInOut);
        const x = x0 + (x1 - x0) * u;
        const y = y0 + (y1 - y0) * u;
        const sw = ROW_W + (GRID_W - ROW_W) * u;
        const sh = ROW_H + (GRID_H - ROW_H) * u;
        const settle = seg(frame, t0 + FLY, t0 + FLY + SETTLE, cubicOut);
        const s = frame < t0 + FLY ? 1 + 0.22 * u : 1 + 0.03 * (1 - settle);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - sw / 2,
              top: y - sh / 2,
              width: sw,
              height: sh,
              transform: `scale(${s})`,
              transformOrigin: "50% 50%",
              opacity: frame >= t0 ? 1 : 0.001,
              zIndex: i,
            }}
          >
            <MiniCard seed={i + 1} small={u < 0.5} />
          </div>
        );
      })}
    </div>
  );
}

/* ---------- B：九宫闪切 ---------- */

const CELL_W = 174;
const CELL_H = 120;
const CELL_GAP = 10;
const CELL_X0 = (W - (3 * CELL_W + 2 * CELL_GAP)) / 2;
const CELL_Y0 = 10;
const FILL_START = 22;
const STEP = 2;

const ORDER = Array.from({ length: 9 }, (_, i) => i).sort((a, b) => {
  const h = (n: number) => {
    const x = Math.sin(n * 127.3) * 43758.5453;
    return x - Math.floor(x);
  };
  return h(a + 1) - h(b + 1);
});
const RANK: number[] = [];
ORDER.forEach((cell, k) => (RANK[cell] = k));

function Mosaic({ frame }: { frame: number }) {
  const lastIn = FILL_START + 8 * STEP + 3;
  const breath = frame >= lastIn && frame < lastIn + 14 ? 1 + 0.008 * Math.sin((Math.PI * (frame - lastIn)) / 14) : 1;
  return (
    <div style={{ position: "relative", width: W, height: PANEL_H }}>
      {Array.from({ length: 9 }, (_, i) => {
        const start = FILL_START + RANK[i] * STEP;
        if (frame < start) return null;
        const row = Math.floor(i / 3);
        const col = i % 3;
        const pop = seg(frame, start, start + 3, cubicOut);
        const darken = 0.45 * (1 - seg(frame, start, start + 2));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: CELL_X0 + col * (CELL_W + CELL_GAP),
              top: CELL_Y0 + row * (CELL_H + CELL_GAP),
              width: CELL_W,
              height: CELL_H,
              overflow: "hidden",
              transform: `scale(${1.18 - 0.18 * pop})`,
              transformOrigin: "center",
              zIndex: i === 4 ? 3 : 1,
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
              <MiniCard seed={i * 3 + 2} small />
            </div>
            {darken > 0.004 && <div style={{ position: "absolute", inset: 0, background: "var(--bg)", opacity: darken }} />}
          </div>
        );
      })}
      {/* 整墙微呼吸 */}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${breath})`, transformOrigin: "50% 50%", pointerEvents: "none" }} />
    </div>
  );
}

/* ---------- C：漫画分格 ---------- */

const SPLIT = 22;
const POP = 3;
const STAGGER_C = 2;
const HOLD_END = 46;
const EXPAND_END = 58;

const CW = 520;
const CH = 400;

/* 把 1920×1080 假仪表盘按 (originX, originY) 焦点缩放到面板内，焦点落在面板中心 */
function DashView({ originX, originY, scale }: { originX: number; originY: number; scale: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        transform: `translate(${CW / 2 - originX}px, ${CH / 2 - originY}px) scale(${scale})`,
        transformOrigin: `${originX}px ${originY}px`,
      }}
    >
      <MiniDash />
    </div>
  );
}

function Split({ frame }: { frame: number }) {
  const push = seg(frame, SPLIT + 2 * STAGGER_C + POP, HOLD_END, (u) => u);
  const ex = seg(frame, HOLD_END, EXPAND_END, cubicOut);
  // 第三格左边界向右向左扫过：扩张结束时整块吃满面板
  const e3Top = 426 - ex * (426 + 74);
  const e3Bot = 203 - ex * (203 + 80);

  const seam1O = Math.min(seg(frame, SPLIT + STAGGER_C, SPLIT + STAGGER_C + 2), 1 - seg(frame, HOLD_END, HOLD_END + 3));
  const seam2O = Math.min(seg(frame, SPLIT + 2 * STAGGER_C, SPLIT + 2 * STAGGER_C + 2), 1 - seg(frame, EXPAND_END - 4, EXPAND_END));

  const panels: Array<{
    clip: string;
    originX: number;
    originY: number;
    scale: number;
    z: number;
  }> = [
    {
      clip: `polygon(0px 0px, 322px 0px, 99px ${CH}px, 0px ${CH}px)`,
      originX: 960, originY: 540, scale: CW / 1920 + push * 0.006, z: 1,
    },
    {
      clip: `polygon(323px 0px, 426px 0px, 203px ${CH}px, 100px ${CH}px)`,
      originX: 260, originY: 195, scale: 0.9 + push * 0.02, z: 1,
    },
    {
      clip: `polygon(${e3Top}px 0px, ${CW}px 0px, ${CW}px ${CH}px, ${e3Bot}px ${CH}px)`,
      originX: 266, originY: 185, scale: 1.5 + push * 0.025 * (1 - ex) + 0.5 * ex, z: 3,
    },
  ];

  return (
    <div style={{ position: "relative", width: W, height: PANEL_H, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
      {frame < SPLIT && <DashView originX={960} originY={540} scale={CW / 1920} />}
      {frame >= SPLIT &&
        panels.map((p, i) => {
          const start = SPLIT + i * STAGGER_C;
          const pop = seg(frame, start, start + POP, cubicOut);
          const popScale = 1.06 - 0.06 * pop;
          const pulse = 0.3 * (1 - pop);
          return (
            <div key={i} style={{ position: "absolute", inset: 0, zIndex: p.z, clipPath: p.clip, transform: `scale(${popScale})`, transformOrigin: "50% 50%" }}>
              <DashView originX={p.originX} originY={p.originY} scale={p.scale} />
              {pulse > 0.005 && <div style={{ position: "absolute", inset: 0, background: "var(--bg)", opacity: pulse }} />}
            </div>
          );
        })}
      {/* 斜缝：暗细线 + 亮高光缝 */}
      {(seam1O > 0.004 || seam2O > 0.004) && (
        <svg width={W} height={PANEL_H} style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }}>
          {seam1O > 0.004 && (
            <g opacity={seam1O}>
              <line x1={322} y1={-4} x2={99} y2={CH + 4} stroke="var(--line-strong)" strokeWidth={4} />
              <line x1={324} y1={-4} x2={101} y2={CH + 4} stroke="var(--ink)" strokeWidth={1.5} />
            </g>
          )}
          {seam2O > 0.004 && (
            <g opacity={seam2O}>
              <line x1={426} y1={-4} x2={203} y2={CH + 4} stroke="var(--line-strong)" strokeWidth={4} />
              <line x1={428} y1={-4} x2={205} y2={CH + 4} stroke="var(--ink)" strokeWidth={1.5} />
            </g>
          )}
        </svg>
      )}
    </div>
  );
}

/* ---------- 主组件 ---------- */

export function PanelGrid({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const mode = toString(params.mode, "reflow") as "reflow" | "mosaic" | "split";
  const eyebrow = toString(params.eyebrow, "SHOT CARD · PANEL GRID");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 5.2);
  const delay = toNumber(params.delay, 0.3);

  const elapsed = useAnimElapsed({ duration: duration + 1.6, delay, disabled: reduced });
  const frame = reduced ? BASE_DUR * 2 : (elapsed / duration) * BASE_DUR;
  const alignRight = side === "right";

  return (
    <div className="preview-frame">
      <PreviewChrome index="17" name="PANEL GRID" />
      <SidePanel side={side} width={W} align="center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: alignRight ? "flex-end" : "flex-start" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "calc(13px * var(--fs, 1))", letterSpacing: "0.4em", color: "var(--ink-dim)", marginBottom: 26, whiteSpace: "nowrap" }}>
            {eyebrow}
          </div>
          {mode === "reflow" && <Reflow frame={frame} />}
          {mode === "mosaic" && <Mosaic frame={frame} />}
          {mode === "split" && <Split frame={frame} />}
          <div style={{ marginTop: 24, width: 88, height: 1, background: "color-mix(in srgb, var(--ink) 50%, transparent)", transform: `scaleX(${reduced || frame > BASE_DUR * 0.92 ? 1 : 0})`, transformOrigin: alignRight ? "right" : "left", transition: "transform 0.5s ease" }} />
        </div>
      </SidePanel>
    </div>
  );
}
