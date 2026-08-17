import type { CSSProperties } from "react";
import type { PreviewDefinition, Params } from "../types";
import { clamp01, easeOutBack, easeOutQuint, seg, toNumber, toString, useAnimElapsed, usePrefersReducedMotion } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { SidePanel } from "./SidePanel";

/* ============================================================
   WordRoll · 竖向词条滚轮（移植自 video-shotcraft 镜头卡 vertical-word-roll-blur-cycle）
   "Built for ___" 句尾换词用竖向滚轮：每步前快后极慢带微过冲，
   相邻行垂直 blur 模拟机械转筒景深；落定瞬间中心词灰→白。
   黑白灰版：强调色改为纯白，保持克制的单色染。
   ============================================================ */


export const wordRollDefinition: PreviewDefinition = {
  id: "shot-word-roll",
  index: "10",
  name: "WordRoll",
  nameEn: "竖向滚轮",
  category: "typography",
  description: "镜头卡 · vertical-word-roll-blur-cycle：句尾换词滚轮 + 景深模糊 + 落定染色",
  controls: [
    { key: "stem", label: "句干", type: "text", section: "文案", defaultValue: "Built for" },
    { key: "words", label: "换词列表", type: "text", section: "文案", defaultValue: "Apps, Teams, Data, Everyone", placeholder: "逗号分隔，2–6 个" },
    { key: "eyebrow", label: "眉题", type: "text", section: "文案", defaultValue: "SHOT CARD · WORD ROLL" },
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
    stem: "Built for",
    words: "Apps, Teams, Data, Everyone",
    eyebrow: "SHOT CARD · WORD ROLL",
    side: "left",
    duration: 5,
    delay: 0.25,
  },
  component: WordRoll,
};

/** 混合缓动：0.7·outQuint + 0.3·outBack（前快后极慢 + 轻微过冲回落） */
const mixed = (u: number) => 0.7 * easeOutQuint(u) + 0.3 * easeOutBack(u);

export function WordRoll({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const stem = toString(params.stem, "Built for");
  const wordsRaw = toString(params.words, "Apps, Teams, Data, Everyone");
  const eyebrow = toString(params.eyebrow, "SHOT CARD · WORD ROLL");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 5);
  const delay = toNumber(params.delay, 0.25);

  const words = wordsRaw
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
  const list = words.length >= 2 ? words : ["Apps", "Teams", "Data", "Everyone"];

  const W = 520;
  const ROW = 58;
  const FONT = 36;
  const STEPS = list.slice(0, -1).map((_, i) => 0.16 + i * 0.2);

  const elapsed = useAnimElapsed({ duration: duration + 1.6, delay, disabled: reduced });
  const t = clamp01(elapsed / duration);

  // 滚轮进度：每步混合缓动累加
  let p = 0;
  for (const s of STEPS) p += seg(t, s, s + 0.11, mixed);

  const fadeOut = 1 - seg(t, 0.9, 0.985) * 0.999;
  const maxWord = [...list].sort((a, b) => b.length - a.length)[0];
  const winW = Math.max(180, maxWord.length * (FONT * 0.62) + 40);

  return (
    <div className="preview-frame">
      <PreviewChrome index="10" name="WORD ROLL" />
      <SidePanel side={side} width={W} align="center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: side === "right" ? "flex-end" : "flex-start" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "calc(13px * var(--fs, 1))", letterSpacing: "0.4em", color: "var(--ink-dim)", marginBottom: 46, whiteSpace: "nowrap" }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, opacity: fadeOut }}>
            <div style={{ fontSize: "calc(34px * var(--fs, 1))", fontWeight: "calc(700 * var(--fw, 1))", color: "var(--ink)", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
              {stem}
            </div>
            {/* 三行高遮罩窗口 */}
            <div style={{ position: "relative", height: ROW * 3, width: winW, overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  transform: `translateY(${ROW - p * ROW}px)`,
                }}
              >
                {list.map((w, i) => {
                  const d = Math.abs(i - p);
                  const blur = d < 1 ? 3 * d : 3 + 2 * Math.min(d - 1, 1);
                  const op = d < 1 ? 1 - 0.65 * d : Math.max(0.1, 0.35 - 0.23 * (d - 1));
                  // 落定染色：中心词从 ink-dim 渐变为 ink（主题感知）
                  const k = clamp01(1 - d * 2.4);
                  const color = `color-mix(in srgb, var(--ink) ${Math.round(k * 100)}%, var(--ink-dim))`;
                  return (
                    <div
                      key={`${w}-${i}`}
                      style={
                        {
                          height: ROW,
                          display: "flex",
                          alignItems: "center",
                          fontSize: `calc(${FONT}px * var(--fs, 1))`,
                          fontWeight: "calc(700 * var(--fw, 1))",
                          letterSpacing: "-0.02em",
                          filter: `blur(${blur.toFixed(2)}px)`,
                          opacity: op,
                          color,
                          whiteSpace: "nowrap",
                        } as CSSProperties
                      }
                    >
                      {w}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 40, width: 88, height: 1, background: "color-mix(in srgb, var(--ink) 50%, transparent)", transform: `scaleX(${reduced || t > 0.88 ? 1 : 0})`, transformOrigin: side === "right" ? "right" : "left", transition: "transform 0.5s ease" }} />
        </div>
      </SidePanel>
    </div>
  );
}
