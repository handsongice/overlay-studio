import type { Params, PreviewDefinition } from "./types";

/* ============================================================
   组合台布局公共逻辑
   锚点分类 / 预估尺寸 / 自动排位 / both 拆卡，供 ComposeView
   与 App（卡库打开、数字键添加）共用。
   ============================================================ */

export type AnchorKind = "side" | "bottom" | "center" | "compare";

/** 固定锚点组件：其余组件都带 side 参数 */
export const ANCHOR_BY_ID: Record<string, AnchorKind> = {
  "compare-split": "compare",
  "quote-lockup": "center",
  "bottom-band": "bottom",
  "timeline-strip": "bottom",
};

/** 测量前的预估卡片尺寸（canvas px），测量后自动修正 */
export const EST_SIZE: Record<AnchorKind, { w: number; h: number }> = {
  side: { w: 520, h: 360 },
  bottom: { w: 780, h: 168 },
  center: { w: 780, h: 380 },
  compare: { w: 920, h: 420 },
};

export function anchorKindOf(def: PreviewDefinition): AnchorKind {
  return ANCHOR_BY_ID[def.id] ?? "side";
}

/** 组件是否允许 side=both 且当前参数确实为 both */
export function isBothSplit(def: PreviewDefinition, params: Params): boolean {
  const side = def.controls.find(
    (c) => c.key === "side" && c.type === "select",
  );
  return (
    !!side &&
    side.type === "select" &&
    side.options.some((o) => o.value === "both") &&
    String(params.side) === "both"
  );
}

/** 默认放置位：左列 / 右列交替 + 分行，避免多卡叠在同一位置；
   显式 side=right 的卡片固定进右列。底部卡向上叠放。 */
export function nextFreeSpot(
  kind: AnchorKind,
  n: number,
  params?: Params,
): { x: number; y: number } {
  const row = Math.floor(n / 2);
  if (kind === "bottom") {
    // 底部带始终贴底：第 1 张居中，多张时左右排开
    const xs = [570, 1116, 24];
    return { x: xs[n % xs.length], y: 892 };
  }
  if (kind === "side") {
    const right = params ? String(params.side) === "right" : false;
    const x = right || n % 2 === 1 ? 1372 : 24;
    return { x, y: 180 + row * 400 };
  }
  if (kind === "compare") {
    return { x: n % 2 === 1 ? 976 : 24, y: 220 + row * 440 };
  }
  return { x: n % 2 === 1 ? 980 : 160, y: 160 + row * 420 };
}

/** 按锚点与排位生成单张卡片（both 拆卡时分别调用） */
export function makeItem(
  def: PreviewDefinition,
  params: Params,
  spot: { x: number; y: number },
  nextId: () => string,
) {
  const kind = anchorKindOf(def);
  const est = EST_SIZE[kind];
  return {
    id: nextId(),
    componentId: def.id,
    params,
    x: Math.max(0, Math.min(1920 - est.w, spot.x)),
    y: Math.max(0, Math.min(1080 - est.h, spot.y)),
  };
}

/** 组件添加展开：both 拆左右两张，其余单张 */
export function expandAdd(
  def: PreviewDefinition,
  params: Params,
  counts: Record<AnchorKind, number>,
  nextId: () => string,
) {
  const kind = anchorKindOf(def);
  if (isBothSplit(def, params)) {
    return [
      makeItem(
        def,
        { ...params, side: "left" },
        nextFreeSpot("side", counts.side++, { side: "left" }),
        nextId,
      ),
      makeItem(
        def,
        { ...params, side: "right" },
        nextFreeSpot("side", counts.side++, { side: "right" }),
        nextId,
      ),
    ];
  }
  return [
    makeItem(def, params, nextFreeSpot(kind, counts[kind]++, params), nextId),
  ];
}
