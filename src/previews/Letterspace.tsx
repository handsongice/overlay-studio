import type { CSSProperties } from "react";
import type { PreviewDefinition, Params } from "../types";
import { toNumber, toString, useAnimElapsed, usePrefersReducedMotion, easeInOutQuad, seg } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { SidePanel } from "./SidePanel";

/* ============================================================
   Letterspace · 字标结晶描画（移植自 video-shotcraft 镜头卡 letterspace-materialize）
   大字距全大写字标：所有字母同一帧起笔、笔画连续生长、同一帧齐收成词。
   黑白灰版：细骨架笔画 + 弱白描，无发光；静谧仪式感。
   ============================================================ */


// 78×64 视框内的方正细骨架字形（子笔画顺序 = 描画顺序）
const GLYPHS: Record<string, string> = {
  A: "M 7 59 L 39 5 L 71 59 M 17 41 L 61 41",
  B: "M 12 59 L 12 5 L 44 5 C 64 5, 64 34, 44 34 L 12 34 M 44 34 C 66 34, 66 59, 44 59 L 12 59",
  C: "M 64 15 C 54 5, 16 5, 16 32 C 16 59, 54 59, 64 49",
  D: "M 12 59 L 12 5 L 42 5 C 64 5, 64 59, 42 59 L 12 59",
  E: "M 62 5 L 12 5 L 12 59 L 62 59 M 12 31 L 56 31",
  F: "M 62 5 L 12 5 L 12 59 M 12 31 L 56 31",
  G: "M 64 22 L 64 59 L 26 59 L 14 47 C 8 40, 10 16, 22 9 C 36 1, 56 5, 64 22",
  H: "M 12 5 L 12 59 M 66 5 L 66 59 M 12 31 L 66 31",
  I: "M 24 5 L 54 5 M 39 5 L 39 59 M 24 59 L 54 59",
  J: "M 58 5 L 58 46 C 58 62, 20 62, 14 46",
  K: "M 12 5 L 12 59 M 64 5 L 16 35 M 36 31 L 66 59",
  L: "M 12 5 L 12 59 L 66 59",
  M: "M 8 59 L 8 6 L 39 38 L 70 6 L 70 59",
  N: "M 12 59 L 12 5 L 66 59 L 66 5",
  O: "M 39 5 C 12 5, 12 59, 39 59 C 66 59, 66 5, 39 5",
  P: "M 12 59 L 12 5 L 44 5 C 64 5, 64 32, 44 32 L 12 32",
  Q: "M 39 5 C 12 5, 12 59, 39 59 C 50 59, 60 54, 65 46 M 52 34 L 72 54",
  R: "M 12 59 L 12 5 L 44 5 C 64 5, 64 31, 44 31 L 12 31 M 42 31 L 64 59",
  S: "M 62 13 C 51 4, 18 3, 15 15 C 12 26, 29 29, 39 31 C 50 33, 66 37, 63 48 C 60 59, 21 61, 11 50",
  T: "M 8 5 L 70 5 M 39 5 L 39 59",
  U: "M 12 5 L 12 40 C 12 59, 66 59, 66 40 L 66 5",
  V: "M 8 5 L 39 59 L 70 5",
  W: "M 6 5 L 24 59 L 39 24 L 54 59 L 72 5",
  X: "M 12 5 L 66 59 M 66 5 L 12 59",
  Y: "M 8 5 L 39 32 L 70 5 M 39 32 L 39 59",
  Z: "M 66 5 L 12 5 L 66 59 L 12 59",
  "0": "M 39 5 C 14 5, 14 59, 39 59 C 64 59, 64 5, 39 5 M 20 18 L 58 46",
  "1": "M 34 14 L 46 5 L 46 59 M 28 59 L 58 59",
  "2": "M 14 14 C 20 5, 60 5, 60 20 C 60 38, 16 46, 14 59 L 62 59",
  "3": "M 16 5 L 58 5 C 66 12, 62 28, 50 31 C 64 36, 66 54, 54 59 L 14 59",
  "4": "M 52 5 L 18 42 L 62 42 M 52 5 L 52 59",
  "5": "M 60 5 L 14 5 L 12 30 C 30 26, 54 28, 56 44 C 58 60, 22 62, 14 48",
  "6": "M 62 18 C 56 5, 20 5, 18 32 C 16 58, 54 62, 56 46 C 58 32, 34 30, 30 40",
  "7": "M 10 5 L 64 5 L 30 59",
  "8": "M 39 5 C 18 5, 16 31, 32 34 C 56 38, 62 59, 39 59 C 18 59, 14 34, 34 32",
  "9": "M 26 54 C 32 62, 62 60, 62 36 C 62 8, 22 10, 24 30 C 26 48, 50 44, 48 34",
  "-": "M 14 32 L 64 32",
  ".": "M 37 48 C 34 48, 34 59, 39 59 C 44 59, 43 48, 37 48",
  ":": "M 35 16 C 32 16, 32 27, 37 27 C 42 27, 41 16, 35 16 M 35 48 C 32 48, 32 59, 39 59 C 44 59, 43 48, 35 48",
  " ": "",
};

