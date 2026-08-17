import { useCallback, useEffect, useRef, useState } from "react";
import { TopBar, type ThemeId } from "./components/TopBar";
import type { SafeZoneState } from "./components/SafeZoneGroup";
import { ShotLibrary } from "./shots/ShotLibrary";
import { ComposeView } from "./components/ComposeView";
import { ExportDialog } from "./components/ExportDialog";
import { ProjectsPage } from "./components/ProjectsPage";
import { GuideDialog, isGuideSeen } from "./components/GuideDialog";
import type { ExportResult } from "./exportPng";
import { REGISTRY } from "./registry";
import { nextId, type ComposeItem } from "./composeState";
import {
  createProject,
  getProject,
  loadComposeFor,
  loadVideoFor,
  saveComposeFor,
  saveVideoFor,
  clearVideoFor,
  updateProject,
  type Project,
} from "./projectStore";
import { sanitizeDuration } from "./projectState";
import {
  anchorKindOf,
  expandAdd,
  type AnchorKind,
} from "./composeLayout";
import type { Params, ParamValue } from "./types";
import { overlayJsonToComposeItems } from "./overlayImport";
import "./styles/previews.css";
import "./styles/library.css";

/* ============================================================
   Overlay Studio · 双页面
   第一页：项目管理（查询/新建/编辑/删除/预览）
   第二页：编辑器（导入视频、拖动效卡、时间轴、导出）
   数据全部存浏览器：项目元数据 + 画布对象 → localStorage，
   背景视频 → IndexedDB，均按项目隔离。
   ============================================================ */

type Page = "projects" | "editor";

