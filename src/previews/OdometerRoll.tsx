import type { CSSProperties } from "react";
import type { PreviewDefinition, Params } from "../types";
import {
  cubicOut,
  formatNumber,
  toNumber,
  toString,
  useAnimElapsed,
  usePrefersReducedMotion,
} from "../lib/motion";
import { PreviewChrome } from "./PreviewChrome";

/* ============================================================
   OdometerRoll · 数字滚筒（移植自 video-shotcraft 镜头卡 odometer-digit-roll）
   每个数位一条 0–9 纵列 strip，高速滚动后逐位过冲停稳，
   滚动期叠错帧残影；全部锁定瞬间整体加深脉冲。
   单侧排布，不侵入中央安全区。
   ============================================================ */

const FPS = 30;

export const odometerRollDefinition: PreviewDefinition = {
  id: "shot-odometer-roll",
  index: "05",
  name: "OdometerRoll",
  nameEn: "数字滚筒",
  category: "metric",
  description: "镜头卡 · odometer-digit-roll：数位逐位滚动锁定，残影 + 锁定脉冲",
  controls: [
    { key: "label", label: "指标标签", type: "text", section: "文案", defaultValue: "数据吞吐提升" },
    { key: "value", label: "核心数值", type: "number", section: "数值", defaultValue: 99.98, step: 0.01, min: 0 },
    { key: "decimals", label: "小数位", type: "number", section: "数值", defaultValue: 2, step: 1, min: 0, max: 2 },
    { key: "unit", label: "单位", type: "text", section: "文案", defaultValue: "%" },
    {
      key: "side", label: "排布方位", type: "select", section: "布局", defaultValue: "left",
      options: [
        { value: "left", label: "左侧" },
        { value: "right", label: "右侧" },
      ],
    },
    { key: "duration", label: "动画时长", type: "slider", section: "节奏", defaultValue: 3.2, min: 1, max: 6, step: 0.1, unit: "s" },
    { key: "delay", label: "起始延迟", type: "slider", section: "节奏", defaultValue: 0.25, min: 0, max: 1.5, step: 0.1, unit: "s" },
  ],
  defaults: {
    label: "数据吞吐提升",
    value: 99.98,
    decimals: 2,
    unit: "%",
    side: "left",
    duration: 3.2,
    delay: 0.25,
  },
  component: OdometerRoll,
};

/** 位 i 的 strip 位置（单位：行），时间轴按卡片关键帧缩放 */
function posAt(f: number, i: number, d: number, spin = 0.85): number {
  const s = (20 + i * 7) * (d / 4.7); // 开始减速帧
  const p0 = spin * s;
  const T = Math.ceil((p0 + 6 - d) / 10) * 10 + d;
  if (f < s) return spin * Math.max(f, 0);
  if (f < s + 16) {
    const u = (f - s) / 16;
    return p0 + (T + 0.5 - p0) * cubicOut(u);
  }
  if (f < s + 22) {
    const u = (f - s - 16) / 6;
    return T + 0.5 - 0.5 * cubicOut(u);
  }
  return T;
}

function Strip({
  pos,
  row,
  digitW,
  fontSize,
  color,
  opacity = 1,
  dy = 0,
}: {
  pos: number;
  row: number;
  digitW: number;
  fontSize: number;
  color: string;
  opacity?: number;
  dy?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: digitW,
        transform: `translateY(${-(pos % 10) * row + dy}px)`,
        opacity,
      }}
    >
      {Array.from({ length: 20 }).map((_, k) => (
        <div
          key={k}
          style={{
            width: digitW,
            height: row,
            lineHeight: `${row}px`,
            textAlign: "center",
            fontSize: `calc(${fontSize}px * var(--fs, 1))`,
            fontWeight: "calc(700 * var(--fw, 1))",
            fontVariantNumeric: "tabular-nums",
            color,
          }}
        >
          {k % 10}
        </div>
      ))}
    </div>
  );
}

