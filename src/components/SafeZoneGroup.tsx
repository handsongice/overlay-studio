import { SAFE_ZONE } from "../previews/SafeZone";

export interface SafeZoneState {
  visible: boolean;
  width: number;
  opacity: number;
}

interface SafeZoneGroupProps {
  state: SafeZoneState;
  onChange: (patch: Partial<SafeZoneState>) => void;
}

/** 右侧面板顶部的「安全区」全局设置（不随组件切换重置） */
export function SafeZoneGroup({ state, onChange }: SafeZoneGroupProps) {
  return (
    <div className="ctrl-group">
      <div className="ctrl-group-title">安全区</div>
      <div className="ctrl ctrl-toggle">
        <span className="ctrl-label">显示安全区参考（S）</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={state.visible}
            onChange={(e) => onChange({ visible: e.target.checked })}
          />
          <span className="switch-track" />
        </label>
      </div>
      <div className="ctrl">
        <div className="ctrl-head">
          <span className="ctrl-label">安全区宽度</span>
          <span className="ctrl-readout">{state.width}px</span>
        </div>
        <input
          className="range"
          type="range"
          min={SAFE_ZONE.MIN_WIDTH}
          max={SAFE_ZONE.MAX_WIDTH}
          step={10}
          value={state.width}
          onChange={(e) => onChange({ width: Number(e.target.value) })}
        />
      </div>
      <div className="ctrl">
        <div className="ctrl-head">
          <span className="ctrl-label">参考层透明度</span>
          <span className="ctrl-readout">{Math.round(state.opacity * 100)}%</span>
        </div>
        <input
          className="range"
          type="range"
          min={0.2}
          max={1}
          step={0.05}
          value={state.opacity}
          onChange={(e) => onChange({ opacity: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
