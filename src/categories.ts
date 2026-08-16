/* ============================================================
   组件分类 · 与镜头卡库体系对齐（metric / typography / compare / ui-entrance）
   侧栏按此分组 + 搜索，避免组件过多时难以定位
   ============================================================ */

export type CategoryId = "metric" | "chart" | "typography" | "compare" | "ui-entrance";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  labelEn: string;
  hint: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "metric",
    label: "数据与指标",
    labelEn: "METRIC & DATA",
    hint: "大数字、滚动、仪表、图表",
  },
  {
    id: "chart",
    label: "图表动效",
    labelEn: "CHART & PLOT",
    hint: "折线、柱状、环形、面积、活体图表",
  },
  {
    id: "typography",
    label: "文字与字卡",
    labelEn: "TYPE & LOCKUP",
    hint: "逐词、翻牌、滚轮、金句",
  },
  {
    id: "compare",
    label: "对比与切换",
    labelEn: "COMPARE & SWITCH",
    hint: "A/B 对比、拉杆显影",
  },
  {
    id: "ui-entrance",
    label: "界面与结构",
    labelEn: "UI & STRUCTURE",
    hint: "列表、网格、卡片、扫描",
  },
];

const metaById = new Map<CategoryId, CategoryMeta>(
  CATEGORIES.map((c) => [c.id, c]),
);

export function categoryMeta(id: CategoryId): CategoryMeta {
  return metaById.get(id) ?? CATEGORIES[0];
}
