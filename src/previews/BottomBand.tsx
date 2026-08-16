import type { PreviewDefinition, Params } from "../types";
import { toNumber, toString, useCountUp } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { fmtNum, useChartTime } from "./chartkit";

/* ============================================================
   BottomBand · 底部数据带
   横贯安全区下方的细数据带：左侧主指标滚动、右侧副数据错峰、
   底部细进度条。为横版"人物居中 + 动效两侧"预留底部叙事位。
   ============================================================ */

export const bottomBandDefinition: PreviewDefinition = {
  id: "bottom-band",
  index: "22",
  name: "BottomBand",
  nameEn: "底部数据带",
  category: "metric",
  description: "底部横带：主指标滚动 + 副数据错峰 + 细进度条（不挡人物）",
  controls: [
    { key: "label", label: "主指标标签", type: "text", section: "文案", defaultValue: "FY 2025 · ARR" },
    { key: "value", label: "主指标数值", type: "number", section: "数值", defaultValue: 128400000, step: 1000000, min: 0 },
    { key: "unit", label: "单位", type: "text", section: "文案", defaultValue: "$", placeholder: "如 $ / M / %" },
    { key: "stats", label: "副数据（名:值）", type: "text", section: "数值", defaultValue: "新客户:842, 续费率:96%, NPS:72" },
    { key: "progress", label: "进度目标", type: "number", section: "数值", defaultValue: 86, min: 0, max: 100, unit: "%" },
    { key: "progressLabel", label: "进度文案", type: "text", section: "文案", defaultValue: "ANNUAL TARGET" },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 2.6, min: 1, max: 5, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.2, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    label: "FY 2025 · ARR",
    value: 128400000,
    unit: "$",
    stats: "新客户:842, 续费率:96%, NPS:72",
    progress: 86,
    progressLabel: "ANNUAL TARGET",
    duration: 2.6,
    delay: 0.2,
  },
  component: BottomBand,
};

export function BottomBand({ params }: { params: Params }) {
  const duration = toNumber(params.duration, 2.6);
  const delay = toNumber(params.delay, 0.2);
  const { pLin, reduced } = useChartTime(duration, delay);
  const label = toString(params.label, "FY 2025 · ARR");
  const value = toNumber(params.value, 128400000);
  const unit = toString(params.unit, "$");
  const statsRaw = toString(params.stats, "新客户:842, 续费率:96%, NPS:72");
  const progress = Math.min(100, Math.max(0, toNumber(params.progress, 86)));
  const progressLabel = toString(params.progressLabel, "ANNUAL TARGET");

  const statPairs: { name: string; value: string }[] = [];
  for (const part of statsRaw.split(/[,，;；]/)) {
    const m = part.match(/^\s*(.+?)\s*[:：]\s*([^\s]+)\s*$/);
    if (m) statPairs.push({ name: m[1].trim(), value: m[2].trim() });
  }
  while (statPairs.length < 3) statPairs.push({ name: "—", value: "—" });

  const display = useCountUp(value, {
    duration: Math.min(duration, 2),
    delay: 0.15,
    disabled: reduced,
  });
  const shown = `${unit}${fmtNum(Math.round(display))}`;
  const statIn = (i: number) => (reduced ? 1 : Math.max(0, Math.min(1, (pLin - 0.3 - i * 0.12) / 0.3)));
  const barP = reduced ? 1 : pLin;

  return (
    <div className="preview-frame bb-root">
      <PreviewChrome index="22" name="BottomBand" />
      <div className="bb-card">
        <div className="bb-main">
          <div className="bb-label">{label}</div>
          <div className="bb-value">{shown}</div>
        </div>
        <div className="bb-divider" />
        <div className="bb-stats">
          {statPairs.slice(0, 3).map((s, i) => (
            <div key={i} className="bb-stat" style={{ opacity: statIn(i), transform: `translateY(${(1 - statIn(i)) * 12}px)` }}>
              <div className="bb-stat-value">{s.value}</div>
              <div className="bb-stat-name">{s.name}</div>
            </div>
          ))}
        </div>
        <div className="bb-progress">
          <div className="bb-progress-head">
            <span>{progressLabel}</span>
            <span>{Math.round(progress * barP)}%</span>
          </div>
          <div className="bb-track">
            <div className="bb-fill" style={{ width: `${progress * barP}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