export default function App() {
  const [page, setPage] = useState<Page>("projects");
  const [view, setView] = useState<"preview" | "library">("preview");
  const [theme, setTheme] = useState<ThemeId>("cobalt");
  /** 当前编辑的项目 id（null = 项目管理页） */
  const [projectId, setProjectId] = useState<string | null>(null);
  /** 当前项目元数据：名称 + 总时长（决定时间轴与导出长度） */
  const [project, setProject] = useState<Project | null>(null);
  /** 播放头当前时间：由 ComposeView 同步，数字键添加组件时作为出现时间 */
  const playheadRef = useRef(0);
  const [paramsMap, setParamsMap] = useState<Record<string, Params>>(() => {
    const map: Record<string, Params> = {};
    for (const def of REGISTRY) map[def.id] = { ...def.defaults };
    return map;
  });
  const [safeZone, setSafeZone] = useState<SafeZoneState>({
    visible: true,
    width: 780,
    opacity: 0.85,
  });
  /** 画布对象（当前项目），localStorage 按项目持久化 */
  const [composeItems, setComposeItems] = useState<ComposeItem[]>([]);
  const [composeSelectedId, setComposeSelectedId] = useState<string | null>(
    null,
  );
  /** 当前项目导入的视频背景：仅预览叠加，IndexedDB 按项目持久化 */
  const [video, setVideo] = useState<{ name: string; url: string } | null>(
    null,
  );
  /** 导出透明动效层：对话框开关 / 进行中 / 结果文案 */
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<string | null>(null);
  const [exportRunId, setExportRunId] = useState(0);
  /** 导入《特效生成》Skill 输出 JSON 的结果提示 */
  const [importStatus, setImportStatus] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  /** 引导 / 使用说明：首次自动弹出 */
  const [guideOpen, setGuideOpen] = useState<boolean>(() => !isGuideSeen());

  const patchSafeZone = useCallback(
    (patch: Partial<SafeZoneState>) => setSafeZone((s) => ({ ...s, ...patch })),
    [],
  );

  /** 重放画布动画：导出时由 ExportDialog 调用，让所有卡片从 0 重新挂载 */
  const replayCompose = useCallback(() => {
    setExportRunId((r) => r + 1);
  }, []);

  /** 打开导出对话框：先确保预览台画布挂载 */
  const openExport = useCallback(() => {
    setExportResult(null);
    setView("preview");
    setExportOpen(true);
  }, []);

  const closeExport = useCallback(() => {
    if (exporting) return;
    setExportOpen(false);
  }, [exporting]);

  const handleExportDone = useCallback((r: ExportResult) => {
    setExportResult(
      r.savedPath
        ? `已导出（${r.frames} 帧）→ ${r.savedPath}`
        : `已导出透明 MOV 视频（${r.frames} 帧）`,
    );
  }, []);

  /** 打开项目 → 进入编辑器（从浏览器存储加载该项目数据） */
  const openProject = useCallback((id: string) => {
    const p = getProject(id);
    if (!p) return;
    setVideo((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setProjectId(id);
    setProject(p);
    setComposeItems(loadComposeFor(id));
    setComposeSelectedId(null);
    setImportStatus(null);
    setExportResult(null);
    setView("preview");
    setPage("editor");
  }, []);

  /** 返回项目管理页（数据已由 effect 自动保存） */
  const goProjects = useCallback(() => {
    setPage("projects");
    setView("preview");
  }, []);

  /** 编辑器内「＋ 新建项目」：创建新项目并进入 */
  const handleNewProject = useCallback(() => {
    const p = createProject();
    openProject(p.id);
  }, [openProject]);

  /** 当前项目加载背景视频（刷新后从 IndexedDB 恢复） */
  useEffect(() => {
    if (!projectId || page !== "editor") return;
    let alive = true;
    loadVideoFor(projectId).then((v) => {
      if (!alive || !v) return;
      setVideo({ name: v.name, url: URL.createObjectURL(v.blob) });
    });
    return () => {
      alive = false;
    };
  }, [projectId, page]);

  /** 项目元数据 / 画布对象自动保存到浏览器存储 */
  useEffect(() => {
    if (projectId && project) updateProject(project);
  }, [projectId, project]);

  useEffect(() => {
    if (projectId) saveComposeFor(projectId, composeItems);
  }, [projectId, composeItems]);

  /** 导入《特效生成》Skill 输出的 overlay JSON → 直接落到画布（带时间轴） */
  const importOverlayJson = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const json: unknown = JSON.parse(text);
        const { items, errors } = overlayJsonToComposeItems(json);
        if (items.length === 0) {
          setImportStatus({
            ok: false,
            msg: `导入失败：${errors[0] ?? "未解析到任何动效卡片"}`,
          });
          return;
        }
        setComposeItems((prev) => [...prev, ...items]);
        setComposeSelectedId(items[0].id);
        setView("preview");
        const skipped = errors.length ? `，跳过 ${errors.length} 张` : "";
        setImportStatus({
          ok: true,
          msg: `已导入 ${items.length} 张动效卡${skipped}`,
        });
      } catch (e) {
        setImportStatus({
          ok: false,
          msg: `导入失败：${e instanceof Error ? e.message : "JSON 解析错误"}`,
        });
      }
    },
    [],
  );

  const pickVideo = useCallback(
    (file: File) => {
      if (!projectId) return;
      setVideo((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { name: file.name, url: URL.createObjectURL(file) };
      });
      void saveVideoFor(projectId, file, file.name);
      // 导入原始视频即确定展示时间：读取视频时长并自动对齐项目时长
      const url = URL.createObjectURL(file);
      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.onloadedmetadata = () => {
        const d = probe.duration;
        URL.revokeObjectURL(url);
        if (Number.isFinite(d) && d > 0) {
          setProject((p) =>
            p ? { ...p, duration: sanitizeDuration(d) } : p,
          );
        }
      };
      probe.onerror = () => URL.revokeObjectURL(url);
      probe.src = url;
    },
    [projectId],
  );

  /** 手动把项目时长对齐到已导入视频的时长 */
  const alignToVideo = useCallback(() => {
    if (!video) return;
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      const d = probe.duration;
      URL.revokeObjectURL(probe.src);
      if (Number.isFinite(d) && d > 0) {
        setProject((p) =>
          p ? { ...p, duration: sanitizeDuration(d) } : p,
        );
      }
    };
    probe.onerror = () => URL.revokeObjectURL(probe.src);
    probe.src = video.url;
  }, [video]);

  const removeVideo = useCallback(() => {
    if (!projectId) return;
    setVideo((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    void clearVideoFor(projectId);
  }, [projectId]);

  /** 把组件添加进画布（卡库打开、数字键快速添加共用） */
  const addComponent = useCallback(
    (id: string) => {
      if (!project) return;
      const def = REGISTRY.find((d) => d.id === id);
      if (!def) return;
      const counts: Record<AnchorKind, number> = {
        side: 0,
        bottom: 0,
        center: 0,
        compare: 0,
      };
      for (const it of composeItems) {
        const d = REGISTRY.find((x) => x.id === it.componentId);
        if (d) counts[anchorKindOf(d)] += 1;
      }
      const params = { ...(paramsMap[id] ?? def.defaults) };
      const next = expandAdd(def, params, counts, nextId).map((it) => ({
        ...it,
        // 数字键/卡库添加 = 创建对象：出现时间落在当前播放头
        start: Math.min(
          Math.round(playheadRef.current * 10) / 10,
          Math.max(0, project.duration - 0.1),
        ),
        end: project.duration,
      }));
      setComposeItems((prev) => [...prev, ...next]);
      setComposeSelectedId(next[next.length - 1]?.id ?? null);
    },
    [composeItems, paramsMap, project],
  );

  const openFromLibrary = useCallback(
    (id: string) => {
      setView("preview");
      addComponent(id);
    },
    [addComponent],
  );

  // 预览台卡片参数与 paramsMap 打通：
  // 预览台里改某组件参数 → 同步到 paramsMap，后续添加/预设继承同一配置
  const syncComposeParam = useCallback(
    (componentId: string, key: string, value: ParamValue) => {
      setParamsMap((prev) => ({
        ...prev,
        [componentId]: { ...prev[componentId], [key]: value },
      }));
    },
    [],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (page !== "editor") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      ) {
        return;
      }
      if (e.key === "l" || e.key === "L") {
        setView((v) => (v === "library" ? "preview" : "library"));
        return;
      }
      if (e.key === "c" || e.key === "C") {
        setView("preview");
        return;
      }
      if (e.key === "s" || e.key === "S") {
        setSafeZone((s) => ({ ...s, visible: !s.visible }));
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= REGISTRY.length) {
        // 数字键：把对应组件直接添加到画布
        const def = REGISTRY[n - 1];
        if (def) addComponent(def.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, addComponent]);

  return (
    <div className="app">
      {page === "projects" ? (
        <>
          <ProjectsPage
            theme={theme}
            onThemeChange={setTheme}
            onOpenProject={openProject}
            onOpenGuide={() => setGuideOpen(true)}
          />
          <GuideDialog open={guideOpen} onClose={() => setGuideOpen(false)} />
        </>
      ) : project ? (
        <>
          <TopBar
            view={view}
            onBack={goProjects}
            onOpenGuide={() => setGuideOpen(true)}
            theme={theme}
            onThemeChange={setTheme}
            onViewChange={setView}
            project={project}
            onProjectNameChange={(name) =>
              setProject((p) => (p ? { ...p, name } : p))
            }
            onProjectDurationChange={(seconds) =>
              setProject((p) =>
                p ? { ...p, duration: sanitizeDuration(seconds) } : p,
              )
            }
            onNewProject={handleNewProject}
            onAlignToVideo={alignToVideo}
            video={video}
            onPickVideo={pickVideo}
            onRemoveVideo={removeVideo}
            onImportOverlayJson={importOverlayJson}
            importStatus={importStatus}
            onExport={openExport}
            exporting={exporting}
            hasItems={composeItems.length > 0}
            exportResult={exportResult}
          />
          {view === "library" ? (
            <div className="app-main">
              <ShotLibrary onOpenComponent={openFromLibrary} />
            </div>
          ) : (
            <ComposeView
              safeZone={safeZone}
              items={composeItems}
              selectedId={composeSelectedId}
              paramsMap={paramsMap}
              onItemsChange={setComposeItems}
              onSelect={setComposeSelectedId}
              onSyncParam={syncComposeParam}
              onSafeZoneChange={patchSafeZone}
              project={project}
              video={video}
              onPlayheadChange={(t) => {
                playheadRef.current = t;
              }}
              runId={exportRunId}
              onReplay={replayCompose}
              exporting={exporting}
            />
          )}
          <ExportDialog
            open={exportOpen}
            hasItems={composeItems.length > 0}
            projectDuration={project?.duration ?? 10}
            onClose={closeExport}
            replay={replayCompose}
            onDone={handleExportDone}
            onExportingChange={setExporting}
          />
          <GuideDialog open={guideOpen} onClose={() => setGuideOpen(false)} />
        </>
      ) : null}
    </div>
  );
}
