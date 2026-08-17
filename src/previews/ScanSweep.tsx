import type { CSSProperties } from "react";
import type { PreviewDefinition, Params } from "../types";
import { clamp01, cubicOut, easeInOutSine, easeLinear, seg, toNumber, toString, useAnimElapsed, usePrefersReducedMotion } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { SidePanel } from "./SidePanel";

/* ============================================================
   ScanSweep · 取景括号扫描（移植自 video-shotcraft 镜头卡 scan-bracket-sweep）
   骨架文档弹入落位 → 四角 L 形取景括号依次落下 → 扫描光带往复 5 趟
   两端慢中间快。文档本身完全静止——"这份东西正在被机器逐行读过"。
   ============================================================ */

const BASE_DUR = 5.0; // 基准 5.0s（150f）

export const scanSweepDefinition: PreviewDefinition = {
  id: "shot-scan-sweep",
  index: "13",
  name: "ScanSweep",
  nameEn: "取景扫描",
  category: "ui-entrance",
  description: "镜头卡 · scan-bracket-sweep：四角括号落位 + 扫描光带往复 5 趟",
  controls: [
    { key: "caption", label: "说明文案", type: "text", section: "文案", defaultValue: "SCANNING DOCUMENT…" },
    { key: "eyebrow", label: "眉题", type: "text", section: "文案", defaultValue: "SHOT CARD · SCAN BRACKET" },
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
    caption: "SCANNING DOCUMENT…",
    eyebrow: "SHOT CARD · SCAN BRACKET",
    side: "left",
    duration: 5,
    delay: 0.25,
  },
  component: ScanSweep,
};

// 骨架文档（4 列 × 7 行，确定性布局）
const COLS = 4;
const rand = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

export function ScanSweep({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const caption = toString(params.caption, "SCANNING DOCUMENT…");
  const eyebrow = toString(params.eyebrow, "SHOT CARD · SCAN BRACKET");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 5);
  const delay = toNumber(params.delay, 0.25);

  const W = 520;
  const DW = 480;
  const DH = 300;
  const DX = (W - DW) / 2;
  const DY = 0;
  const COL_W = (DW - 28 - (COLS - 1) * 10) / COLS;

  const elapsed = useAnimElapsed({ duration: duration + 1.6, delay, disabled: reduced });
  const t = elapsed / duration;
  const F = (n: number) => n / BASE_DUR;

  // 文档弹入
  const dp = seg(t, 0, F(16.5), cubicOut);
  // 扫描往复：5 趟，末尾留 12% 停顿
  const sp = seg(t, F(25.5), F(142.5), easeLinear);
  const PASSES = 5;
  const raw = sp * PASSES;
  const pi = Math.min(PASSES - 1, Math.floor(raw));
  const local = clamp01((raw - pi) / 0.88);
  const dir = pi % 2 === 0 ? 1 : -1;
  const prog = easeInOutSine(local);
  const y = dir > 0 ? prog * DH : DH - prog * DH;
  const clipOp = seg(t, F(24), F(30)) * (1 - seg(t, F(139.5), F(148.5)));

  const CS = 30; // 取景括号尺寸

  return (
    <div className="preview-frame">
      <PreviewChrome index="13" name="SCAN BRACKET" />
      <SidePanel side={side} width={W} align="center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: side === "right" ? "flex-end" : "flex-start" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "calc(13px * var(--fs, 1))", letterSpacing: "0.4em", color: "var(--ink-dim)", marginBottom: 26, whiteSpace: "nowrap" }}>
            {eyebrow}
          </div>

          <div style={{ position: "relative", width: W, height: DH + 60 }}>
            {/* 文档 holder */}
            <div style={{ position: "absolute", left: DX, top: DY + 30, width: DW, height: DH }}>
              {/* 骨架文档 */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: DW,
                  height: DH,
                  boxSizing: "border-box",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  overflow: "hidden",
                  transformOrigin: "50% 50%",
                  transform: `scale(${0.86 + dp * 0.14})`,
                  opacity: reduced ? 1 : clamp01(dp * 3),
                }}
              >
                <div style={{ position: "absolute", left: 22, top: 20, width: DW * 0.34, height: 9, borderRadius: 4, background: "var(--ink)", opacity: 0.85 }} />
                <div style={{ position: "absolute", left: 22, top: 40, width: DW * 0.2, height: 6, borderRadius: 3, background: "var(--ink-soft)" }} />
                {Array.from({ length: COLS }, (_, c) => (
                  <div key={c}>
                    <div style={{ position: "absolute", left: 22 + c * (COL_W + 10), top: 70, width: COL_W * 0.72, height: 8, borderRadius: 4, background: "var(--ink-dim)", opacity: 0.8 }} />
                    {Array.from({ length: 7 }, (_, r) => (
                      <div
                        key={r}
                        style={{
                          position: "absolute",
                          left: 22 + c * (COL_W + 10),
                          top: 92 + r * 22,
                          width: COL_W * (0.55 + rand(c * 13 + r * 7) * 0.45),
                          height: 7,
                          borderRadius: 3.5,
                          background: "var(--ink-soft)",
                          opacity: 0.55,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* 扫描光带 */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: DW,
                  height: DH,
                  borderRadius: 12,
                  overflow: "hidden",
                  pointerEvents: "none",
                  opacity: reduced ? 0 : clipOp,
                }}
              >
                <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 0, transform: `translateY(${y}px)` }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      height: 110,
                      top: dir > 0 ? -110 : 2.5,
                      background:
                        dir > 0
                          ? "linear-gradient(180deg, color-mix(in srgb, var(--accent) 0%, transparent), color-mix(in srgb, var(--accent) 34%, transparent))"
                          : "linear-gradient(180deg, color-mix(in srgb, var(--accent) 34%, transparent), color-mix(in srgb, var(--accent) 0%, transparent))",
                    }}
                  />
                  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2.5, background: "var(--accent)" }} />
                </div>
              </div>

              {/* 四角取景括号 */}
              {(
                [
                  { pos: { left: -8, top: -8, borderLeft: "2px solid var(--accent)", borderTop: "2px solid var(--accent)" }, dx: 1, dy: 1 },
                  { pos: { right: -8, top: -8, borderRight: "2px solid var(--accent)", borderTop: "2px solid var(--accent)" }, dx: -1, dy: 1 },
                  { pos: { right: -8, bottom: -8, borderRight: "2px solid var(--accent)", borderBottom: "2px solid var(--accent)" }, dx: -1, dy: -1 },
                  { pos: { left: -8, bottom: -8, borderLeft: "2px solid var(--accent)", borderBottom: "2px solid var(--accent)" }, dx: 1, dy: -1 },
                ] as { pos: CSSProperties; dx: number; dy: number }[]
              ).map((c, i) => {
                const p = seg(t, F(12) + i * F(3.3), F(12) + i * F(3.3) + F(8.25), cubicOut);
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      width: CS,
                      height: CS,
                      boxSizing: "border-box",
                      opacity: p,
                      transform: `translate(${(1 - p) * 8 * c.dx}px,${(1 - p) * 8 * c.dy}px)`,
                      ...c.pos,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12, fontFamily: "var(--font-mono)", fontSize: "calc(12px * var(--fs, 1))", letterSpacing: "0.3em", color: "var(--ink-dim)" }}>
            <i style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
            {caption}
          </div>
        </div>
      </SidePanel>
    </div>
  );
}
