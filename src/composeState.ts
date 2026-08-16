import type { Params, SelectControl } from "./types";
import { REGISTRY } from "./registry";

/* ============================================================
   画布对象状态（每项目）
   画布上的每张卡片 = 一个对象实例（组件类 → 对象）。
   状态提升到 App 层，按项目持久化到 localStorage：
   切换 预览台/卡库 不丢失，刷新页面也不丢。
   ============================================================ */

export const CANVAS_W = 1920;
export const CANVAS_H = 1080;

export interface ComposeItem {
  id: string;
  componentId: string;
  params: Params;
  x: number;
  y: number;
  /** 手动卡片框尺寸（画布 px）。缺省时按组件内容盒自动测量。 */
  w?: number;
  h?: number;
  /** 时间轴区间（秒）：SRT 导入的动效卡绑定的出现/消失时间；缺省=全程可见 */
  start?: number;
  end?: number;
}

let uid = 0;
export const nextId = () => `ci-${Date.now().toString(36)}-${++uid}`;

/** 组件是否支持 side=both（左右双侧） */
export function supportsBothSide(componentId: string): boolean {
  const def = REGISTRY.find((d) => d.id === componentId);
  const side = def?.controls.find(
    (c): c is SelectControl => c.key === "side" && c.type === "select",
  );
  return !!side && side.options.some((o) => o.value === "both");
}

/** 把 side=both 的单张横跨卡拆成左右两张独立卡片 */
export function splitBothCard(it: ComposeItem): ComposeItem[] {
  const y = Math.min(Math.max(0, Math.round(it.y)), CANVAS_H - 90);
  return [
    {
      ...it,
      id: nextId(),
      params: { ...it.params, side: "left" },
      x: 24,
      y,
      w: undefined,
      h: undefined,
    },
    {
      ...it,
      id: nextId(),
      params: { ...it.params, side: "right" },
      x: CANVAS_W - 520 - 28,
      y,
      w: undefined,
      h: undefined,
    },
  ];
}

/** 校验并解析持久化的画布对象（防脏数据），并把旧的 both 单卡迁移为左右两张 */
export function loadComposeFromKey(key: string): ComposeItem[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (it): it is ComposeItem =>
          it &&
          typeof it === "object" &&
          typeof it.id === "string" &&
          typeof it.componentId === "string" &&
          typeof it.x === "number" &&
          typeof it.y === "number" &&
          (it.w === undefined || (typeof it.w === "number" && it.w > 0)) &&
          (it.h === undefined || (typeof it.h === "number" && it.h > 0)) &&
          (it.start === undefined || typeof it.start === "number") &&
          (it.end === undefined || typeof it.end === "number") &&
          it.params &&
          typeof it.params === "object",
      )
      .flatMap((it) =>
        supportsBothSide(it.componentId) && String(it.params.side) === "both"
          ? splitBothCard(it)
          : [it],
      );
  } catch {
    return [];
  }
}

export function saveComposeToKey(key: string, items: ComposeItem[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* 存储不可用时静默降级 */
  }
}