function DigitReel({
  frame,
  i,
  target,
  row,
  digitW,
  fontSize,
  color,
}: {
  frame: number;
  i: number;
  target: number;
  row: number;
  digitW: number;
  fontSize: number;
  color: string;
}) {
  const pos = posAt(frame, i, target, 0.85);
  const speed = Math.abs(pos - posAt(frame - 1, i, target, 0.85));
  const gate = Math.min(Math.max((speed - 0.06) / 0.44, 0), 1);
  return (
    <div
      style={{
        position: "relative",
        width: digitW,
        height: row,
        overflow: "hidden",
        flex: "none",
      }}
    >
      {gate > 0.001 && (
        <>
          <Strip pos={pos} row={row} digitW={digitW} fontSize={fontSize} color={color} opacity={0.25 * gate} dy={row * 0.5} />
          <Strip pos={pos} row={row} digitW={digitW} fontSize={fontSize} color={color} opacity={0.12 * gate} dy={-row * 0.5} />
        </>
      )}
      <Strip pos={pos} row={row} digitW={digitW} fontSize={fontSize} color={color} />
    </div>
  );
}

function StaticGlyph({
  ch,
  row,
  fontSize,
  color,
  w,
}: {
  ch: string;
  row: number;
  fontSize: number;
  color: string;
  w: number;
}) {
  return (
    <div
      style={{
        width: w,
        height: row,
        lineHeight: `${row}px`,
        textAlign: "center",
        fontSize: `calc(${fontSize}px * var(--fs, 1))`,
        fontWeight: "calc(700 * var(--fw, 1))",
        fontVariantNumeric: "tabular-nums",
        color,
        flex: "none",
      }}
    >
      {ch}
    </div>
  );
}

export function OdometerRoll({ params }: { params: Params }) {
  const reduced = usePrefersReducedMotion();
  const label = toString(params.label, "数据吞吐提升");
  const value = toNumber(params.value, 99.98);
  const decimals = Math.min(2, Math.max(0, toNumber(params.decimals, 2)));
  const unit = toString(params.unit, "%");
  const side = toString(params.side, "left") === "right" ? "right" : "left";
  const duration = toNumber(params.duration, 3.2);
  const delay = toNumber(params.delay, 0.25);

  const elapsed = useAnimElapsed({ duration: duration + 1.2, delay, disabled: reduced });
  const frame = elapsed * FPS;

  const text = formatNumber(value, decimals);
  const chars = text.split("");
  const rolling: number[] = [];
  for (const ch of chars) if (ch >= "0" && ch <= "9") rolling.push(Number(ch));

  // 宽度自适应：数位多则收缩字号
  const digitCount = rolling.length;
  const staticCount = chars.length - digitCount;
  const blockW = 470;
  const digitW = Math.min(72, Math.floor((blockW - 20 - staticCount * 44) / Math.max(digitCount, 1)));
  const fontSize = digitW * 1.55;
  const row = Math.ceil(fontSize * 1.12);

  // 全部锁定帧（最后一个数位锁定）+ 脉冲
  const lockF = (20 + (digitCount - 1) * 7 + 22) * (duration / 4.7);
  const pulseDelay = lockF / FPS + delay + 0.12;
  const color = "var(--ink)";

  return (
    <div className={`preview-frame pf-odometer ${side === "right" ? "od-side-right" : ""}`}>
      <PreviewChrome index="05" name="ODOMETER ROLL" />
      <div className="od-content">
        <div className="od-eyebrow">SHOT CARD · ODOMETER</div>
        <div
          className="od-digits"
          style={
            {
              "--pd": `${pulseDelay}s`,
            } as CSSProperties
          }
        >
          {chars.map((ch, i) => {
            if (ch >= "0" && ch <= "9") {
              const target = Number(ch);
              const digitIndex = chars.slice(0, i).filter((c) => c >= "0" && c <= "9").length;
              return reduced ? (
                <StaticGlyph key={i} ch={ch} row={row} fontSize={fontSize} color={color} w={digitW} />
              ) : (
                <DigitReel
                  key={i}
                  frame={frame}
                  i={digitIndex}
                  target={target}
                  row={row}
                  digitW={digitW}
                  fontSize={fontSize}
                  color={color}
                />
              );
            }
            return (
              <StaticGlyph key={i} ch={ch} row={row} fontSize={fontSize} color={color} w={44} />
            );
          })}
          {unit && (
            <StaticGlyph ch={unit} row={row} fontSize={fontSize * 0.62} color="var(--ink-dim)" w={54} />
          )}
        </div>
        <div className="od-rule" />
        <div className="od-label">
          <i />
          {label}
        </div>
      </div>
    </div>
  );
}
