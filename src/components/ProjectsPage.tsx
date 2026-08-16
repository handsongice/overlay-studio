import { useCallback, useEffect, useMemo, useState } from "react";
import type { Project } from "../projectState";
import {
  composeCountFor,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  loadComposeFor,
  loadVideoFor,
  migrateLegacyIfNeeded,
} from "../projectStore";
import { ComposeView } from "./ComposeView";
import { THEMES, type ThemeId } from "./TopBar";
import type { SafeZoneState } from "./SafeZoneGroup";
import type { ComposeItem } from "../composeState";

/* ============================================================
   Overlay Studio · 项目管理页
   第一个页面：查询 / 新建 / 编辑 / 删除 / 预览项目。
   点“打开”进入编辑器；预览在模态框内只读渲染项目动效。
   数据全部存浏览器（localStorage + IndexedDB）。
   ============================================================ */

interface ProjectsPageProps {
  theme: ThemeId;
  onThemeChange: (t: ThemeId) => void;
  /** 进入编辑器 */
  onOpenProject: (id: string) => void;
  /** 打开使用说明 */
  onOpenGuide: () => void;
}

const SAFE_ZONE_DUMMY: SafeZoneState = { visible: false, width: 780, opacity: 0.85 };

function fmtTime(ts: number): string {
  if (!Number.isFinite(ts) || ts <= 0) return "--";
  const d = new Date(ts);
  const now = Date.now();
  const diff = Math.max(0, now - ts);
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtDur(sec: number): string {
  const s = Math.max(0, Math.round(sec * 10) / 10);
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return m > 0 ? `${m}m ${Math.round(r)}s` : `${r}s`;
}

export function ProjectsPage({
  theme,
  onThemeChange,
  onOpenProject,
  onOpenGuide,
}: ProjectsPageProps) {
  // 首次进入迁移旧版单项目数据
  const [projects, setProjects] = useState<Project[]>(() => {
    migrateLegacyIfNeeded();
    return listProjects();
  });
  const [query, setQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  /** 预览的项目 id：非空时打开只读预览模态框 */
  const [previewId, setPreviewId] = useState<string | null>(null);

  const refresh = useCallback(() => setProjects(listProjects()), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...projects].sort(
      (a, b) => b.updatedAt - a.updatedAt,
    );
    if (!q) return list;
    return list.filter((p) => {
      const count = composeCountFor(p.id);
      const hay = [
        p.name,
        p.id,
        String(p.duration),
        String(count),
        fmtTime(p.updatedAt),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [projects, query]);

  const handleCreate = useCallback(() => {
    const p = createProject();
    onOpenProject(p.id);
  }, [onOpenProject]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteProject(id);
      setConfirmDeleteId(null);
      if (previewId === id) setPreviewId(null);
      refresh();
    },
    [previewId, refresh],
  );

  const openPreview = useCallback((id: string) => {
    setConfirmDeleteId(null);
    setPreviewId(id);
  }, []);

  const closePreview = useCallback(() => setPreviewId(null), []);

  /* 预览数据：项目对象 + 每项目视频 */
  const previewProject = previewId ? getProject(previewId) : null;
  const [previewItems, setPreviewItems] = useState<ComposeItem[]>([]);
  const [previewVideo, setPreviewVideo] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [previewRunId, setPreviewRunId] = useState(0);

  useEffect(() => {
    if (!previewId) {
      setPreviewItems([]);
      setPreviewVideo(null);
      return;
    }
    const p = getProject(previewId);
    setPreviewItems(p ? loadComposeFor(previewId) : []);
    let alive = true;
    loadVideoFor(previewId).then((v) => {
      if (!alive || !v) return;
      setPreviewVideo({ name: v.name, url: URL.createObjectURL(v.blob) });
    });
    return () => {
      alive = false;
      setPreviewVideo((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return null;
      });
    };
  }, [previewId]);

  const previewReplay = useCallback(() => setPreviewRunId((r) => r + 1), []);

  return (
    <div className="projects-page">
      {/* 顶部：品牌 + 搜索 + 操作 */}
      <header className="projects-topbar">
        <div className="topbar-brand">
          <div className="topbar-mark" aria-hidden>
            <i />
            <i />
            <i />
          </div>
          <span className="topbar-title">OVERLAY·STUDIO</span>
          <span className="topbar-divider" />
          <span className="topbar-sub">项目 · PROJECTS</span>
        </div>
        <div className="projects-search">
          <span className="projects-search-icon">⌕</span>
          <input
            className="input projects-search-input"
            type="search"
            placeholder="搜索项目名称 / 时长 / 卡片数…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={false}
          />
          {query && (
            <button
              type="button"
              className="projects-search-clear"
              onClick={() => setQuery("")}
              title="清空搜索"
            >
              ✕
            </button>
          )}
        </div>
        <div className="projects-actions">
          <button
            type="button"
            className="btn btn-sm projects-help-btn"
            onClick={onOpenGuide}
            title="查看使用说明与快捷键"
          >
            ? 使用说明
          </button>
          <button
            type="button"
            className="btn btn-sm projects-new-btn"
            onClick={handleCreate}
            title="新建项目并进入编辑器"
          >
            ＋ 新建项目
          </button>
          <div className="theme-switch" role="group" aria-label="配色主题">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-btn ${t.cn}${theme === t.id ? " active" : ""}`}
                title={t.label}
                aria-pressed={theme === t.id}
                onClick={() => onThemeChange(t.id)}
              >
                <i />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 统计条 */}
      <div className="projects-stats">
        <span>
          项目总数 <b>{projects.length}</b>
        </span>
        <span>
          动效卡总数{" "}
          <b>
            {projects.reduce((acc, p) => acc + composeCountFor(p.id), 0)}
          </b>
        </span>
        <span className="projects-stats-hint">
          数据保存在本机浏览器 · localStorage / IndexedDB
        </span>
      </div>

      {/* 项目列表 */}
      <main className="projects-main">
        {filtered.length === 0 ? (
          <div className="projects-empty">
            <div className="projects-empty-icon">◇</div>
            <div className="projects-empty-title">
              {query ? "没有匹配的项目" : "还没有项目"}
            </div>
            <p>
              {query
                ? "换个关键词试试，或清空搜索。"
                : "新建一个项目，开始制作透明动效层：拖入组件、设置时间轴、导出 PNG 序列。"}
            </p>
            {!query && (
              <div className="projects-empty-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={handleCreate}
                >
                  ＋ 新建项目
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={onOpenGuide}
                >
                  ? 查看使用说明
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="projects-grid">
            {filtered.map((p) => {
              const count = composeCountFor(p.id);
              const confirm = confirmDeleteId === p.id;
              return (
                <article
                  key={p.id}
                  className="project-card"
                  onClick={() => !confirm && onOpenProject(p.id)}
                >
                  <div className="project-card-head">
                    <div className="project-card-name" title={p.name}>
                      {p.name}
                    </div>
                    <span className="project-card-id">{p.id}</span>
                  </div>
                  <div className="project-card-meta">
                    <span>
                      时长 <b>{fmtDur(p.duration)}</b>
                    </span>
                    <span>
                      动效卡 <b>{count}</b>
                    </span>
                    <span>
                      更新 <b>{fmtTime(p.updatedAt)}</b>
                    </span>
                  </div>
                  <div className="project-card-foot">
                    <span className="project-card-created">
                      创建于 {fmtTime(p.createdAt)}
                    </span>
                    <div
                      className="project-card-btns"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {confirm ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm project-btn danger"
                            onClick={() => handleDelete(p.id)}
                          >
                            确认删除
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm project-btn"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm project-btn"
                            title="只读预览项目动效"
                            onClick={() => openPreview(p.id)}
                          >
                            ▶ 预览
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm project-btn"
                            title="打开编辑器"
                            onClick={() => onOpenProject(p.id)}
                          >
                            ✎ 编辑
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm project-btn danger"
                            title="删除项目（含画布对象与视频）"
                            onClick={() => {
                              setConfirmDeleteId(p.id);
                              setTimeout(
                                () =>
                                  setConfirmDeleteId((cur) =>
                                    cur === p.id ? null : cur,
                                  ),
                                4000,
                              );
                            }}
                          >
                            删除
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="projects-foot">
        OVERLAY·STUDIO · SRT 动效生成 → 透明动效层 · 本机存储 · 无上传
      </footer>

      {/* 项目只读预览模态框 */}
      {previewProject && previewId && (
        <div className="export-overlay preview-overlay" onClick={closePreview}>
          <div
            className="preview-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="preview-head">
              <div>
                <div className="preview-title">
                  ▶ 项目预览 · {previewProject.name}
                </div>
                <small>
                  {fmtDur(previewProject.duration)} · {previewItems.length} 张动效卡
                  {previewVideo ? " · 含背景视频" : ""} · 只读
                </small>
              </div>
              <div className="preview-head-btns">
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={previewReplay}
                  title="从头重放"
                >
                  ↻ 重放
                </button>
                <button
                  type="button"
                  className="export-close"
                  onClick={closePreview}
                  title="关闭预览"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="preview-body">
              <ComposeView
                safeZone={SAFE_ZONE_DUMMY}
                items={previewItems}
                selectedId={null}
                paramsMap={{}}
                onItemsChange={() => {}}
                onSelect={() => {}}
                onSyncParam={() => {}}
                onSafeZoneChange={() => {}}
                project={previewProject}
                video={previewVideo}
                runId={previewRunId}
                onReplay={previewReplay}
                readonly
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
