import type { PreviewDefinition, Params } from "../types";
import {
  delayVar,
  formatNumber,
  toNumber,
  toString,
  useCountUp,
  usePrefersReducedMotion,
} from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";

export const compareSplitDefinition: PreviewDefinition = {
  id: "compare-split",
  index: "02",
  name: "CompareSplit",
  nameEn: "左右对比卡",
  category: "compare",
  description: "A/B 分居两侧、中间完全留空、双数字滚动 — 对比型叙事",
  controls: [
    { key: "leftLabel", label: "左侧标签", type: "text", section: "文案", defaultValue: "传统方案" },
    { key: "leftValue", label: "左侧数值", type: "number", section: "数值", defaultValue: 24, step: 1, min: 0 },
    { key: "leftUnit", label: "左侧单位", type: "text", section: "文案", defaultValue: "HRS", placeholder: "单位" },
    { key: "leftDesc", label: "左侧说明", type: "text", section: "文案", defaultValue: "单条视频的制作周期", multiline: true },
    { key: "rightLabel", label: "右侧标签", type: "text", section: "文案", defaultValue: "动效模板" },
    { key: "rightValue", label: "右侧数值", type: "number", section: "数值", defaultValue: 6, step: 1, min: 0 },
    { key: "rightUnit", label: "右侧单位", type: "text", section: "文案", defaultValue: "HRS", placeholder: "单位" },
    { key: "rightDesc", label: "右侧说明", type: "text", section: "文案", defaultValue: "参数化组件，直接复用", multiline: true },
    { key: "deltaText", label: "底部结论", type: "text", section: "文案", defaultValue: "效率提升 4×" },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 1.6, min: 0.4, max: 3.2, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.2, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    leftLabel: "传统方案",
    leftValue: 24,
    leftUnit: "HRS",
    leftDesc: "单条视频的制作周期",
    rightLabel: "动效模板",
    rightValue: 6,
    rightUnit: "HRS",
    rightDesc: "参数化组件，直接复用",
    deltaText: "效率提升 4×",
    duration: 1.6,
    delay: 0.2,
  },
  component: CompareSplit,
};

export function CompareSplit({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const leftLabel = toString(params.leftLabel, "传统方案");
  const leftValue = toNumber(params.leftValue, 0);
  const leftUnit = toString(params.leftUnit, "HRS");
  const leftDesc = toString(params.leftDesc, "");
  const rightLabel = toString(params.rightLabel, "动效模板");
  const rightValue = toNumber(params.rightValue, 0);
  const rightUnit = toString(params.rightUnit, "HRS");
  const rightDesc = toString(params.rightDesc, "");
  const deltaText = toString(params.deltaText, "效率提升 4×");
  const duration = toNumber(params.duration, 1.6);
  const delay = toNumber(params.delay, 0.2);

  const leftDisplay = useCountUp(leftValue, {
    duration,
    delay: reduced ? 0 : delay + 0.4,
    disabled: reduced,
  });
  const rightDisplay = useCountUp(rightValue, {
    duration,
    delay: reduced ? 0 : delay + 0.52,
    disabled: reduced,
  });

  const leftText = formatNumber(leftDisplay);
  const rightText = formatNumber(rightDisplay);
  // 侧栏宽度 400px：按字符数收缩，防止大数值侵入中央安全区
  const leftFont = Math.min(100, Math.floor(330 / Math.max(leftText.length * 0.5 + (leftUnit ? leftUnit.length * 0.6 + 0.6 : 0), 1)));
  const rightFont = Math.min(100, Math.floor(330 / Math.max(rightText.length * 0.5 + (rightUnit ? rightUnit.length * 0.6 + 0.6 : 0), 1)));

  return (
    <div className="preview-frame pf-compare">
      <PreviewChrome index="02" name="COMPARE SPLIT" />
      <div className="cs-side cs-left" style={delayVar(delay + 0.1)}>
        <div className="cs-eyebrow">
          <span className="cs-tag">A</span>
          <span>{leftLabel}</span>
        </div>
        <div className="cs-number">
          <span className="cs-value" style={{ fontSize: `calc(${leftFont}px * var(--fs, 1))` }}>{leftText}</span>
          {leftUnit && <span className="cs-unit">{leftUnit}</span>}
        </div>
        <div className="cs-desc">{leftDesc}</div>
      </div>
      <div className="cs-side cs-right" style={delayVar(delay + 0.22)}>
        <div className="cs-eyebrow">
          <span className="cs-tag">B</span>
          <span>{rightLabel}</span>
        </div>
        <div className="cs-number">
          <span className="cs-value" style={{ fontSize: `calc(${rightFont}px * var(--fs, 1))` }}>{rightText}</span>
          {rightUnit && <span className="cs-unit">{rightUnit}</span>}
        </div>
        <div className="cs-desc">{rightDesc}</div>
      </div>
      <div className="cs-delta" style={delayVar(delay + 0.9)}>
        <span className="cs-delta-line" />
        <span>{deltaText}</span>
        <span className="cs-delta-line" />
      </div>
    </div>
  );
}
