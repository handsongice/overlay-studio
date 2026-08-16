import { useCallback, useMemo, useRef } from "react";

/* ============================================================
   时间轴 · TIMELINE
   画布下方：项目总时长、播放头（可点击/拖动）、播放控制、
   卡片对象轨道块（start–end 区间，点击选中对应对象）。
   这是 Overlay Studio 的“时间概念”入口：
   拖动播放头定位 → 拖入组件落在当前时间 → 右侧设置消失时间。
   ============================================================ */

export interface TimelineTrackItem {
  id: string;
  label: string;
  /** 出现时间（秒）；undefined = 全程可见 */
  start?: number;
  /** 消失时间（秒）；undefined = 到项目结束 */
  end?: number;
}

interface TimelineBarProps {
  duration: number;
  current: number;
  playing: boolean;
  items: TimelineTrackItem[];
  onSeek: (t: number) => void;
  onTogglePlay: () => void;
  onStop: () => void;
  onSelectItem: (id: string) => void;
}

export function fmtClock(t: number): string {
  if (!Number.isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
}

/** 时间轴刻度步长：目标 8–12 个刻度，取 1/2/5/10/15/30/60 等 */
function niceStep(duration: number): number {
  if (duration <= 12) return 1;
  if (duration <= 30) return 2;
  if (duration <= 60) return 5;
  if (duration <= 120) return 10;
  if (duration <= 300) return 15;
  if (duration <= 600) return 30;
  return 60;
}

export function TimelineBar({
  duration,
  current,
  playing,
  items,
  onSeek,
  onTogglePlay,
  onStop,
  onSelectItem,
}: TimelineBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const dur = Math.max(0.1, duration);
  const t = Math.max(0, Math.min(current, dur));

  const step = useMemo(() => niceStep(dur), [dur]);
  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let v = 0; v <= dur; v += step) out.push(v);
    if (out[out.length - 1] !== dur) out.push(dur);
    return out;
  }, [dur, step]);

  /** 根据指针位置换算时间并 seek */
  const seekFromEvent = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      const next = ratio * dur;
      // 吸附到 0.1s 精度
      onSeek(Math.round(next * 10) / 10);
    },
    [dur, onSeek],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    draggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    seekFromEvent(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    seekFromEvent(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* 忽略 */
    }
  };

  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / dur) * 100))}%`;

  return (
    <div className="timeline">
      <div className="timeline-controls">
        <button
          type="button"
          className="tl-btn"
          onClick={onTogglePlay}
          title={playing ? "暂停" : "播放"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button
          type="button"
          className="tl-btn"
          onClick={onStop}
          title="回到开头"
        >
          ■
        </button>
        <span className="tl-time">{fmtClock(t)}</span>
        <span className="tl-time-sep">/</span>
        <span className="tl-time tl-total">{fmtClock(dur)}</span>
        <input
          className="range tl-range"
          type="range"
          min={0}
          max={dur}
          step={0.1}
          value={t}
          onChange={(e) => onSeek(Number(e.target.value))}
          title="拖动播放头"
        />
      </div>

      <div
        ref={trackRef}
        className="tl-track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* 刻度 */}
        {ticks.map((v) => (
          <div
            key={v}
            className="tl-tick"
            style={{ left: pct(v) }}
            title={fmtClock(v)}
          >
            <span className="tl-tick-label">{v}s</span>
          </div>
        ))}
        {/* 轨道块 */}
        {items.map((it) => {
          const s = Math.max(0, it.start ?? 0);
          const e = Math.min(dur, it.end ?? dur);
          if (e <= s) return null;
          return (
            <button
              key={it.id}
              type="button"
              className="tl-card"
              style={{
                left: pct(s),
                width: pct(e - s),
              }}
              title={`${it.label} · ${fmtClock(s)} – ${fmtClock(e)}`}
              onClick={(ev) => {
                ev.stopPropagation();
                onSelectItem(it.id);
              }}
            >
              <span className="tl-card-label">{it.label}</span>
            </button>
          );
        })}
        {/* 播放头 */}
        <div className="tl-head" style={{ left: pct(t) }}>
          <i className="tl-head-cap" />
        </div>
      </div>
    </div>
  );
}
