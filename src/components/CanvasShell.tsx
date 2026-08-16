import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface CanvasShellProps {
  frameVars?: CSSProperties;
  children: ReactNode;
  onReplay?: () => void;
  hud?: { label: string; sub?: string };
  /** 拖拽落点事件：绑定到 canvas-frame，覆盖卡片上方区域 */
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

/** 1920×1080 等比缩放画布外壳：预览台与组合台共用 */
export function CanvasShell({
  frameVars,
  children,
  onReplay,
  hud,
  onDragOver,
  onDragLeave,
  onDrop,
}: CanvasShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const s = Math.min(rect.width / 1920, rect.height / 1080);
      setScale(Math.max(0.05, Math.min(s, 2)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="stage">
      <div className="stage-center" ref={containerRef}>
        <div className="canvas-scaler" style={{ transform: `scale(${scale})` }}>
          <div
            className="canvas-frame"
            style={frameVars}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {children}
          </div>
        </div>
      </div>
      <div className="stage-hud">
        <div>
          <b>{hud?.label ?? "PREVIEW"}</b> · 1920×1080 · 24 FPS
          {hud?.sub ? ` · ${hud.sub}` : ""}
        </div>
        <div className="stage-hud-right">
          <span>
            SCALE <b>{(scale * 100).toFixed(0)}%</b>
          </span>
          {onReplay && (
            <button className="btn" onClick={onReplay} style={{ pointerEvents: "auto" }}>
              ↻ 重放
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