export const letterspaceDefinition: PreviewDefinition = {
  id: "shot-letterspace",
  index: "07",
  name: "Letterspace",
  nameEn: "字标结晶",
  category: "typography",
  description: "镜头卡 · letterspace-materialize：全字并行笔画描画，同帧齐收成词",
  controls: [
    { key: "text", label: "字标文字", type: "text", section: "文案", defaultValue: "MOTION" },
    { key: "eyebrow", label: "眉题", type: "text", section: "文案", defaultValue: "SHOT CARD · LETTERSPACE" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 3.4, min: 1.5, max: 6, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.3, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    text: "MOTION",
    eyebrow: "SHOT CARD · LETTERSPACE",
    side: "left",
    duration: 3.4,
    delay: 0.3,
  },
  component: Letterspace,
};

function Glyph({ ch, progress, vbW, vbH, delay }: { ch: string; progress: number; vbW: number; vbH: number; delay: number }) {
  const d = GLYPHS[ch] ?? "M 8 6 L 70 58 M 70 6 L 8 58";
  const e = easeInOutQuad(progress);
  return (
    <svg
      width={vbW}
      height={vbH}
      viewBox="0 0 78 64"
      style={{ overflow: "visible", display: "block", opacity: progress > 0 ? 1 : 0 }}
    >
      {progress > 0 && (
        <path
          d={d}
          fill="none"
          strokeWidth={5.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - e}
          style={{ stroke: "var(--ink)", transition: "none", animationDelay: `${delay}s` } as CSSProperties}
        />
      )}
    </svg>
  );
}

export function Letterspace({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const text = (toString(params.text, "MOTION") || "MOTION").toUpperCase().slice(0, 12);
  const eyebrow = toString(params.eyebrow, "SHOT CARD · LETTERSPACE");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 3.4);
  const delay = toNumber(params.delay, 0.3);

  const W = 520;
  const gap = 22;
  const vbW = (W - gap * (text.length - 1)) / text.length;
  const vbH = vbW * (64 / 78);

  const elapsed = useAnimElapsed({ duration: duration + 1.2, delay, disabled: reduced });
  const t = elapsed / duration; // 归一化时间
  const START = 0.16 / 3.4; // 统一起笔
  const DUR = 0.52 / 3.4;
  const p = seg(t, START, START + DUR);
  const done = p >= 1;

  return (
    <div className="preview-frame">
      <PreviewChrome index="07" name="LETTERSPACE" />
      <SidePanel side={side} width={W} align="center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: side === "right" ? "flex-end" : "flex-start" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "calc(13px * var(--fs, 1))", letterSpacing: "0.4em", color: "var(--ink-dim)", marginBottom: 34, whiteSpace: "nowrap" }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", gap, alignItems: "center", height: vbH }}>
            {text.split("").map((ch, i) => (
              <Glyph key={`${ch}-${i}`} ch={ch} progress={reduced ? 1 : p} vbW={vbW} vbH={vbH} delay={delay} />
            ))}
          </div>
          {/* 收笔后的弱细线（结晶完成标记） */}
          <div
            style={{
              marginTop: 40,
              width: 88,
              height: 1,
              background: "color-mix(in srgb, var(--ink) 50%, transparent)",
              transform: `scaleX(${done || reduced ? 1 : 0})`,
              transformOrigin: side === "right" ? "right" : "left",
              transition: "transform 0.5s ease 0.1s",
            }}
          />
        </div>
      </SidePanel>
    </div>
  );
}
