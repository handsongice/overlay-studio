import type { CSSProperties, ReactNode } from "react";

/* ============================================================
   SidePanel · 统一侧栏容器
   锚定在中央安全区外侧（--sf-l / --sf-r），保证不遮挡人物。
   left   → 面板右缘贴安全区左缘左侧 24px
   right  → 面板左缘贴安全区右缘右侧 24px
   both   → 左右各渲染一版（children 为函数时按 side 分别渲染）
   ============================================================ */

export type PanelSide = "left" | "right" | "both";

interface SidePanelProps {
  side: PanelSide;
  width: number;
  top?: string;
  align?: "center" | "top";
  children: ReactNode | ((side: "left" | "right") => ReactNode);
  style?: CSSProperties;
}

function Panel({
  side,
  width,
  top = "50%",
  align = "center",
  children,
  style,
}: Omit<SidePanelProps, "side" | "children"> & { side: "left" | "right"; children: ReactNode }) {
  return (
    <div
      className={`sp-panel ${side === "right" ? "sp-right" : "sp-left"} ${
        align === "top" ? "sp-align-top" : ""
      }`}
      style={{ "--sp-w": `${width}px`, top, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function SidePanel({
  side,
  width,
  top = "50%",
  align = "center",
  children,
  style,
}: SidePanelProps) {
  const resolve = (s: "left" | "right"): ReactNode =>
    typeof children === "function" ? children(s) : children;
  if (side === "both") {
    return (
      <>
        <Panel side="left" width={width} top={top} align={align} style={style}>
          {resolve("left")}
        </Panel>
        <Panel side="right" width={width} top={top} align={align} style={style}>
          {resolve("right")}
        </Panel>
      </>
    );
  }
  return (
    <Panel side={side} width={width} top={top} align={align} style={style}>
      {resolve(side)}
    </Panel>
  );
}
