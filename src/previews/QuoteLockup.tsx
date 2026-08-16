import type { PreviewDefinition, Params } from "../types";
import { delayVar, toBool, toNumber, toString } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";

export const quoteLockupDefinition: PreviewDefinition = {
  id: "quote-lockup",
  index: "03",
  name: "QuoteLockup",
  nameEn: "金句定格卡",
  category: "typography",
  description: "逐行上浮的金句、细线收尾、克制署名 — 定格叙事",
  controls: [
    {
      key: "quote",
      label: "金句文案（换行分段）",
      type: "text",
      section: "文案",
      defaultValue: "好的设计，\n是让复杂消失。",
      multiline: true,
    },
    { key: "author", label: "署名", type: "text", section: "文案", defaultValue: "乔纳森·艾维" },
    { key: "role", label: "头衔 / 出处", type: "text", section: "文案", defaultValue: "JONY IVE · APPLE" },
    { key: "alignment", label: "对齐方式", type: "select", section: "布局", defaultValue: "left", options: [
      { value: "left", label: "左对齐（推荐）" },
      { value: "center", label: "居中" },
    ]},
    { key: "showIndex", label: "显示序号", type: "toggle", section: "布局", defaultValue: true },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 1.4, min: 0.4, max: 3.2, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.2, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    quote: "好的设计，\n是让复杂消失。",
    author: "乔纳森·艾维",
    role: "JONY IVE · APPLE",
    alignment: "left",
    showIndex: true,
    duration: 1.4,
    delay: 0.2,
  },
  component: QuoteLockup,
};

export function QuoteLockup({ params }: { params: Params }) {
  const quote = toString(params.quote, "好的设计，\n是让复杂消失。");
  const author = toString(params.author, "乔纳森·艾维");
  const role = toString(params.role, "JONY IVE · APPLE");
  const alignment = toString(params.alignment, "left") === "center" ? "center" : "left";
  const showIndex = toBool(params.showIndex, true);
  const duration = toNumber(params.duration, 1.4);
  const delay = toNumber(params.delay, 0.2);

  const lines = quote.split("\n").filter((l) => l.trim() !== "");
  const lineStep = 0.16;
  const baseDelay = delay + 0.12;

  return (
    <div className="preview-frame pf-quote">
      <PreviewChrome index="03" name="QUOTE LOCKUP" />
      <div className="ql-edge" style={delayVar(delay + 0.05)} />
      <div className={`ql-content ql-${alignment}`}>
        {showIndex && (
          <div className="ql-eyebrow" style={delayVar(baseDelay)}>
            <span>Q·01 — PRINCIPLE</span>
          </div>
        )}
        <div className="ql-lines">
          {lines.map((line, i) => (
            <div className="ql-line" key={i}>
              <span
                className="ql-line-inner"
                style={{
                  ...delayVar(baseDelay + 0.08 + i * lineStep),
                  animationDuration: `${Math.min(0.95, duration * 0.6)}s`,
                }}
              >
                <span className="ql-text">{line}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="ql-rule" style={delayVar(baseDelay + 0.1 + lines.length * lineStep)} />
        <div
          className="ql-attrib"
          style={delayVar(baseDelay + 0.24 + lines.length * lineStep)}
        >
          <span className="ql-author">{author}</span>
          <span className="ql-role">{role}</span>
        </div>
      </div>
    </div>
  );
}
