import type { PreviewDefinition, Params } from "../types";
import { easeInOutQuad, easeOutBack, seg, toNumber, toString, useAnimElapsed, usePrefersReducedMotion } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { SidePanel } from "./SidePanel";

/* ============================================================
   BraceExpand · 括号拉幕（移植自 video-shotcraft 镜头卡 brace-expand）
   一对花括号小字号出现 → 带轻微过冲向左右滑开并放大，
   文字 clip 宽度严格绑括号间距，像被拉开幕布般揭示。
   落定后字距细微松弛。代码语感：{ } 框出内容本体。
   ============================================================ */

const BASE_DUR = 3.8; // 基准 3.8s（114f @30fps）

export const braceExpandDefinition: PreviewDefinition = {
  id: "shot-brace-expand",
  index: "08",
  name: "BraceExpand",
  nameEn: "括号拉幕",
  category: "typography",
  description: "镜头卡 · brace-expand：括号滑开 + 文字 clip 绑括号间距揭示",
  controls: [
    { key: "title", label: "标题文字", type: "text", section: "文案", defaultValue: "NEXT GENERATION" },
    { key: "eyebrow", label: "眉题", type: "text", section: "文案", defaultValue: "SHOT CARD · BRACE EXPAND" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 3.8, min: 1.8, max: 6, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.3, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    title: "NEXT GENERATION",
    eyebrow: "SHOT CARD · BRACE EXPAND",
    side: "left",
    duration: 3.8,
    delay: 0.3,
  },
  component: BraceExpand,
};

export function BraceExpand({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const title = toString(params.title, "NEXT GENERATION");
  const eyebrow = toString(params.eyebrow, "SHOT CARD · BRACE EXPAND");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 3.8);
  const delay = toNumber(params.delay, 0.3);

  const W = 520;
  const elapsed = useAnimElapsed({ duration: duration + 1.4, delay, disabled: reduced });
  const t = elapsed / duration;
  const F = (n: number) => n / BASE_DUR; // 关键帧归一化

  const on = t >= F(0.07) ? 1 : 0;
  const ex = seg(t, F(0.13), F(0.34), easeOutBack);
  const sc = 0.6 + ex * 0.4; // 字号同步放大
  const HALF = 214; // 括号最终半距（560 侧栏内）
  const x = HALF * ex * sc;
  const ls = 1 + seg(t, F(0.42), F(0.62), easeInOutQuad) * 1.6; // 字距松弛 1→2.6px

  const fontSize = 40;
  const clipW = Math.max(0, x * 2 - 30);

  return (
    <div className="preview-frame">
      <PreviewChrome index="08" name="BRACE EXPAND" />
      <SidePanel side={side} width={W} align="center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: side === "right" ? "flex-end" : "flex-start" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "calc(13px * var(--fs, 1))", letterSpacing: "0.4em", color: "var(--ink-dim)", marginBottom: 44, whiteSpace: "nowrap" }}>
            {eyebrow}
          </div>

          <div style={{ position: "relative", width: W, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* 文字揭示层：clip 宽度绑括号间距 */}
            <div
              style={{
                position: "absolute",
                left: W / 2,
                top: "50%",
                transform: "translate(-50%,-50%)",
                overflow: "hidden",
                height: 68,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: clipW,
                opacity: on,
              }}
            >
              <div
                style={{
                  fontWeight: "calc(800 * var(--fw, 1))",
                  fontSize: `calc(${fontSize}px * var(--fs, 1))`,
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                  whiteSpace: "nowrap",
                  letterSpacing: `${ls}px`,
                  transform: `scale(${sc})`,
                  lineHeight: 1,
                }}
              >
                {title}
              </div>
            </div>

            {/* 左右花括号 */}
            {["{", "}"].map((ch, i) => (
              <div
                key={ch}
                style={{
                  position: "absolute",
                  left: W / 2,
                  top: "50%",
                  fontWeight: "calc(800 * var(--fw, 1))",
                  fontSize: "calc(44px * var(--fs, 1))",
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                  transform: `translate(-50%,-50%) translateX(${i === 0 ? -x : x}px) scale(${sc})`,
                  opacity: on,
                  lineHeight: 1,
                }}
              >
                {ch}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 30, width: 88, height: 1, background: "color-mix(in srgb, var(--ink) 50%, transparent)", transform: `scaleX(${ex >= 1 || reduced ? 1 : 0})`, transformOrigin: side === "right" ? "right" : "left", transition: "transform 0.5s ease" }} />
        </div>
      </SidePanel>
    </div>
  );
}
