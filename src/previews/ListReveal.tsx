import type { PreviewDefinition, Params } from "../types";
import { easeOutBack, lerp, seg, toNumber, toString, useAnimElapsed, usePrefersReducedMotion } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { SidePanel } from "./SidePanel";

/* ============================================================
   ListReveal · 菜单逐项找位（移植自 video-shotcraft 镜头卡 list-reveal）
   垂直菜单项依次 scale + 位移入场（outBack 轻微过冲），
   同时列表容器全程缓慢上移——"整体漂移"与"逐项入场"两层叠加。
   ============================================================ */


export const listRevealDefinition: PreviewDefinition = {
  id: "shot-list-reveal",
  index: "12",
  name: "ListReveal",
  nameEn: "列表找位",
  category: "ui-entrance",
  description: "镜头卡 · list-reveal：菜单逐项 scale 找位 + 整体缓慢漂移",
  controls: [
    { key: "items", label: "列表项", type: "text", section: "文案", defaultValue: "Dashboard, Projects, Analytics, Messages, Settings, Sign out", placeholder: "逗号分隔，2–8 个" },
    { key: "eyebrow", label: "眉题", type: "text", section: "文案", defaultValue: "SHOT CARD · LIST REVEAL" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 3.6, min: 1.8, max: 6, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.25, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    items: "Dashboard, Projects, Analytics, Messages, Settings, Sign out",
    eyebrow: "SHOT CARD · LIST REVEAL",
    side: "left",
    duration: 3.6,
    delay: 0.25,
  },
  component: ListReveal,
};

export function ListReveal({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const itemsRaw = toString(params.items, "Dashboard, Projects, Analytics, Messages, Settings, Sign out");
  const eyebrow = toString(params.eyebrow, "SHOT CARD · LIST REVEAL");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 3.6);
  const delay = toNumber(params.delay, 0.25);

  const items = itemsRaw
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
  const labels = items.length >= 2 ? items : ["Dashboard", "Projects", "Analytics", "Messages", "Settings", "Sign out"];

  const W = 440;
  const ROW_H = 58;
  const GAP = 10;
  const elapsed = useAnimElapsed({ duration: duration + 1.6, delay, disabled: reduced });
  const t = elapsed / duration;

  return (
    <div className="preview-frame">
      <PreviewChrome index="12" name="LIST REVEAL" />
      <SidePanel side={side} width={520} align="center">
        <div style={{ display: "flex", flexDirection: "column", alignItems: side === "right" ? "flex-end" : "flex-start" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.4em", color: "var(--ink-dim)", marginBottom: 46, whiteSpace: "nowrap" }}>
            {eyebrow}
          </div>
          <div
            style={{
              position: "relative",
              width: W,
              display: "flex",
              flexDirection: "column",
              gap: GAP,
              transform: `translateY(${lerp(t, 18, -18)}px)`,
            }}
          >
            {labels.map((s, i) => {
              const p = seg(t, 0.06 + i * 0.09, 0.06 + i * 0.09 + 0.24, easeOutBack);
              const pv = Math.max(0, p);
              return (
                <div
                  key={`${s}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    height: ROW_H,
                    padding: "0 20px",
                    boxSizing: "border-box",
                    borderRadius: 10,
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    opacity: Math.min(1, p * 2.2),
                    transform: `scale(${0.78 + pv * 0.22}) translateY(${lerp(pv, 14, 0)}px)`,
                    transformOrigin: side === "right" ? "right center" : "left center",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      flex: "none",
                      background: "var(--accent)",
                      opacity: 0.9,
                    }}
                  />
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 20, lineHeight: 1, color: "var(--ink)", letterSpacing: "0.01em" }}>
                    {s}
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
