import type { PreviewDefinition, Params } from "../types";
import {
  cubicInOut,
  cubicOut,
  toNumber,
  toString,
  useAnimElapsed,
  usePrefersReducedMotion,
} from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";

/* ============================================================
   ScrubCompare · 对比拉杆（移植自 video-shotcraft 镜头卡 before-after-slider-scrub）
   前后两版叠放：分割杆先快甩后慢扫，杆过处新版"显影"揭出。
   速度对比就是节奏：快甩宣告"变了"，慢扫证明"变在哪"。
   ============================================================ */

const FPS = 30;
const BASE_FRAMES = 120; // 卡片基准 4s @30fps

export const scrubCompareDefinition: PreviewDefinition = {
  id: "shot-scrub-compare",
  index: "06",
  name: "ScrubCompare",
  nameEn: "对比拉杆",
  category: "compare",
  description: "镜头卡 · before-after-slider-scrub：快甩慢扫 + clip 显影对比",
  controls: [
    { key: "beforeLabel", label: "处理前标签", type: "text", section: "文案", defaultValue: "BEFORE" },
    { key: "afterLabel", label: "处理后标签", type: "text", section: "文案", defaultValue: "AFTER" },
    { key: "caption", label: "说明文案", type: "text", section: "文案", defaultValue: "AI 增强 · 一键对比" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 4, min: 1.6, max: 7, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.25, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    beforeLabel: "BEFORE",
    afterLabel: "AFTER",
    caption: "AI 增强 · 一键对比",
    side: "left",
    duration: 4,
    delay: 0.25,
  },
  component: ScrubCompare,
};

/** 杆位置 %（按卡片关键帧：静置→快甩→回弹→停顿→慢扫→定格） */
function posAt(f: number, scale: number): number {
  const s = (n: number) => n * scale;
  if (f < s(14)) return 8;
  if (f < s(26)) return 8 + (76 - 8) * cubicOut((f - s(14)) / s(12));
  if (f < s(38)) return 76 - (76 - 70) * cubicInOut((f - s(26)) / s(12));
  if (f < s(56)) return 70;
  if (f < s(104)) return 70 - (70 - 40) * cubicInOut((f - s(56)) / s(48));
  return 40;
}

/** 黑白灰版假仪表盘：BEFORE 用低对比灰蒙，AFTER 用清晰版 */
function FakeDash({ dim }: { dim: boolean }) {
  const bars = [42, 66, 38, 78, 54, 88, 46, 70];
  return (
    <div className={`sc-dash${dim ? " sc-dash-dim" : ""}`}>
      <div className="sc-dash-head">
        <i />
        <i />
        <i />
        <span />
      </div>
      <div className="sc-dash-title">
        <b />
        <b />
      </div>
      <div className="sc-dash-chart">
        <div className="sc-dash-axis">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="sc-dash-bars">
          {bars.map((h, i) => (
            <i
              key={i}
              style={{ height: `${h}%`, ...(i === 5 ? { background: "var(--accent)" } : {}) }}
            />
          ))}
        </div>
        <div className="sc-dash-line" />
      </div>
      <div className="sc-dash-rows">
        <i />
        <i />
      </div>
    </div>
  );
}

export function ScrubCompare({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const beforeLabel = toString(params.beforeLabel, "BEFORE");
  const afterLabel = toString(params.afterLabel, "AFTER");
  const caption = toString(params.caption, "AI 增强 · 一键对比");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 4);
  const delay = toNumber(params.delay, 0.25);

  const elapsed = useAnimElapsed({ duration: duration + 1.4, delay, disabled: reduced });
  const frame = elapsed * FPS;
  const scale = duration / (BASE_FRAMES / FPS);
  const p = reduced ? 40 : posAt(frame, scale);
  const x = (p / 100) * 470;

  // 手柄速度差分挤压
  const v = reduced ? 0 : Math.abs(posAt(frame, scale) - posAt(frame - 1, scale));
  const squish = 1 + Math.min(v / 8, 1) * 0.16;

  return (
    <div className={`preview-frame pf-scrub ${side === "right" ? "sc-side-right" : ""}`}>
      <PreviewChrome index="06" name="SCRUB COMPARE" />
      <div className="sc-content">
        <div className="sc-eyebrow">SHOT CARD · BEFORE / AFTER</div>
        <div className="sc-caption">{caption}</div>

        <div className="sc-card">
          {/* before：低对比灰蒙 */}
          <div className="sc-before">
            <FakeDash dim />
            <span className="sc-veil" />
          </div>
          {/* after：清晰版，杆左侧揭出 */}
          <div
            className="sc-after"
            style={{ clipPath: `inset(0 ${470 - x}px 0 0)` }}
          >
            <FakeDash dim={false} />
          </div>

          {/* 分割杆 + 手柄 */}
          <div className="sc-divider" style={{ left: x - 3 }} />
          <div
            className="sc-handle"
            style={{ left: x - 22, transform: `scaleX(${squish})` }}
          >
            <i className="sc-chev-l" />
            <i className="sc-chev-r" />
          </div>

          <span className="sc-tag sc-tag-before">{beforeLabel}</span>
          <span className="sc-tag sc-tag-after">{afterLabel}</span>
        </div>
      </div>
    </div>
  );
}
