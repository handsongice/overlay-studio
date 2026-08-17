import type { CSSProperties } from "react";
import type { Params } from "./types";

/* ============================================================
   卡片外观覆盖（字体 / 文字色 / 背景色 / 强调·图表色）
   以 __ 前缀参数存进卡片 params，渲染时映射为卡片作用域内的
   CSS 变量覆盖 —— 预览组件全部基于设计令牌取色，一处覆盖全局生效。
   ============================================================ */

export const APPEARANCE_KEYS = [
  "__font",
  "__text",
  "__bg",
  "__accent",
  "__opacity",
  "__panel",
  "__panelOpacity",
] as const;

export interface FontOption {
  value: string;
  label: string;
  stack: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    value: "default",
    label: "系统无衬线（默认）",
    stack: "",
  },
  {
    value: "serif",
    label: "衬线宋体 · 正式",
    stack: `Georgia, "Songti SC", "Noto Serif SC", "Times New Roman", serif`,
  },
  {
    value: "mono",
    label: "等宽字体 · 数码",
    stack: `ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`,
  },
  {
    value: "rounded",
    label: "圆体 · 柔和",
    stack: `"Yuanti SC", "YouYuan", "PingFang SC", system-ui, sans-serif`,
  },
];

/** 把颜色转成带透明度的 color-mix 值 */
function withAlpha(color: string, alpha: number): string {
  const pct = Math.max(0, Math.min(1, alpha)) * 100;
  return `color-mix(in srgb, ${color} ${pct.toFixed(0)}%, transparent)`;
}

/** 根据强调色亮度选择可读的强调色文字（深/浅） */
export function readableInk(accent: string): string {
  const hex = accent.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "#ffffff";
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.55 ? "#0a0a0c" : "#ffffff";
}

export function hasCustomBg(params: Params): boolean {
  const bg = params.__bg;
  return typeof bg === "string" && bg.trim().length > 0;
}

/** 由外观参数构建卡片作用域内的 CSS 变量覆盖 */
export function buildAppearanceStyle(params: Params): CSSProperties {
  const st: Record<string, string> = {};

  const font = String(params.__font ?? "default");
  if (font !== "default") {
    const opt = FONT_OPTIONS.find((f) => f.value === font);
    if (opt?.stack) st["--font-display"] = opt.stack;
  }

  const text = typeof params.__text === "string" ? params.__text.trim() : "";
  if (text) {
    st["--ink"] = text;
    st["--ink-dim"] = withAlpha(text, 0.62);
    st["--ink-soft"] = withAlpha(text, 0.4);
    st["--ink-faint"] = withAlpha(text, 0.14);
    st["--ink-hair"] = withAlpha(text, 0.06);
    // 细线/边框随文字色派生，浅色背景 + 深色文字时仍清晰
    st["--line"] = withAlpha(text, 0.12);
    st["--line-strong"] = withAlpha(text, 0.26);
  }

  const bg = typeof params.__bg === "string" ? params.__bg.trim() : "";
  if (bg) {
    st["--bg"] = bg;
    st["--surface"] = withAlpha(bg, 0.88);
    st["--surface-2"] = withAlpha(bg, 0.94);
  }

  const accent = typeof params.__accent === "string" ? params.__accent.trim() : "";
  if (accent) {
    st["--accent"] = accent;
    st["--accent-ink"] = readableInk(accent);
    st["--accent-soft"] = withAlpha(accent, 0.16);
  }

  // 组件级整体不透明度（0.1–1，默认 1）
  // 始终内联写入（含默认 1），覆盖视频模式下 .compose-has-video
  // 的全局 0.82，让「不透明度」滑杆对组件真正生效。
  const opacity = Math.min(1, Math.max(0.1, Number(params.__opacity ?? 1)));
  st.opacity = String(opacity);

  // 面板底：glass = 半透明深色玻璃（叠加到视频上保证可读），none = 纯透明
  const panel = String(params.__panel ?? "glass");
  const panelAlpha = Math.min(
    1,
    Math.max(0, Number(params.__panelOpacity ?? 0.45)),
  );
  st["--panel-bg"] = "#0a0c11";
  st["--panel-alpha"] = panel === "glass" ? String(panelAlpha) : "0";

  return st as CSSProperties;
}
