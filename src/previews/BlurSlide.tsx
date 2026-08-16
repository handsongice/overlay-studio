import type { CSSProperties } from "react";
import type { PreviewDefinition, Params } from "../types";
import { delayVar, toNumber, toString, usePrefersReducedMotion } from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";

/* ============================================================
   BlurSlide · 逐词入场（移植自 video-shotcraft 镜头卡 blur-slide）
   标题逐词 y40→0 + blur10→0 + opacity0→1，词间极短 stagger，
   副标题同法跟进 —— "专业文字 reveal"，单侧布局留出中央安全区
   ============================================================ */

export const blurSlideDefinition: PreviewDefinition = {
  id: "shot-blur-slide",
  index: "04",
  name: "BlurSlide",
  nameEn: "逐词入场",
  category: "typography",
  description: "镜头卡 · blur-slide：逐词浮起聚焦，主副标题错峰，单侧排布",
  controls: [
    { key: "headline", label: "主标题", type: "text", section: "文案", defaultValue: "Your headline goes here" },
    { key: "subtitle", label: "副标题", type: "text", section: "文案", defaultValue: "Short supporting subtitle" },
    { key: "eyebrow", label: "眉题", type: "text", section: "文案", defaultValue: "SHOT CARD · BLUR SLIDE" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 2.6, min: 0.8, max: 5, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.2, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    headline: "Your headline goes here",
    subtitle: "Short supporting subtitle",
    eyebrow: "SHOT CARD · BLUR SLIDE",
    side: "left",
    duration: 2.6,
    delay: 0.2,
  },
  component: BlurSlide,
};

function WordLine({
  words,
  start,
  duration,
  gap,
  dy,
  delay,
  className,
}: {
  words: string[];
  start: number;
  duration: number;
  gap: number;
  dy: number;
  delay: number;
  className: string;
}) {
  return (
    <div className={className}>
      {words.map((w, i) => {
        const d = delay + start + i * gap * duration;
        return (
          <span
            key={`${w}-${i}`}
            className="bs-word"
            style={
              {
                "--wd": `${d}s`,
                "--dy": `${dy}px`,
              } as CSSProperties
            }
          >
            {w}
          </span>
        );
      })}
    </div>
  );
}

export function BlurSlide({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const headline = toString(params.headline, "Your headline goes here");
  const subtitle = toString(params.subtitle, "Short supporting subtitle");
  const eyebrow = toString(params.eyebrow, "SHOT CARD · BLUR SLIDE");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 2.6);
  const delay = toNumber(params.delay, 0.2);

  const h1 = headline.split(/\s+/).filter(Boolean);
  const h2 = subtitle.split(/\s+/).filter(Boolean);

  return (
    <div className={`preview-frame pf-blur ${side === "right" ? "bs-side-right" : ""}`}>
      <PreviewChrome index="04" name="BLUR SLIDE" />
      <div className="bs-content" style={delayVar(delay)}>
        <div className="bs-eyebrow">{eyebrow}</div>
        <WordLine
          words={h1}
          start={0.08}
          duration={duration}
          gap={0.055}
          dy={40}
          delay={delay}
          className="bs-headline"
        />
        <WordLine
          words={h2}
          start={0.4}
          duration={duration}
          gap={0.042}
          dy={26}
          delay={delay}
          className="bs-subtitle"
        />
        {!reduced && <div className="bs-rule" />}
      </div>
    </div>
  );
}
