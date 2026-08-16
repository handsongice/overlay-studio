import type { PreviewDefinition, Params } from "../types";
import {
  delayVar,
  formatNumber,
  toBool,
  toNumber,
  toString,
  useCountUp,
  usePrefersReducedMotion,
} from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";

export const metricFocusDefinition: PreviewDefinition = {
  id: "metric-focus",
  index: "01",
  name: "MetricFocus",
  nameEn: "核心数字动效",
  category: "metric",
  description: "大数字单侧滚动、副数据对侧竖排、弱化幽灵数字 — 中央留给人物",
  controls: [
    { key: "label", label: "指标标签", type: "text", section: "文案", defaultValue: "月度活跃用户" },
    { key: "unit", label: "单位", type: "text", section: "文案", defaultValue: "", placeholder: "单位，如 M" },
    { key: "value", label: "核心数值", type: "number", section: "数值", defaultValue: 1284593, step: 1000, min: 0 },
    { key: "decimals", label: "小数位", type: "number", section: "数值", defaultValue: 0, step: 1, min: 0, max: 2 },
    { key: "showStats", label: "显示辅助数据", type: "toggle", section: "布局", defaultValue: true },
    { key: "statALabel", label: "辅助数据 A · 标签", type: "text", section: "文案", defaultValue: "同比增速" },
    { key: "statAValue", label: "辅助数据 A · 数值", type: "text", section: "文案", defaultValue: "+38.2%" },
    { key: "statBLabel", label: "辅助数据 B · 标签", type: "text", section: "文案", defaultValue: "覆盖市场" },
    { key: "statBValue", label: "辅助数据 B · 数值", type: "text", section: "文案", defaultValue: "24" },
    {
      key: "side", label: "主内容方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 1.6, min: 0.4, max: 3.2, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.2, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    label: "月度活跃用户",
    unit: "",
    value: 1284593,
    decimals: 0,
    showStats: true,
    statALabel: "同比增速",
    statAValue: "+38.2%",
    statBLabel: "覆盖市场",
    statBValue: "24",
    side: "left",
    duration: 1.6,
    delay: 0.2,
  },
  component: MetricFocus,
};

export function MetricFocus({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const label = toString(params.label, "月度活跃用户");
  const unit = toString(params.unit, "");
  const value = toNumber(params.value, 0);
  const decimals = toNumber(params.decimals, 0);
  const duration = toNumber(params.duration, 1.6);
  const delay = toNumber(params.delay, 0.2);
  const showStats = toBool(params.showStats, true);
  const statALabel = toString(params.statALabel, "同比增速");
  const statAValue = toString(params.statAValue, "+38.2%");
  const statBLabel = toString(params.statBLabel, "覆盖市场");
  const statBValue = toString(params.statBValue, "24");
  const side = toString(params.side, "left") === "right" ? "right" : "left";

  const display = useCountUp(value, {
    duration,
    delay: reduced ? 0 : delay + 0.25,
    decimals,
    disabled: reduced,
  });

  const text = formatNumber(display, decimals);
  const ghostText = formatNumber(value, decimals) + unit;

  // 侧栏宽度 470px：按字符数收缩字号，保证不侵入中央安全区
  const valueLen = text.length;
  const unitLen = unit.length;
  const numFont = Math.max(
    64,
    Math.min(118, Math.floor(462 / Math.max(valueLen * 0.5 + unitLen * 0.62, 1))),
  );
  // 底部水印幽灵数字：位于安全区垂直范围（150–900）之外，随字号收缩防溢出
  const ghostFont = Math.min(96, Math.floor(1500 / Math.max(valueLen * 0.5 + unitLen * 0.62, 1)));

  return (
    <div className={`preview-frame pf-metric ${side === "right" ? "mf-side-right" : ""}`}>
      <PreviewChrome index="01" name="METRIC FOCUS" />
      <div
        className="mf-ghost"
        style={{ fontSize: ghostFont, ...delayVar(delay + 0.3) }}
      >
        {ghostText}
      </div>
      <div className="mf-content">
        <div className="mf-eyebrow" style={delayVar(delay + 0.05)}>
          <span className="mf-eyebrow-line" />
          <span>{label}</span>
        </div>
        <div className="mf-number" style={delayVar(delay + 0.15)}>
          <span className="mf-value" style={{ fontSize: numFont }}>{text}</span>
          {unit && (
            <span className="mf-unit" style={{ fontSize: Math.round(numFont * 0.32) }}>
              {unit}
            </span>
          )}
        </div>
        <div className="mf-divider" style={delayVar(delay + 0.4)} />
      </div>
      {showStats && (
        <div className="mf-stats">
          <div className="mf-stat" style={delayVar(delay + 0.55)}>
            <span className="mf-stat-label">{statALabel}</span>
            <span className="mf-stat-value">{statAValue}</span>
          </div>
          <div className="mf-stat" style={delayVar(delay + 0.7)}>
            <span className="mf-stat-label">{statBLabel}</span>
            <span className="mf-stat-value">{statBValue}</span>
          </div>
        </div>
      )}
    </div>
  );
}
