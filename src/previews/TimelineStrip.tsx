import type { PreviewDefinition, Params } from "../types";
import { toNumber, toString } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";
import { useChartTime } from "./chartkit";

/* ============================================================
   TimelineStrip · 里程碑推进
   底部横带：横向时间线从左向右生长，节点错峰点亮。
   为横版"人物居中"预留底部节奏叙事位。
   ============================================================ */

export const timelineStripDefinition: PreviewDefinition = {
  id: "timeline-strip",
  index: "23",
  name: "TimelineStrip",
  nameEn: "里程碑推进",
  category: "ui-entrance",
  description: "底部横带：时间线生长 + 节点错峰点亮 + 里程碑读数",
  controls: [
    { key: "title", label: "标题", type: "text", section: "文案", defaultValue: "PRODUCT MILESTONES" },
    { key: "subtitle", label: "副标题", type: "text", section: "文案", defaultValue: "2025 · roadmap on track" },
    { key: "milestones", label: "里程碑（名:值）", type: "text", section: "数值", defaultValue: "Launch:01, GA:02, Scale:03, Global:04" },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 3, min: 1.5, max: 6, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.2, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    title: "PRODUCT MILESTONES",
    subtitle: "2025 · roadmap on track",
    milestones: "Launch:01, GA:02, Scale:03, Global:04",
    duration: 3,
    delay: 0.2,
  },
  component: TimelineStrip,
};

export function TimelineStrip({ params }: { params: Params }) {
  const duration = toNumber(params.duration, 3);
  const delay = toNumber(params.delay, 0.2);
  const { pLin, reduced } = useChartTime(duration, delay);
  const title = toString(params.title, "PRODUCT MILESTONES");
  const subtitle = toString(params.subtitle, "2025 · roadmap on track");

  const items: { name: string; value: string }[] = [];
  for (const part of toString(params.milestones, "").split(/[,，;；]/)) {
    const m = part.match(/^\s*(.+?)\s*[:：]\s*([^\s]+)\s*$/);
    if (m) items.push({ name: m[1].trim(), value: m[2].trim() });
  }
  while (items.length < 4) items.push({ name: "—", value: "—" });
  const list = items.slice(0, 4);

  const lineP = reduced ? 1 : pLin;
  const nodeP = (i: number) =>
    reduced ? 1 : Math.max(0, Math.min(1, (pLin - (0.12 + i * 0.16)) / 0.28));

  return (
    <div className="preview-frame tl-root">
      <PreviewChrome index="23" name="TimelineStrip" />
      <div className="tl-card">
        <div className="tl-title">{title}</div>
        <div className="tl-sub">{subtitle}</div>
        <div className="tl-track">
          <div className="tl-line">
            <div className="tl-line-fill" style={{ width: `${lineP * 100}%` }} />
          </div>
          {list.map((it, i) => {
            const p = nodeP(i);
            const x = (i / (list.length - 1)) * 100;
            return (
              <div
                key={i}
                className={`tl-node${p >= 1 ? " on" : ""}`}
                style={{ left: `${x}%`, opacity: 0.25 + 0.75 * p }}
              >
                <div className="tl-node-label">{it.name}</div>
                <div className="tl-node-dot" style={{ transform: `scale(${0.6 + 0.4 * p})` }} />
                <div className="tl-node-value">{it.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
