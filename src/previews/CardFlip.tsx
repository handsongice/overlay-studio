import type { PreviewDefinition, Params } from "../types";
import { toNumber, toString, useAnimElapsed, usePrefersReducedMotion } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { SidePanel } from "./SidePanel";

/* ============================================================
   CardFlip · 3D 翻面揭示（移植自 video-shotcraft 镜头卡 card-flip-reveal）
   竖排 3 张卡逐张错峰沿 Y 轴翻 180°：正面占位卡 → 背面大号结论数字。
   翻到侧棱时闪过一道随角度移动的强调高光带；末端轻微过冲 +12° 落定。
   ============================================================ */

const BASE_FRAMES = 145; // 基准约 4.8s

export const cardFlipDefinition: PreviewDefinition = {
  id: "shot-card-flip",
  index: "14",
  name: "CardFlip",
  nameEn: "卡片翻面",
  category: "ui-entrance",
  description: "镜头卡 · card-flip-reveal：三卡错峰 3D 翻面揭示结论数字",
  controls: [
    { key: "label1", label: "卡 1 结论", type: "text", section: "文案", defaultValue: "4.9×" },
    { key: "label2", label: "卡 2 结论", type: "text", section: "文案", defaultValue: "−38%" },
    { key: "label3", label: "卡 3 结论", type: "text", section: "文案", defaultValue: "99.9%" },
    { key: "eyebrow", label: "眉题", type: "text", section: "文案", defaultValue: "SHOT CARD · CARD FLIP" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 4.8, min: 2.4, max: 7, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.25, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    label1: "4.9×",
    label2: "−38%",
    label3: "99.9%",
    eyebrow: "SHOT CARD · CARD FLIP",
    side: "left",
    duration: 4.8,
    delay: 0.25,
  },
  component: CardFlip,
};

const CW = 500;
const CH = 176;
const GAP = 26;
const FLIP_START = 18;
const STAGGER = 10;
const FLIP_DUR = 18;
const SETTLE = 8;
const OVERSHOOT = 12;

/** 卡 i 在帧 f 的翻转角：0 → 192 → 180 */
function angleAt(f: number, i: number): number {
  const s = FLIP_START + i * STAGGER;
  if (f < s + FLIP_DUR) {
    const u = (f - s) / FLIP_DUR;
    const e = 1 - Math.pow(1 - Math.max(0, Math.min(1, u)), 2.6); // bezier(0.55,0,0.3,1) 近似
    return 0 + (180 + OVERSHOOT) * e;
  }
  return 180 + OVERSHOOT * Math.pow(1 - Math.max(0, Math.min(1, (f - s - FLIP_DUR) / SETTLE)), 3);
}

/** 随角度移动的高光带 */
function Sheen({ angle }: { angle: number }) {
  const pos = 35 + ((angle - 35) / 110) * 140;
  const op = Math.max(0, 1 - Math.abs(angle - 90) / 55);
  if (op <= 0.004) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 12,
        pointerEvents: "none",
        opacity: op,
        background: `linear-gradient(105deg, transparent ${pos - 14}%, color-mix(in srgb, var(--ink) 26%, transparent) ${pos}%, transparent ${pos + 14}%)`,
      }}
    />
  );
}

/** 正面占位卡 */
function FrontCard() {
  const bars = [46, 72, 38, 84, 56, 90];
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--line)", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 24, top: 22, width: 130, height: 8, borderRadius: 4, background: "var(--ink)", opacity: 0.8 }} />
      <div style={{ position: "absolute", left: 24, top: 40, width: 86, height: 6, borderRadius: 3, background: "var(--ink-soft)" }} />
      <div style={{ position: "absolute", left: 24, top: 64, width: 260, height: 88, display: "flex", alignItems: "flex-end", gap: 10 }}>
        {bars.map((h, i) => (
          <i key={i} style={{ width: 22, height: `${h}%`, background: i === 3 ? "var(--accent)" : "var(--ink-soft)", opacity: i === 3 ? 0.95 : 0.5, borderRadius: 3 }} />
        ))}
      </div>
      <div style={{ position: "absolute", right: 24, top: 24, width: 90, height: 90, borderRadius: "50%", border: `1px solid var(--line)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", opacity: 0.9 }} />
      </div>
    </div>
  );
}

export function CardFlip({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const results = [
    toString(params.label1, "4.9×"),
    toString(params.label2, "−38%"),
    toString(params.label3, "99.9%"),
  ];
  const eyebrow = toString(params.eyebrow, "SHOT CARD · CARD FLIP");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 4.8);
  const delay = toNumber(params.delay, 0.25);

  const W = 520;
  const elapsed = useAnimElapsed({ duration: duration + 1.8, delay, disabled: reduced });
  const f = (elapsed / duration) * BASE_FRAMES;

  return (
    <div className="preview-frame">
      <PreviewChrome index="14" name="CARD FLIP" />
      <SidePanel side={side} width={W} align="center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: side === "right" ? "flex-end" : "flex-start" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "calc(13px * var(--fs, 1))", letterSpacing: "0.4em", color: "var(--ink-dim)", marginBottom: 40, whiteSpace: "nowrap" }}>
            {eyebrow}
          </div>
          <div style={{ position: "relative", width: CW, height: CH * 3 + GAP * 2 }}>
            {[0, 1, 2].map((i) => {
              const angle = reduced ? 180 : angleAt(f, i);
              const top = i * (CH + GAP);
              return (
                <div key={i} style={{ position: "absolute", left: 0, top, width: CW, height: CH, perspective: 1200 }}>
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      transformStyle: "preserve-3d",
                      transform: `rotateY(${angle}deg)`,
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
                      <FrontCard />
                      <Sheen angle={angle} />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        background: "var(--surface-2)",
                        border: "1px solid var(--line)",
                        borderRadius: 12,
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 18,
                      }}
                    >
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: "calc(800 * var(--fw, 1))", fontSize: "calc(72px * var(--fs, 1))", color: "var(--accent)", letterSpacing: "-0.03em" }}>
                        {results[i]}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "calc(13px * var(--fs, 1))", letterSpacing: "0.3em", color: "var(--ink-dim)", alignSelf: "flex-end", marginBottom: 34 }}>
                        RESULT {String(i + 1).padStart(2, "0")}
                      </span>
                      <Sheen angle={angle} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SidePanel>
    </div>
  );
}
