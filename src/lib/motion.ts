import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/** 卡片时间轴：组件挂载时的项目时间（秒）。无时间轴的卡片 = 0。
    用于导出时把 rAF 驱动的组件按“项目时间 - 挂载时间”确定性计算。 */
export const AnimClockCtx = createContext(0);

/** 共享动效时钟覆盖（导出用）：null = 实时时钟。
    setAnimClockOverride(t) 会把 t（项目秒）广播给所有订阅的 rAF 组件，
    让它们在导出每一帧时按确定性时间渲染，而不是依赖会滞后的 rAF。 */
type ClockListener = (t: number) => void;
const clockListeners = new Set<ClockListener>();

export function setAnimClockOverride(t: number | null): void {
  if (t != null) {
    for (const fn of Array.from(clockListeners)) fn(t);
  }
}

export function subscribeAnimClock(fn: ClockListener): () => void {
  clockListeners.add(fn);
  return () => {
    clockListeners.delete(fn);
  };
}

/** 统一缓动曲线：Apple Keynote 式 ease-out，无弹跳 */
export const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";
export const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";

export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function toNumber(v: string | number | boolean, fallback = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function toString(v: string | number | boolean, fallback = ""): string {
  return v === undefined || v === null ? fallback : String(v);
}

export function toBool(v: string | number | boolean, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

/** 数字格式化：千分位 + 小数位（等宽数字） */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

interface CountUpOptions {
  duration?: number;
  delay?: number;
  decimals?: number;
  disabled?: boolean;
}

/** 数字滚动：rAF + easeOutExpo，只动数值不动布局 */
export function useCountUp(target: number, opts: CountUpOptions = {}): number {
  const { duration = 1.6, delay = 0.15, decimals = 0, disabled = false } = opts;
  const mountT = useContext(AnimClockCtx);
  const [value, setValue] = useState<number>(disabled ? target : 0);
  const stateRef = useRef({ target, duration, delay, decimals, disabled, mountT });
  stateRef.current = { target, duration, delay, decimals, disabled, mountT };

  /* 导出时钟覆盖：外部固定共享时钟时按项目时间确定性计算 */
  useEffect(() => {
    return subscribeAnimClock((t) => {
      const s = stateRef.current;
      if (s.disabled) {
        setValue(s.target);
        return;
      }
      const p = clamp((t - s.mountT - s.delay) / Math.max(s.duration, 0.01), 0, 1);
      const factor = Math.pow(10, s.decimals);
      setValue(Math.round(s.target * easeOutExpo(p) * factor) / factor);
    });
  }, []);

  useEffect(() => {
    if (disabled) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = (now - start) / 1000 - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = clamp(elapsed / Math.max(duration, 0.01), 0, 1);
      const factor = Math.pow(10, decimals);
      setValue(Math.round(target * easeOutExpo(p) * factor) / factor);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay, decimals, disabled]);

  return value;
}

/** 让 CSS 动画通过 --d 变量错开节奏 */
export function delayVar(seconds: number): React.CSSProperties {
  return { "--d": `${seconds}s` } as React.CSSProperties;
}

interface AnimElapsedOptions {
  duration?: number;
  delay?: number;
  disabled?: boolean;
}

/** 通用动画时钟：从 0 走秒到 duration（含 delay），供 rAF 驱动的组件使用 */
export function useAnimElapsed(
  opts: AnimElapsedOptions = {},
): number {
  const { duration = 2, delay = 0, disabled = false } = opts;
  const mountT = useContext(AnimClockCtx);
  const [elapsed, setElapsed] = useState<number>(disabled ? duration : 0);
  const stateRef = useRef({ duration, delay, disabled, mountT });
  stateRef.current = { duration, delay, disabled, mountT };

  /* 导出时钟覆盖：按项目时间确定性计算 */
  useEffect(() => {
    return subscribeAnimClock((t) => {
      const s = stateRef.current;
      if (s.disabled) {
        setElapsed(s.duration);
        return;
      }
      setElapsed(clamp(t - s.mountT - s.delay, 0, s.duration));
    });
  }, []);

  useEffect(() => {
    if (disabled) {
      setElapsed(duration);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = (now - start) / 1000 - delay;
      if (t < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const e = clamp(t, 0, duration);
      setElapsed(e);
      if (e < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, delay, disabled]);

  return elapsed;
}

/** 三次方缓出（odometer 减速用） */
export function cubicOut(t: number): number {
  const u = clamp(t, 0, 1);
  return 1 - Math.pow(1 - u, 3);
}

/** 三次方缓入缓出 */
export function cubicInOut(t: number): number {
  const u = clamp(t, 0, 1);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

/* ---------- 移植卡片用到的补充缓动与工具 ---------- */

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

export const easeLinear = (t: number): number => clamp01(t);

export const easeInCubic = (t: number): number => {
  const u = clamp01(t);
  return u * u * u;
};

export const easeInOutQuad = (t: number): number => {
  const u = clamp01(t);
  return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
};

export const easeInOutSine = (t: number): number => {
  const u = clamp01(t);
  return 0.5 - Math.cos(Math.PI * u) / 2;
};

export const easeOutQuint = (t: number): number => {
  const u = clamp01(t);
  return 1 - Math.pow(1 - u, 5);
};

/** outBack：轻微过冲（项目克制版，过冲 8–12%，不弹跳） */
export const easeOutBack = (t: number): number => {
  const u = clamp01(t);
  const c1 = 1.22;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
};

/** 线性插值（t 自动 clamp） */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * clamp01(t);

/** 分段工具：t 在 [a,b] 内映射到 0→1，外部 clamp，可传缓动 */
export const seg = (
  t: number,
  a: number,
  b: number,
  fn: (u: number) => number = easeLinear,
): number => {
  if (t <= a) return 0;
  if (t >= b) return 1;
  return fn((t - a) / (b - a));
};
