/* ============================================================
   Overlay Studio · 项目管理 store（浏览器存储）
   多项目：元数据列表存 localStorage；每个项目的画布对象
   （compose items）按项目独立存储；背景视频按项目存 IndexedDB。
   首次运行时把旧的单项目数据自动迁移为第一个项目。
   ============================================================ */

import type { Project } from "./projectState";
import {
  DEFAULT_PROJECT_DURATION,
  nextProjectId,
  sanitizeProject,
} from "./projectState";

export type { Project };

const PROJECTS_KEY = "overlay-studio:projects:v1";
const MIGRATED_KEY = "overlay-studio:projects-migrated:v1";

/* 旧版单项目 key（用于一次性迁移） */
const LEGACY_PROJECT_KEY = "overlay-studio:project:v1";
const LEGACY_COMPOSE_KEY = "overlay-studio:compose:v1";

/** 项目 compose 的 localStorage key */
export function composeKeyOf(projectId: string): string {
  return `overlay-studio:compose:v1:${projectId}`;
}

/** 项目背景视频的 IndexedDB key */
export function videoKeyOf(projectId: string): string {
  return `compose-bg-video:${projectId}`;
}

export function composeCountFor(projectId: string): number {
  try {
    const raw = localStorage.getItem(composeKeyOf(projectId));
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export function listProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((p) => sanitizeProject(p))
      .filter((p): p is Project => p !== null);
  } catch {
    return [];
  }
}

export function saveProjects(list: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
  } catch {
    /* 存储不可用时静默降级 */
  }
}

export function getProject(id: string): Project | null {
  return listProjects().find((p) => p.id === id) ?? null;
}

export function createProject(name?: string): Project {
  const p: Project = {
    id: nextProjectId(),
    name: name?.trim() || `未命名项目 ${new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    duration: DEFAULT_PROJECT_DURATION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveProjects([p, ...listProjects()]);
  return p;
}

/** 更新元数据（自动刷新 updatedAt，用于列表排序） */
export function updateProject(p: Project): void {
  const list = listProjects();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx < 0) return;
  list[idx] = { ...p, updatedAt: Date.now() };
  saveProjects(list);
}

/** 删除项目：同时清理其画布对象与背景视频 */
export function deleteProject(id: string): void {
  saveProjects(listProjects().filter((p) => p.id !== id));
  try {
    localStorage.removeItem(composeKeyOf(id));
  } catch {
    /* 忽略 */
  }
  void clearVideoFor(id);
}

/* ---------- 每项目画布对象 ---------- */
import { loadComposeFromKey, saveComposeToKey, type ComposeItem } from "./composeState";

export function loadComposeFor(projectId: string): ComposeItem[] {
  return loadComposeFromKey(composeKeyOf(projectId));
}

export function saveComposeFor(projectId: string, items: ComposeItem[]): void {
  saveComposeToKey(composeKeyOf(projectId), items);
}

/* ---------- 每项目背景视频（IndexedDB） ---------- */
import { clearVideoForKey, loadVideoForKey, saveVideoForKey } from "./videoStore";

export async function saveVideoFor(
  projectId: string,
  blob: Blob,
  name: string,
): Promise<void> {
  await saveVideoForKey(videoKeyOf(projectId), blob, name);
}

export async function loadVideoFor(
  projectId: string,
): Promise<{ blob: Blob; name: string } | null> {
  return loadVideoForKey(videoKeyOf(projectId));
}

export async function clearVideoFor(projectId: string): Promise<void> {
  await clearVideoForKey(videoKeyOf(projectId));
}

/* ---------- 旧版单项目数据迁移 ---------- */
export function migrateLegacyIfNeeded(): void {
  try {
    if (localStorage.getItem(MIGRATED_KEY)) return;
    const list = listProjects();
    if (list.length > 0) {
      localStorage.setItem(MIGRATED_KEY, "1");
      return;
    }
    const legacyRaw = localStorage.getItem(LEGACY_PROJECT_KEY);
    if (!legacyRaw) {
      localStorage.setItem(MIGRATED_KEY, "1");
      return;
    }
    const legacy = sanitizeProject(JSON.parse(legacyRaw));
    if (!legacy) {
      localStorage.setItem(MIGRATED_KEY, "1");
      return;
    }
    // 迁移 compose：旧 key → 新项目 key（若旧 compose 存在）
    try {
      const oldCompose = localStorage.getItem(LEGACY_COMPOSE_KEY);
      if (oldCompose) {
        localStorage.setItem(composeKeyOf(legacy.id), oldCompose);
        localStorage.removeItem(LEGACY_COMPOSE_KEY);
      }
    } catch {
      /* 忽略 */
    }
    // 迁移视频：旧 IndexedDB key → 新项目 key
    void migrateLegacyVideo(legacy.id);
    saveProjects([legacy]);
    localStorage.setItem(MIGRATED_KEY, "1");
  } catch {
    /* 迁移失败不影响主流程 */
  }
}

async function migrateLegacyVideo(projectId: string): Promise<void> {
  try {
    const old = await loadVideoForKey("compose-bg-video");
    if (old) {
      await saveVideoForKey(videoKeyOf(projectId), old.blob, old.name);
      await clearVideoForKey("compose-bg-video");
    }
  } catch {
    /* 忽略 */
  }
}
