import type { CSSProperties } from "react";
import type { PreviewDefinition, Params } from "../types";
import { clamp01, cubicInOut, toNumber, toString, useAnimElapsed, usePrefersReducedMotion } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { SidePanel } from "./SidePanel";

/* ============================================================
   ColumnConverge · 双词对峙合拢（移植自 video-shotcraft 镜头卡 text-column-converge）
   左 "NEW" 与右侧特性词钉死两边轮换、间距零收缩；
   换到最后一词才唯一一次合拢成短语——收尾揭晓型文字卡。
   机器节奏：轮换期一像素不动，合拢只发生一次。
   ============================================================ */

const BASE_FRAMES = 165; // 基准 5.5s

const STEPS: { word: string; dur: number }[] = [
  { word: "LAUNCHER DESIGN", dur: 16 },
  { word: "COMPACT MODE", dur: 12 },
  { word: "HOTKEY RECORDER", dur: 9 },
  { word: "HOTKEY TYPES", dur: 8 },
  { word: "VOICE FEATURES", dur: 7 },
  { word: "SETTINGS DESIGN", dur: 8 },
  { word: "AI CHAT", dur: 10 },
  { word: "FILE SEARCH", dur: 12 },
  { word: "MOTION", dur: 999 },
];
const START = 8;

export const columnConvergeDefinition: PreviewDefinition = {
  id: "shot-column-converge",
  index: "11",
  name: "ColumnConverge",
  nameEn: "双词合拢",
  category: "typography",
  description: "镜头卡 · text-column-converge：左右对峙轮换，末词唯一一次合拢成短语",
  controls: [
    { key: "leftWord", label: "左词（固定）", type: "text", section: "文案", defaultValue: "NEW" },
    { key: "words", label: "右侧轮换词", type: "text", section: "文案", defaultValue: "LAUNCHER DESIGN, COMPACT MODE, HOTKEY RECORDER, HOTKEY TYPES, VOICE FEATURES, SETTINGS DESIGN, AI CHAT, FILE SEARCH, MOTION", placeholder: "逗号分隔，最后一个词触发合拢" },
    { key: "subline", label: "揭晓小字", type: "text", section: "文案", defaultValue: "COMING 2026" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 5.5, min: 3, max: 8, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.3, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    leftWord: "NEW",
    words: "LAUNCHER DESIGN, COMPACT MODE, HOTKEY RECORDER, HOTKEY TYPES, VOICE FEATURES, SETTINGS DESIGN, AI CHAT, FILE SEARCH, MOTION",
    subline: "COMING 2026",
    side: "left",
    duration: 5.5,
    delay: 0.3,
  },
  component: ColumnConverge,
};

export function ColumnConverge({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const leftWord = (toString(params.leftWord, "NEW") || "NEW").toUpperCase();
  const wordsRaw = toString(params.words, "");
  const subline = toString(params.subline, "COMING 2026");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 5.5);
  const delay = toNumber(params.delay, 0.3);

  const words = wordsRaw
    .split(/[,，]/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const steps = words.length >= 2 ? words.map((w, i) => ({ word: w, dur: i === words.length - 1 ? 999 : 16 - i })) : STEPS;

  const W = 520;
  const FS = 34;
  const LSP = 3;
  const ADV = 0.6 * FS + LSP;
  const LINE_W = (leftWord.length + 1 + steps[steps.length - 1].word.length) * ADV;
  const LEFT_EDGE = 44;
  const RIGHT_EDGE = W - 44;
  const MERGED_LEFT = (W - LINE_W) / 2;
  const MERGED_RIGHT = (W + LINE_W) / 2;

  const elapsed = useAnimElapsed({ duration: duration + 2, delay, disabled: reduced });
  const f = reduced ? 999 : (elapsed / duration) * BASE_FRAMES;
  const t = f - START;

  // 定位当前步
  let acc = 0;
  let idx = 0;
  let stepStart = 0;
  for (let i = 0; i < steps.length; i++) {
    if (t >= acc) {
      idx = i;
      stepStart = acc;
    }
    acc += steps[i].dur;
  }
  const cur = steps[idx];
  const isLast = idx === steps.length - 1;
  const local = t - stepStart;

  const cvT = isLast ? local - 10 : -1;
  const cv = clamp01(cvT / 36);
  const cvE = cubicInOut(cv);
  const newLeft = LEFT_EDGE + (MERGED_LEFT - LEFT_EDGE) * cvE;
  const wordRight = RIGHT_EDGE + (MERGED_RIGHT - RIGHT_EDGE) * cvE;
  const converged = cv >= 1;

  const subT = converged ? cvT - 36 - 18 : -1;
  const subOp = clamp01(subT / 4);

  const font: CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontWeight: 500,
    fontSize: FS,
    letterSpacing: LSP,
    color: "var(--ink)",
    whiteSpace: "nowrap",
    lineHeight: 1,
  };

  return (
    <div className="preview-frame">
      <PreviewChrome index="11" name="COLUMN CONVERGE" />
      <SidePanel side={side} width={W} align="center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: side === "right" ? "flex-end" : "flex-start" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.4em", color: "var(--ink-dim)", marginBottom: 52, whiteSpace: "nowrap" }}>
            SHOT CARD · COLUMN CONVERGE
          </div>
          <div style={{ position: "relative", width: W, height: 90 }}>
            <div style={{ ...font, position: "absolute", left: newLeft, top: 0 }}>
              {leftWord}
            </div>
            <div style={{ ...font, position: "absolute", right: W - wordRight, top: 0, color: "var(--accent)" }}>
              {cur.word}
            </div>
            <div
              style={{
                ...font,
                fontStyle: "italic",
                color: "var(--ink-dim)",
                position: "absolute",
                left: MERGED_LEFT,
                top: FS + 20,
                opacity: subOp,
                fontSize: 22,
                letterSpacing: 4,
              }}
            >
              {subline}
            </div>
          </div>
          <div style={{ marginTop: 34, width: 88, height: 1, background: "var(--line-strong)", transform: `scaleX(${converged || reduced ? 1 : 0})`, transformOrigin: side === "right" ? "right" : "left", transition: "transform 0.5s ease" }} />
        </div>
      </SidePanel>
    </div>
  );
}
