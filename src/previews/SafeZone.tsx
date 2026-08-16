/* 中央人物安全区参考层
   仅作取景辅助：不参与动效、不遮挡交互，几何断言直接读它的 rect */

export const SAFE_ZONE = {
  /** 安全区默认宽度（1920 设计坐标） */
  DEFAULT_WIDTH: 780,
  MIN_WIDTH: 560,
  MAX_WIDTH: 920,
  /** 安全区垂直范围：上方给眉标/标题，下方给底部结论留白 */
  TOP: 150,
  BOTTOM: 900,
};

interface SafeZoneProps {
  visible: boolean;
  width: number;
  opacity: number;
}

export function SafeZone({ visible, width, opacity }: SafeZoneProps) {
  const w = Math.round(width);
  const left = Math.round((1920 - w) / 2);
  return (
    <div
      className={`sf-zone${visible ? "" : " sf-off"}`}
      style={{ left, width: w, opacity: visible ? opacity : 0 }}
      data-sf-left={left}
      data-sf-top={SAFE_ZONE.TOP}
      data-sf-bottom={SAFE_ZONE.BOTTOM}
      aria-hidden
    >
      <span className="sf-edge sf-edge-l" />
      <span className="sf-edge sf-edge-r" />
      <span className="sf-label">
        <i />
        <span>SAFE ZONE</span>
        <i />
      </span>
      <span className="sf-person sf-head" />
      <span className="sf-person sf-body" />
    </div>
  );
}
