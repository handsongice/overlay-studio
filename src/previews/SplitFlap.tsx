import type { ReactNode } from "react";
import type { PreviewDefinition, Params } from "../types";
import { clamp, clamp01, easeInCubic, toNumber, toString, useAnimElapsed, usePrefersReducedMotion } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { SidePanel } from "./SidePanel";

/* ============================================================
   SplitFlap · 机场翻牌（移植自 video-shotcraft 镜头卡 split-flap-title）
   每字符一个翻牌格：先翻 2 个乱码中间态，再咔哒停到目标字，
   左→右级联成波。机械宣告感。黑白灰：深底浅字 + 中缝铰链线。
   ============================================================ */


const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&";
const START = 22 / 140;
const STAGGER = 4 / 140;
const FLIP = 5 / 140;
const NFLIP = 3;

const rnd = (a: number) => {
  const x = Math.sin(a * 127.3) * 43758.5453;
  return x - Math.floor(x);
};
const garble = (i: number, k: number) =>
  CHARSET[Math.floor(rnd(i * 7.13 + k * 3.71 + 1) * CHARSET.length)];

export const splitFlapDefinition: PreviewDefinition = {
  id: "shot-split-flap",
  index: "09",
  name: "SplitFlap",
  nameEn: "机场翻牌",
  category: "typography",
  description: "镜头卡 · split-flap-title：翻牌格级联翻过乱码咔哒停在目标字",
  controls: [
    { key: "text", label: "翻牌文字", type: "text", section: "文案", defaultValue: "NOW LIVE" },
    { key: "eyebrow", label: "眉题", type: "text", section: "文案", defaultValue: "SHOT CARD · SPLIT FLAP" },
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
    text: "NOW LIVE",
    eyebrow: "SHOT CARD · SPLIT FLAP",
    side: "left",
    duration: 4.7,
    delay: 0.25,
  },
  component: SplitFlap,
};

const FLAP_BG = "var(--surface-2)";
const FLAP_EDGE = "var(--bg)";
const FLAP_INK = "var(--ink)";

function Half({ ch, cellW, cellH, fontSize, part }: { ch: string; cellW: number; cellH: number; fontSize: number; part: "top" | "bottom" }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: part === "top" ? 0 : cellH / 2,
        width: cellW,
        height: cellH / 2,
        overflow: "hidden",
        background: FLAP_BG,
        borderRadius: part === "top" ? "6px 6px 0 0" : "0 0 6px 6px",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: part === "top" ? 0 : -cellH / 2,
          width: cellW,
          height: cellH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize,
          color: FLAP_INK,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {ch}
      </div>
    </div>
  );
}

function FlapCell({ target, i, t, cellW, cellH, fontSize }: { target: string; i: number; t: number; cellW: number; cellH: number; fontSize: number }) {
  const seq = [garble(i, 0), garble(i, 1), garble(i, 2), target];
  const local = t - (START + i * STAGGER);
  const done = local >= NFLIP * FLIP;

  // 停定咔哒：整格下沉回弹
  const clickY = done
    ? local < (15 + 22) / 140
      ? -1
      : 0
    : 0;

  let topCh = seq[0];
  let bottomCh = seq[0];
  let flap: ReactNode = null;

  if (done) {
    topCh = target;
    bottomCh = target;
  } else if (local > 0) {
    const k = Math.min(NFLIP - 1, Math.floor(local / FLIP));
    const from = seq[k];
    const to = seq[k + 1];
    const p = easeInCubic(clamp01((local - k * FLIP) / FLIP));
    topCh = to;
    bottomCh = from;
    if (p < 0.5) {
      const deg = p * 2 * 90;
      flap = (
        <div style={{ position: "absolute", inset: 0, transform: `rotateX(${-deg}deg)`, transformOrigin: `center ${cellH / 2}px`, backfaceVisibility: "hidden", zIndex: 2 }}>
          <Half ch={from} part="top" cellW={cellW} cellH={cellH} fontSize={fontSize} />
        </div>
      );
    } else {
      const deg = 90 - (p - 0.5) * 2 * 90;
      flap = (
        <div style={{ position: "absolute", inset: 0, transform: `rotateX(${deg}deg)`, transformOrigin: `center ${cellH / 2}px`, backfaceVisibility: "hidden", zIndex: 2 }}>
          <Half ch={to} part="bottom" cellW={cellW} cellH={cellH} fontSize={fontSize} />
        </div>
      );
    }
  }

  return (
    <div style={{ position: "relative", width: cellW, height: cellH, transform: `translateY(${clickY}px)`, perspective: 420, borderRadius: 6 }}>
      <Half ch={topCh} part="top" cellW={cellW} cellH={cellH} fontSize={fontSize} />
      <Half ch={bottomCh} part="bottom" cellW={cellW} cellH={cellH} fontSize={fontSize} />
      {flap}
      <div style={{ position: "absolute", left: 0, top: cellH / 2 - 1.5, width: cellW, height: 3, background: FLAP_EDGE, zIndex: 3 }} />
    </div>
  );
}

export function SplitFlap({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const text = (toString(params.text, "NOW LIVE") || "NOW LIVE").toUpperCase().slice(0, 16);
  const eyebrow = toString(params.eyebrow, "SHOT CARD · SPLIT FLAP");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 4.7);
  const delay = toNumber(params.delay, 0.25);

  const W = 520;
  const elapsed = useAnimElapsed({ duration: duration + 1.6, delay, disabled: reduced });
  const t = clamp(elapsed / duration, 0, 1);

  const letters = text.split("").filter((ch) => ch !== " ");
  const spaceCount = text.length - letters.length;
  const CELL_W = 56;
  const CELL_H = 72;
  const gap = 7;
  const spaceW = 26;
  const totalW = letters.length * CELL_W + spaceCount * spaceW + (text.length - 1) * gap;

  let letterIdx = 0;
  return (
    <div className="preview-frame">
      <PreviewChrome index="09" name="SPLIT FLAP" />
      <SidePanel side={side} width={W} align="center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: side === "right" ? "flex-end" : "flex-start" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.4em", color: "var(--ink-dim)", marginBottom: 40, whiteSpace: "nowrap" }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", gap, alignItems: "center", transform: `scale(${Math.min(1, W / totalW)})`, transformOrigin: side === "right" ? "right" : "left" }}>
            {text.split("").map((ch, idx) => {
              if (ch === " ") return <div key={idx} style={{ width: spaceW }} />;
              const i = letterIdx++;
              return (
                <FlapCell
                  key={`${ch}-${idx}`}
                  target={ch}
                  i={i}
                  t={reduced ? 1 : t}
                  cellW={CELL_W}
                  cellH={CELL_H}
                  fontSize={42}
                />
              );
            })}
          </div>
        </div>
      </SidePanel>
    </div>
  );
}
