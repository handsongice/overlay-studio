import { useRef } from "react";
import type { Project } from "../projectState";

export type ThemeId = "mono" | "cobalt" | "amber" | "ivory";

export const THEMES: { id: ThemeId; label: string; cn: string }[] = [
  { id: "mono", label: "Mono", cn: "th-mono" },
  { id: "cobalt", label: "Cobalt", cn: "th-cobalt" },
  { id: "amber", label: "Amber", cn: "th-amber" },
  { id: "ivory", label: "Ivory", cn: "th-ivory" },
];

interface TopBarProps {
  view: "preview" | "library";
  /** 返回项目管理页（编辑器顶部左侧返回按钮） */
  onBack?: () => void;
  /** 打开使用说明 */
  onOpenGuide?: () => void;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  onViewChange: (view: "preview" | "library") => void;
  /** 项目（名称/时长）控制 */
  project: Project;
  onProjectNameChange: (name: string) => void;
  onProjectDurationChange: (seconds: number) => void;
  onNewProject: () => void;
  /** 用已导入视频时长对齐项目时长；无视频时禁用 */
  onAlignToVideo: () => void;
  video: { name: string; url: string } | null;
  onPickVideo: (file: File) => void;
  onRemoveVideo: () => void;
  /** 导入《特效生成》Skill 输出的 overlay JSON */
  onImportOverlayJson?: (file: File) => void;
  importStatus?: { ok: boolean; msg: string } | null;
  /** 导出透明动效层 */
  onExport?: () => void;
  exporting?: boolean;
  hasItems?: boolean;
  exportResult?: string | null;
}

export function TopBar({
  view,
  onBack,
  onOpenGuide,
  theme,
  onThemeChange,
  onViewChange,
  project,
  onProjectNameChange,
  onProjectDurationChange,
  onNewProject,
  onAlignToVideo,
  video,
  onPickVideo,
  onRemoveVideo,
  onImportOverlayJson,
  importStatus,
  onExport,
  exporting,
  hasItems,
  exportResult,
}: TopBarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const overlayJsonRef = useRef<HTMLInputElement>(null);
  return (
    <header className="topbar">
      {onBack && (
        <button
          type="button"
          className="btn btn-sm topbar-back"
          onClick={onBack}
          title="返回项目管理页（数据自动保存）"
        >
          ← 项目
        </button>
      )}
      <div className="topbar-brand">
        <div className="topbar-mark" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        <span className="topbar-title">OVERLAY</span>
      </div>
      <div className="topbar-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === "preview"}
          className={`topbar-tab${view === "preview" ? " active" : ""}`}
          onClick={() => onViewChange("preview")}
        >
          预览台
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "library"}
          className={`topbar-tab${view === "library" ? " active" : ""}`}
          onClick={() => onViewChange("library")}
        >
          镜头卡库
        </button>
      </div>
      <div className="topbar-project" title="项目：名称与总时长（导出时长以它为准）">
        <span className="topbar-project-label">项目</span>
        <input
          className="input topbar-project-name"
          type="text"
          value={project.name}
          maxLength={40}
          onChange={(e) => onProjectNameChange(e.target.value)}
          title="项目名称"
        />
        <input
          className="input topbar-project-dur"
          type="number"
          min={0.1}
          max={3600}
          step={0.1}
          value={Math.round(project.duration * 10) / 10}
          onChange={(e) =>
            onProjectDurationChange(Number(e.target.value) || 0.1)
          }
          title="项目总时长（秒）"
        />
        <span className="topbar-project-unit">s</span>
        <button
          type="button"
          className="btn btn-sm topbar-project-align"
          disabled={!video}
          onClick={onAlignToVideo}
          title={video ? "以导入视频时长对齐项目时长" : "先导入视频，再对齐时长"}
        >
          对齐视频
        </button>
        <button
          type="button"
          className="btn btn-sm topbar-project-new"
          onClick={onNewProject}
          title="新建项目：重置名称/时长并清空画布"
        >
          新建项目
        </button>
      </div>
      <div className="topbar-video">
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPickVideo(f);
            e.target.value = "";
          }}
        />
        {onImportOverlayJson && (
          <>
            <input
              ref={overlayJsonRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImportOverlayJson(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="btn btn-sm topbar-video-btn"
              onClick={() => overlayJsonRef.current?.click()}
              title="导入《特效生成》Skill 生成的 overlay JSON（带时间轴）"
            >
              导入 JSON
            </button>
            {importStatus && (
              <span
                className={`topbar-import-result${importStatus.ok ? "" : " err"}`}
                title={importStatus.msg}
              >
                {importStatus.ok ? "✓" : "✕"} {importStatus.msg}
              </span>
            )}
          </>
        )}
        <button
          type="button"
          className="btn btn-sm topbar-video-btn"
          onClick={() => fileRef.current?.click()}
        >
          {video ? "↺ 更换视频" : "＋ 导入视频"}
        </button>
        {video && (
          <div className="topbar-video-meta">
            <span className="topbar-video-name" title={video.name}>
              {video.name}
            </span>
            <button
              type="button"
              className="topbar-video-remove"
              onClick={onRemoveVideo}
              title="移除视频背景"
            >
              ✕
            </button>
          </div>
        )}
      </div>
      {onExport && (
        <div className="topbar-export">
          <button
            type="button"
            className="btn btn-sm topbar-export-btn"
            disabled={!hasItems || exporting}
            onClick={onExport}
            title={
              hasItems
                ? "导出画布动效卡片的透明 PNG 序列（不含视频画面）"
                : "画布为空，请先添加动效卡片"
            }
          >
            {exporting ? "⏳ 导出中…" : "导出动效层"}
          </button>
          {exportResult && !exporting && (
            <span className="topbar-export-result" title={exportResult}>
              ✓ {exportResult}
            </span>
          )}
        </div>
      )}
      <div className="topbar-spacer" />
      {onOpenGuide && (
        <button
          type="button"
          className="btn btn-sm topbar-guide-btn"
          onClick={onOpenGuide}
          title="使用说明与快捷键"
        >
          说明
        </button>
      )}
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
          </button>
        ))}
      </div>
    </header>
  );
}
