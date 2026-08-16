/* ============================================================
   Overlay Studio · 项目状态
   项目 = 一次动效层制作：名称 + 总时长（秒）。
   流程：新建项目 → 导入原始视频（可选，用于对齐时长）或手填
   时长 → 拖组件（类）到画布成为对象（实例）→ 配置出现/消失时间
   → 导出透明动效层（画布本身，PNG 序列/MOV）。
   项目元数据持久化到 localStorage，画布对象仍走 composeState。
   ============================================================ */

export interface Project {
  id: string;
  name: string;
  /** 项目总时长（秒）：导出与时间轴都以它为准 */
  duration: number;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_PROJECT_DURATION = 10;

const STORAGE_KEY = "overlay-studio:project:v1";

let uid = 0;
export const nextProjectId = () =>
  `proj-${Date.now().toString(36)}-${++uid}`;

/** 默认项目：未命名，10 秒 */
export function defaultProject(): Project {
  return {
    id: nextProjectId(),
    name: "未命名项目",
    duration: DEFAULT_PROJECT_DURATION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function sanitizeDuration(v: number): number {
  if (!Number.isFinite(v) || v <= 0) return DEFAULT_PROJECT_DURATION;
  return Math.min(3600, Math.max(0.1, Math.round(v * 10) / 10));
}

export function sanitizeProject(p: unknown): Project | null {
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    typeof o.name !== "string" ||
    typeof o.duration !== "number" ||
    !Number.isFinite(o.duration) ||
    o.duration <= 0
  ) {
    return null;
  }
  return {
    id: o.id,
    name: o.name || "未命名项目",
    duration: sanitizeDuration(o.duration),
    createdAt: typeof o.createdAt === "number" ? o.createdAt : Date.now(),
    updatedAt: typeof o.updatedAt === "number" ? o.updatedAt : Date.now(),
  };
}

export function loadProject(): Project {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = sanitizeProject(JSON.parse(raw));
      if (p) return p;
    }
  } catch {
    /* 脏数据走默认 */
  }
  return defaultProject();
}

export function saveProject(p: Project): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...p, updatedAt: Date.now() }),
    );
  } catch {
    /* 存储不可用时静默降级 */
  }
}

/** 新建项目：新 id + 默认时长，名称自动编号 */
export function newProject(): Project {
  const n = new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return {
    ...defaultProject(),
    id: nextProjectId(),
    name: `项目 ${n}`,
  };
}
