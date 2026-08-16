import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { ParamValue, Params, PreviewDefinition } from "../types";
import { REGISTRY } from "../registry";
import { CATEGORIES } from "../categories";
import { ControlPanelBody } from "./controls";
import { buildAppearanceStyle } from "../appearance";
import { AnimClockCtx } from "../lib/motion";
import { SafeZone } from "../previews/SafeZone";
import { SafeZoneGroup, type SafeZoneState } from "./SafeZoneGroup";
import { CanvasShell } from "./CanvasShell";
import { TimelineBar, fmtClock } from "./TimelineBar";
import type { Project } from "../projectState";
import {
  CANVAS_H,
  CANVAS_W,
  nextId,
  type ComposeItem,
} from "../composeState";
import {
  EST_SIZE,
  anchorKindOf,
  isBothSplit,
} from "../composeLayout";

/* ============================================================
   ComposeView · 预览台（自由布局）
   左侧按分类多选动效卡 → 添加到 1920×1080 画布任意位置，
   支持导入本地视频作背景、点击卡片在右侧配置参数、八方向
   调整卡片框。每张卡片 = 一个迷你画布裁剪窗口，组件内容随
   窗口平移，中间人物安全区始终保留。

   状态（items / selectedId）由 App 持有：
   - 切换 预览台/卡库 不丢失，并持久化到 localStorage；
   - 参数与 paramsMap 打通：添加时继承当前配置，卡内修改
     同步回 paramsMap，后续添加/预设保持一致。
   ============================================================ */

/** 手动调整卡片框的最小尺寸（canvas px） */
const MIN_CARD_W = 160;
const MIN_CARD_H = 90;

/** 卡片框缩放手柄：四角 + 四边中点 */
const RESIZE_HANDLES: { dir: ResizeDir; title: string }[] = [
  { dir: "n", title: "拖拽调整高度" },
  { dir: "s", title: "拖拽调整高度" },
  { dir: "e", title: "拖拽调整宽度" },
  { dir: "w", title: "拖拽调整宽度" },
  { dir: "ne", title: "拖拽调整大小" },
  { dir: "nw", title: "拖拽调整大小" },
  { dir: "se", title: "拖拽调整大小" },
  { dir: "sw", title: "拖拽调整大小" },
];
type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const defOf = (id: string | null): PreviewDefinition | undefined =>
  id ? REGISTRY.find((d) => d.id === id) : undefined;

/** 组件的迷你画布内是否有全画布外壳类（测量时跳过外壳本身） */
function isCanvasShell(el: Element): boolean {
  return (
    el.classList.contains("preview-frame") || el.classList.contains("pf-chart")
  );
}

/* ---------- 画布上的自由卡片 ---------- */

interface FreeItemProps {
  item: ComposeItem;
  def: PreviewDefinition;
  selected: boolean;
  zIndex: number;
  runId: number;
  frameVars: CSSProperties;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  /** 调整卡片框：新位置 + 新尺寸（拖左/上边时位置联动） */
  onResize: (x: number, y: number, w: number, h: number) => void;
  /** 自动测量完成后上报内容盒尺寸（用于面板显示/转手动时补齐） */
  onSizeChange: (w: number, h: number) => void;
  onRemove: () => void;
  /** SRT 时间轴可见性：start/end 区间内为 true（导出帧过滤也读取 data-start/end） */
  visible: boolean;
}

function FreeItem({
  item,
  def,
  selected,
  zIndex,
  runId,
  frameVars,
  onSelect,
  onMove,
  onResize,
  onSizeChange,
  onRemove,
  visible,
}: FreeItemProps) {
  const kind = anchorKindOf(def);
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    scale: number;
  } | null>(null);
  const sizeChangeRef = useRef(onSizeChange);
  sizeChangeRef.current = onSizeChange;

  /* 测量组件真实内容盒（相对迷你画布）：
     取组件全部可见内容的并集（跳过 .pf-chrome 角落信息与全画布外壳），
     translate = 内容原生位置取负，让内容左上角贴齐窗口左上角。
     这样卡片窗口与预览台展示区域一致：包含水印/副数据/底部结论等全部内容。 */
  const measure = useCallback(() => {
    const frame = frameRef.current;
    if (!frame || !visible) return;
    const scale = frame.getBoundingClientRect().width / CANVAS_W;
    const fr = frame.getBoundingClientRect();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const el of frame.querySelectorAll("*")) {
      if (isCanvasShell(el)) continue; // 1920×1080 外壳，取其内容即可
      if (el.closest(".pf-chrome")) continue; // 角落取景信息不参与测量
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 && r.height < 1) continue;
      const x = (r.left - fr.left) / scale;
      const y = (r.top - fr.top) / scale;
      const w = r.width / scale;
      const h = r.height / scale;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    }
    if (Number.isFinite(minX) && maxX > minX && maxY > minY) {
      const w = Math.min(CANVAS_W, Math.max(120, maxX - minX));
      const h = Math.min(CANVAS_H, Math.max(60, maxY - minY));
      // 覆盖式：以最近一次测量为准，动画中间帧不再把框永久撑大
      setBox({ x: minX, y: minY, w, h });
      sizeChangeRef.current?.(w, h);
    }
  }, [def.id, visible]);

  /* 首帧前测量一次，避免闪烁；入场动画后再精修两次；
     时间轴隐藏（display:none）时跳过测量，恢复可见时重新测量 */
  useLayoutEffect(() => {
    measure();
  }, [measure, runId, item.params, visible]);
  useEffect(() => {
    const t1 = setTimeout(measure, 180);
    const t2 = setTimeout(measure, 900);
    const t3 = setTimeout(measure, 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [measure, runId, item.params]);

  const manualW = item.w;
  const manualH = item.h;
  const manual = manualW != null && manualH != null;
  const size = manual
    ? { w: manualW, h: manualH }
    : box
      ? { w: box.w, h: box.h }
      : EST_SIZE[kind];
  /* 测量前用估算锚点预偏移（side 按参数朝向） */
  let ox: number;
  let oy: number;
  if (box) {
    ox = -box.x;
    oy = -box.y;
  } else {
    const est = EST_SIZE[kind];
    const sideRight =
      kind === "side" && String(item.params.side) === "right";
    ox = kind === "side" ? (sideRight ? 1374 : 26) : kind === "bottom" ? 570 : 160;
    oy = kind === "bottom" ? 906 : (CANVAS_H - est.h) / 2;
  }
  const Preview = def.component;

  const onHandleDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    onSelect();
    const scaler = e.currentTarget.closest(".canvas-scaler");
    const scale = scaler
      ? scaler.getBoundingClientRect().width / CANVAS_W
      : 1;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y,
      scale,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onHandleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.startX) / d.scale;
    const dy = (e.clientY - d.startY) / d.scale;
    const nx = Math.max(0, Math.min(CANVAS_W - size.w, Math.round(d.origX + dx)));
    const ny = Math.max(0, Math.min(CANVAS_H - size.h, Math.round(d.origY + dy)));
    if (nx !== item.x || ny !== item.y) onMove(nx, ny);
  };

  const onHandleUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const resizeRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
    scale: number;
    dir: ResizeDir;
  } | null>(null);

  const onResizeDown = (dir: ResizeDir, e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    onSelect();
    const scaler = e.currentTarget.closest(".canvas-scaler");
    const scale = scaler
      ? scaler.getBoundingClientRect().width / CANVAS_W
      : 1;
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y,
      origW: size.w,
      origH: size.h,
      scale,
      dir,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onResizeMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = resizeRef.current;
    if (!r) return;
    const dw = (e.clientX - r.startX) / r.scale;
    const dh = (e.clientY - r.startY) / r.scale;
    let nx = r.origX;
    let ny = r.origY;
    let nw = r.origW;
    let nh = r.origH;
    if (r.dir.includes("e")) nw = r.origW + dw;
    if (r.dir.includes("w")) {
      nw = r.origW - dw;
      nx = r.origX + dw;
    }
    if (r.dir.includes("s")) nh = r.origH + dh;
    if (r.dir.includes("n")) {
      nh = r.origH - dh;
      ny = r.origY + dh;
    }
    /* 防止拖过对边导致尺寸翻负：钳到最小并固定对边 */
    if (nw < MIN_CARD_W) {
      nw = MIN_CARD_W;
      if (r.dir.includes("w")) nx = r.origX + r.origW - MIN_CARD_W;
    }
    if (nh < MIN_CARD_H) {
      nh = MIN_CARD_H;
      if (r.dir.includes("n")) ny = r.origY + r.origH - MIN_CARD_H;
    }
    nx = Math.max(0, Math.min(CANVAS_W - nw, Math.round(nx)));
    ny = Math.max(0, Math.min(CANVAS_H - nh, Math.round(ny)));
    nw = Math.round(nw);
    nh = Math.round(nh);
    if (nx !== item.x || ny !== item.y || nw !== size.w || nh !== size.h) {
      onResize(nx, ny, nw, nh);
    }
  };

  const onResizeUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    resizeRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className={`free-item${selected ? " sel" : ""}`}
      data-start={item.start != null ? item.start : undefined}
      data-end={item.end != null ? item.end : undefined}
      style={{
        left: item.x,
        top: item.y,
        width: size.w,
        height: size.h,
        zIndex,
        display: visible ? undefined : "none",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        className="free-item-canvas"
        style={{ transform: `translate(${ox}px, ${oy}px)` }}
      >
        <div className="mini-frame" style={{ ...frameVars, ...buildAppearanceStyle(item.params) }} ref={frameRef}>
          <AnimClockCtx.Provider value={item.start ?? 0}>
            <Preview
              key={`${item.id}:${runId}:${visible ? "v" : "h"}`}
              params={item.params}
            />
          </AnimClockCtx.Provider>
        </div>
      </div>
      <div
        className="free-item-handle"
        onPointerDown={onHandleDown}
        onPointerMove={onHandleMove}
        onPointerUp={onHandleUp}
        onPointerCancel={onHandleUp}
      >
        <span className="free-item-grip">⠿</span>
        <span className="free-item-label">
          {def.index} · {def.nameEn}
        </span>
        <span className="free-item-pos">
          {Math.round(item.x)},{Math.round(item.y)}
        </span>
      </div>
      {selected && (
        <button
          type="button"
          className="free-item-del"
          title="删除卡片"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          ×
        </button>
      )}
      {RESIZE_HANDLES.map((h) => (
        <div
          key={h.dir}
          className={`free-item-resize free-item-resize-${h.dir}`}
          title={h.title}
          onPointerDown={(e) => onResizeDown(h.dir, e)}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeUp}
          onPointerCancel={onResizeUp}
        />
      ))}
    </div>
  );
}

/* ---------- 组合台主视图 ---------- */

const PRESET_DUO = [
  { componentId: "chart-line-growth", x: 24, y: 260 },
  { componentId: "chart-donut-share", x: 1372, y: 260 },
];
const PRESET_TRIO = [
  ...PRESET_DUO,
  { componentId: "bottom-band", x: 570, y: 892 },
];

interface ComposeViewProps {
  safeZone: SafeZoneState;
  items: ComposeItem[];
  selectedId: string | null;
  paramsMap: Record<string, Params>;
  onItemsChange: (
    items: ComposeItem[] | ((prev: ComposeItem[]) => ComposeItem[]),
  ) => void;
  onSelect: (id: string | null) => void;
  onSyncParam: (componentId: string, key: string, value: ParamValue) => void;
  onSafeZoneChange: (patch: Partial<SafeZoneState>) => void;
  /** 项目：总时长决定时间轴与导出长度 */
  project: Project;
  video: { name: string; url: string } | null;
  /** 播放头时间同步给 App（数字键添加组件时落点用） */
  onPlayheadChange?: (t: number) => void;
  /** 由外部（导出透明动效层）驱动的重放：runId 变化 → 全部卡片重新挂载 */
  runId?: number;
  onReplay?: () => void;
  /** 导出中：时间轴切到内部时钟（不跟随视频播放），保证按帧挂载可见卡片 */
  exporting?: boolean;
  /** 只读预览（项目管理页预览项目）：强制纯预览，隐藏编辑区，仅画布+时间轴 */
  readonly?: boolean;
}

export function ComposeView({
  safeZone,
  items,
  selectedId,
  paramsMap,
  onItemsChange,
  onSelect,
  onSyncParam,
  onSafeZoneChange,
  project,
  video,
  onPlayheadChange,
  runId: runIdProp,
  onReplay,
  exporting = false,
  readonly = false,
}: ComposeViewProps) {
  const [innerRunId, setInnerRunId] = useState(0);
  const runId = runIdProp ?? innerRunId;
  const [query, setQuery] = useState("");
  const [innerPreviewMode, setInnerPreviewMode] = useState(false);
  /** 只读预览（项目管理页）：强制纯预览，隐藏编辑区 */
  const previewMode = readonly || innerPreviewMode;
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  /** 画布视频播放控制 */
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoVolume, setVideoVolume] = useState(0.8);
  const [videoMuted, setVideoMuted] = useState(true);
  /** 时间轴时钟：SRT 导入卡片（带 start/end）按当前秒数挂载；
      有视频时跟随 videoTime，导出/无视频时由内部 rAF 驱动 */
  const [timelineT, setTimelineT] = useState(0);
  /** 各卡片自动测量的内容盒尺寸（面板显示 + 转手动时补齐另一个维度） */
  const [measured, setMeasured] = useState<
    Record<string, { w: number; h: number }>
  >({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return REGISTRY;
    return REGISTRY.filter((d) => {
      const meta = CATEGORIES.find((c) => c.id === d.category);
      const hay = [
        d.name,
        d.nameEn,
        d.description,
        d.id,
        d.index,
        meta?.label ?? "",
        meta?.labelEn ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  /* 按分类分组（搜索时平铺全部匹配） */
  const groups = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        cat,
        items: filtered
          .filter((d) => d.category === cat.id)
          .sort((a, b) => Number(a.index) - Number(b.index)),
      })).filter((g) => g.items.length > 0),
    [filtered],
  );
  const searching = query.trim().length > 0;

  const fmtTime = (t: number) => {
    if (!Number.isFinite(t) || t < 0) return "--:--";
    const m = Math.max(0, Math.floor(t / 60));
    const sec = Math.max(0, Math.floor(t % 60));
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const stopVideo = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setVideoTime(0);
  }, []);

  const seekVideo = useCallback((t: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = t;
    setVideoTime(t);
  }, []);

  const changeVolume = useCallback((vol: number) => {
    const v = videoRef.current;
    if (!v) return;
    // 拖动音量时同步取消静音（若拖到 0 则视为静音）
    v.muted = vol <= 0;
    v.volume = vol;
    setVideoVolume(vol);
    setVideoMuted(vol <= 0);
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  }, []);

  /* 切换/更换视频时重置播放状态 */
  useEffect(() => {
    setVideoTime(0);
    setVideoDuration(0);
    setVideoPlaying(false);
  }, [video?.url]);

  const toggleGroup = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const replay = useCallback(() => {
    if (onReplay) onReplay();
    else setInnerRunId((r) => r + 1);
    // 时间轴时钟：重放时回到 0 从头播放
    timelineRef.current = 0;
    setTimelineT(0);
    setTimelinePlaying(true);
  }, [onReplay]);

  /* ---------- 项目时间轴时钟 ----------
     无视频时由内部 rAF 从当前播放头按项目总时长循环推进；
     有视频时跟随视频播放进度（videoTime）；导出中由导出端
     用 AnimClockOverride 固定到每帧时刻。带 start/end 的卡片
     按当前时刻挂载，无 start 的卡片全程可见。 */
  const [timelinePlaying, setTimelinePlaying] = useState(true);
  const timelineRef = useRef(0);
  useEffect(() => {
    timelineRef.current = timelineT;
  }, [timelineT]);

  /** 拖动/点击时间轴定位播放头 */
  const seekTimeline = useCallback(
    (t: number) => {
      const tt = Math.max(0, Math.min(project.duration, t));
      if (video && !exporting) {
        seekVideo(tt);
      } else {
        timelineRef.current = tt;
        setTimelineT(tt);
      }
    },
    [project.duration, video, exporting, seekVideo],
  );

  /** 播放/暂停：有视频控制视频，无视频控制内部时钟 */
  const toggleTimelinePlay = useCallback(() => {
    if (video && !exporting) {
      togglePlay();
      return;
    }
    setTimelinePlaying((v) => !v);
  }, [video, exporting, togglePlay]);

  /** 停止：回到 0 并暂停 */
  const stopTimeline = useCallback(() => {
    if (video && !exporting) {
      stopVideo();
    }
    timelineRef.current = 0;
    setTimelineT(0);
    setTimelinePlaying(false);
  }, [video, exporting, stopVideo]);

  useEffect(() => {
    if (exporting || video) return; // 有视频/导出中不跑内部时钟
    if (project.duration <= 0) return;
    if (!timelinePlaying) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      let next = timelineRef.current + dt;
      if (next >= project.duration) next = next % project.duration; // 循环播放
      timelineRef.current = next;
      setTimelineT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // runId 变化（重放）时重启时钟：replay 已把播放头重置为 0
  }, [exporting, video, project.duration, timelinePlaying, runId]);

  /** 当前时间轴时刻：有视频且非导出时跟随视频播放 */
  const timelineNow = video && !exporting ? videoTime : timelineT;

  /* 播放头同步给 App（数字键快速添加组件时落点用） */
  useEffect(() => {
    onPlayheadChange?.(timelineNow);
  }, [timelineNow, onPlayheadChange]);
  /* ---------- 从左侧拖入画布 ---------- */
  const dropBoxL = useRef<HTMLDivElement>(null);
  const dropBoxR = useRef<HTMLDivElement>(null);
  const dragIdRef = useRef<string | null>(null);

  /** 计算拖放落点：both 组件拆左卡（落点）+ 右卡（画布对称位），其余单卡居中落点 */
  const dropSpots = useCallback(
    (id: string, cx: number, cy: number) => {
      const def = defOf(id);
      if (!def) return null;
      const params = paramsMap[id] ?? def.defaults;
      const est = EST_SIZE[anchorKindOf(def)];
      const clampX = (w: number, x: number) =>
        Math.max(0, Math.min(CANVAS_W - w, Math.round(x)));
      const clampY = (h: number, y: number) =>
        Math.max(0, Math.min(CANVAS_H - h, Math.round(y)));
      if (isBothSplit(def, params)) {
        const { w, h } = est;
        const lx = clampX(w, cx - w / 2);
        const ly = clampY(h, cy - h / 2);
        // 右卡相对画布中心与左卡左右对称
        const rx = CANVAS_W - (lx + w);
        return {
          left: { x: lx, y: ly, w, h },
          right: { x: rx, y: ly, w, h },
          both: true as const,
        };
      }
      return {
        left: {
          x: clampX(est.w, cx - est.w / 2),
          y: clampY(est.h, cy - est.h / 2),
          w: est.w,
          h: est.h,
        },
        both: false as const,
      };
    },
    [paramsMap],
  );

  const showDropBox = useCallback(
    (l: { x: number; y: number; w: number; h: number } | null, r: { x: number; y: number; w: number; h: number } | null) => {
      const apply = (
        box: HTMLDivElement | null,
        b: { x: number; y: number; w: number; h: number } | null,
      ) => {
        if (!box) return;
        if (!b) {
          box.style.display = "none";
          return;
        }
        box.style.display = "block";
        box.style.left = `${b.x}px`;
        box.style.top = `${b.y}px`;
        box.style.width = `${b.w}px`;
        box.style.height = `${b.h}px`;
      };
      apply(dropBoxL.current, l);
      apply(dropBoxR.current, r);
    },
    [],
  );

  /** 拖放添加组件（both 拆左右两张，其余单张） */
  const dropComponent = useCallback(
    (id: string, cx: number, cy: number) => {
      const def = defOf(id);
      if (!def) return;
      const params = { ...(paramsMap[id] ?? def.defaults) };
      const spots = dropSpots(id, cx, cy);
      if (!spots) return;
      const next: ComposeItem[] = [];
      // 拖入 = 在画布上创建一个对象：出现时间落在当前播放头，
      // 默认持续到项目结束（可在右侧面板设置消失时间）
      const start = Math.min(
        Math.round(timelineNow * 10) / 10,
        Math.max(0, project.duration - 0.1),
      );
      const end = project.duration;
      if (spots.both) {
        next.push({
          id: nextId(),
          componentId: id,
          params: { ...params, side: "left" },
          x: spots.left.x,
          y: spots.left.y,
          start,
          end,
        });
        next.push({
          id: nextId(),
          componentId: id,
          params: { ...params, side: "right" },
          x: spots.right.x,
          y: spots.right.y,
          start,
          end,
        });
      } else {
        next.push({
          id: nextId(),
          componentId: id,
          params,
          x: spots.left.x,
          y: spots.left.y,
          start,
          end,
        });
      }
      onItemsChange((prev) => [...prev, ...next]);
      onSelect(next[next.length - 1].id);
      replay();
    },
    [paramsMap, dropSpots, onItemsChange, onSelect, replay, timelineNow, project.duration],
  );

  const onCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    const id = dragIdRef.current;
    if (!id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = rect.width / CANVAS_W;
    const cx = (e.clientX - rect.left) / scale;
    const cy = (e.clientY - rect.top) / scale;
    const spots = dropSpots(id, cx, cy);
    if (spots) showDropBox(spots.left, spots.right ?? null);
  };

  const onCanvasDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      showDropBox(null, null);
    }
  };

  const onCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = dragIdRef.current;
    dragIdRef.current = null;
    showDropBox(null, null);
    if (!id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = rect.width / CANVAS_W;
    const cx = (e.clientX - rect.left) / scale;
    const cy = (e.clientY - rect.top) / scale;
    dropComponent(id, cx, cy);
  };



  useEffect(() => {
    if (readonly) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      ) {
        return;
      }
      if (e.key === "r" || e.key === "R") {
        replay();
        return;
      }
      if (e.key === "p" || e.key === "P") {
        setInnerPreviewMode((v) => !v);
        return;
      }
      if (e.code === "Space" && video) {
        e.preventDefault();
        togglePlay();
        return;
      }
      if (e.key === "Escape") {
        if (previewMode) setInnerPreviewMode(false);
        else onSelect(null);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        if (previewMode) return;
        onItemsChange((prev) => prev.filter((it) => it.id !== selectedId));
        onSelect(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, previewMode, readonly, replay, onSelect, video, togglePlay]);

  const moveItem = useCallback(
    (id: string, x: number, y: number) => {
      onItemsChange((prev) =>
        prev.map((it) => (it.id === id ? { ...it, x, y } : it)),
      );
    },
    [onItemsChange],
  );

  /** 手动设置卡片框尺寸（进入手动模式，不再随内容自动变化） */
  const resizeItem = useCallback(
    (id: string, x: number, y: number, w: number, h: number) => {
      onItemsChange((prev) =>
        prev.map((it) => {
          if (it.id !== id) return it;
          const cx = Math.max(0, Math.min(CANVAS_W - MIN_CARD_W, Math.round(x)));
          const cy = Math.max(0, Math.min(CANVAS_H - MIN_CARD_H, Math.round(y)));
          return {
            ...it,
            x: cx,
            y: cy,
            w: Math.max(MIN_CARD_W, Math.min(CANVAS_W - cx, Math.round(w))),
            h: Math.max(MIN_CARD_H, Math.min(CANVAS_H - cy, Math.round(h))),
          };
        }),
      );
    },
    [onItemsChange],
  );

  /** 清除手动尺寸，恢复按内容盒自动测量 */
  const resetSize = useCallback(
    (id: string) => {
      onItemsChange((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, w: undefined, h: undefined } : it,
        ),
      );
    },
    [onItemsChange],
  );

  /** 单卡参数：更新卡片本身，并同步回预览台 paramsMap */
  const setItemParam = useCallback(
    (id: string, key: string, value: ParamValue) => {
      const it = items.find((x) => x.id === id);
      onItemsChange((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, params: { ...x.params, [key]: value } } : x,
        ),
      );
      if (it) onSyncParam(it.componentId, key, value);
    },
    [items, onItemsChange, onSyncParam],
  );

  /** 设置卡片对象的出现/消失时间（undefined = 全程） */
  const setItemTime = useCallback(
    (id: string, start: number | undefined, end: number | undefined) => {
      onItemsChange((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, start, end } : it,
        ),
      );
    },
    [onItemsChange],
  );

  const removeItem = useCallback(
    (id: string) => {
      onItemsChange((prev) => prev.filter((it) => it.id !== id));
      if (selectedId === id) onSelect(null);
    },
    [selectedId, onItemsChange, onSelect],
  );

  const clearAll = useCallback(() => {
    onItemsChange(() => []);
    onSelect(null);
    replay();
  }, [onItemsChange, onSelect, replay]);

  const applyPreset = useCallback(
    (preset: { componentId: string; x: number; y: number }[]) => {
      const start = Math.min(
        Math.round(timelineNow * 10) / 10,
        Math.max(0, project.duration - 0.1),
      );
      const end = project.duration;
      const next: ComposeItem[] = [];
      preset.forEach((p) => {
        const def = defOf(p.componentId)!;
        const kind = anchorKindOf(def);
        const est = EST_SIZE[kind];
        const params = { ...(paramsMap[p.componentId] ?? def.defaults) };
        if (isBothSplit(def, params)) {
          // both 拆左右两张：左卡用预设位置，右卡落到右列
          next.push({
            id: nextId(),
            componentId: p.componentId,
            params: { ...params, side: "left" },
            x: Math.max(0, Math.min(CANVAS_W - est.w, p.x)),
            y: Math.max(0, Math.min(CANVAS_H - est.h, p.y)),
            start,
            end,
          });
          next.push({
            id: nextId(),
            componentId: p.componentId,
            params: { ...params, side: "right" },
            x: Math.max(0, Math.min(CANVAS_W - est.w, 1372)),
            y: Math.max(0, Math.min(CANVAS_H - est.h, p.y)),
            start,
            end,
          });
          return;
        }
        next.push({
          id: nextId(),
          componentId: p.componentId,
          params,
          x: Math.max(0, Math.min(CANVAS_W - est.w, p.x)),
          y: Math.max(0, Math.min(CANVAS_H - est.h, p.y)),
          start,
          end,
        });
      });
      onItemsChange(() => next);
      onSelect(next[0]?.id ?? null);
      replay();
    },
    [paramsMap, onItemsChange, onSelect, replay, timelineNow, project.duration],
  );

  const moveLayer = useCallback(
    (id: string, dir: -1 | 1) => {
      onItemsChange((prev) => {
        const i = prev.findIndex((it) => it.id === id);
        if (i < 0) return prev;
        const j = i + dir;
        if (j < 0 || j >= prev.length) return prev;
        const next = [...prev];
        [next[i], next[j]] = [next[j], next[i]];
        return next;
      });
    },
    [onItemsChange],
  );

  const selected = items.find((it) => it.id === selectedId) ?? null;
  const selectedDef = selected ? defOf(selected.componentId) : undefined;
  /* 面板里展示的卡片尺寸：手动 > 自动测量 > 估算 */
  const selectedSize = (() => {
    if (!selected || !selectedDef) return null;
    if (selected.w != null && selected.h != null) {
      return { w: selected.w, h: selected.h, manual: true };
    }
    const m = measured[selected.id];
    const est = EST_SIZE[anchorKindOf(selectedDef)];
    return {
      w: m?.w ?? est.w,
      h: m?.h ?? est.h,
      manual: false,
    };
  })();

  const sfLeft = Math.round((CANVAS_W - safeZone.width) / 2);
  const sfRight = CANVAS_W - sfLeft;
  const frameVars = {
    "--sf-l": `${sfLeft}px`,
    "--sf-r": `${sfRight}px`,
  } as CSSProperties;


  return (
    <div
      className={`app-main${previewMode ? " compose-preview" : ""}${video ? " compose-has-video" : ""}${readonly ? " compose-readonly" : ""}`}
    >
      {/* 左栏：组件库多选 + 画布卡片管理（只读预览时隐藏） */}
      {!readonly && (
      <aside className="sidebar compose-nav">
        <div className="sidebar-head">
          <div className="sidebar-title">预览台 · PROJECT</div>
        </div>

        <div className="compose-lib">
          <div className="compose-lib-head">
            类库 · CLASSES
            <span className="compose-lib-tools">
              <span className="compose-lib-hint">拖到画布 = 创建对象</span>
            </span>
          </div>
          <input
            className="input compose-lib-search"
            type="text"
            placeholder="搜索组件 / 分类 / 关键词…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
          />
          <div className="compose-lib-list">
            {groups.map(({ cat, items: gitems }) => {
              const isCollapsed = !searching && collapsed.has(cat.id);
              return (
                <div className="compose-lib-group" key={cat.id}>
                  <button
                    type="button"
                    className="compose-lib-group-head"
                    onClick={() => toggleGroup(cat.id)}
                    aria-expanded={!isCollapsed}
                  >
                    <span
                      className={`compose-lib-caret${isCollapsed ? " collapsed" : ""}`}
                      aria-hidden
                    >
                      ▾
                    </span>
                    <span className="compose-lib-group-label">
                      {cat.label}
                    </span>
                    <span className="compose-lib-group-en">
                      {cat.labelEn}
                    </span>
                    <span className="compose-lib-group-count">
                      {gitems.length}
                    </span>
                  </button>
                  {!isCollapsed &&
                    gitems.map((d) => (
                      <div
                        key={d.id}
                        className="compose-lib-row"
                        draggable
                        title={`拖到画布添加 ${d.nameEn}`}
                        onDragStart={(e) => {
                          dragIdRef.current = d.id;
                          e.dataTransfer.setData(
                            "application/x-motion-component",
                            d.id,
                          );
                          e.dataTransfer.effectAllowed = "copy";
                          const ghost = document.createElement("div");
                          ghost.className = "compose-drag-ghost";
                          ghost.textContent = `${d.index} ${d.nameEn}`;
                          document.body.appendChild(ghost);
                          e.dataTransfer.setDragImage(ghost, 26, 14);
                          requestAnimationFrame(() => ghost.remove());
                        }}
                        onDragEnd={() => {
                          dragIdRef.current = null;
                          showDropBox(null, null);
                        }}
                      >
                        <span className="compose-lib-grip" aria-hidden>
                          ⠿
                        </span>
                        <span className="compose-lib-name">
                          <b>{d.index}</b> {d.nameEn}
                        </span>
                        <span className="compose-lib-cat">
                          {d.name}
                          {d.id.startsWith("shot-") ? " · 卡" : ""}
                        </span>
                      </div>
                    ))}
                </div>
              );
            })}
            {searching && groups.length === 0 && (
              <div className="compose-lib-empty">未找到 “{query}”</div>
            )}
          </div>
          <div className="compose-lib-foot">
            <span className="compose-lib-tip">
              ⇱ 拖动组件到画布任意位置 · 数字键 1–{REGISTRY.length} 快速添加
            </span>
          </div>
        </div>

        <div className="compose-list">
          <div className="compose-list-head">
            画布对象 · {items.length}
          </div>
          {items.length === 0 ? (
            <div className="compose-empty">
              从上方列表拖动组件到画布，或按数字键 1–{REGISTRY.length} 添加
            </div>
          ) : (
            items.map((it, i) => {
              const def = defOf(it.componentId);
              if (!def) return null;
              return (
                <div
                  key={it.id}
                  className={`compose-item-row${selectedId === it.id ? " active" : ""}`}
                  onClick={() => onSelect(it.id)}
                >
                  <span className="compose-item-z">{i + 1}</span>
                  <span className="compose-item-name">
                    {def.index} · {def.nameEn}
                  </span>
                  <span className="compose-item-pos">
                    {Math.round(it.x)},{Math.round(it.y)}
                  </span>
                  <span className="compose-item-time">
                    {it.start != null
                      ? `${it.start.toFixed(1)}s–${(it.end ?? project.duration).toFixed(1)}s`
                      : "全程"}
                  </span>
                  <button
                    type="button"
                    className="compose-item-del"
                    title="删除"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(it.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="compose-presets">
          <div className="compose-list-head">快速布局</div>
          <div className="compose-preset-btns">
            <button type="button" className="compose-template-btn" onClick={() => applyPreset(PRESET_DUO)}>
              左右 2 卡
            </button>
            <button type="button" className="compose-template-btn" onClick={() => applyPreset(PRESET_TRIO)}>
              左右+底部
            </button>
            <button type="button" className="compose-template-btn danger" onClick={clearAll}>
              清空画布
            </button>
          </div>

          <div className="compose-safezone">
            <div className="compose-list-head">安全区 · SAFE ZONE</div>
            <SafeZoneGroup state={safeZone} onChange={onSafeZoneChange} />
          </div>

          <div className="compose-preview-toggle">
            <button
              type="button"
              className={`compose-template-btn${previewMode ? " on" : ""}`}
              onClick={() => setInnerPreviewMode((v) => !v)}
              title="快捷键 P：隐藏操作框与安全区，纯预览"
            >
              {previewMode ? "✕ 退出预览" : "◉ 预览模式"}
            </button>
            <span className="compose-preview-hint">
              <b>P</b> 预览 · <b>ESC</b> 取消选中
            </span>
          </div>
        </div>

        <div className="sidebar-foot">
          <i />
          PREVIEW · FREE LAYOUT · DRAG / CLICK / DEL
        </div>
      </aside>
      )}

      {/* 中间画布 + 时间轴 */}
      <div className="canvas-zone">
      <CanvasShell
        frameVars={frameVars}
        onReplay={replay}
        onDragOver={onCanvasDragOver}
        onDragLeave={onCanvasDragLeave}
        onDrop={onCanvasDrop}
        hud={{
          label: readonly ? "PROJECT PREVIEW" : previewMode ? "PREVIEW · CLEAN" : "PREVIEW",
          sub: readonly
            ? "只读预览 · 播放 / 拖动时间轴查看动效"
            : previewMode
              ? "纯预览 · 点击任意处退出"
              : `${items.length} CARD${items.length === 1 ? "" : "S"}${video ? " · VIDEO BG" : ""} · PERSON CENTER`,
        }}
      >
        <div
          className="compose-backdrop"
          onClick={() => {
            if (previewMode) setInnerPreviewMode(false);
            else onSelect(null);
          }}
        />
        <div
          ref={dropBoxL}
          className="compose-drop-box"
          style={{ display: "none" }}
        />
        <div
          ref={dropBoxR}
          className="compose-drop-box"
          style={{ display: "none" }}
        />
        {video && (
          <>
          <div className="compose-video-layer">
            <video
              ref={videoRef}
              src={video.url}
              autoPlay
              muted={videoMuted}
              loop
              playsInline
              onLoadedMetadata={(e) => {
                const d = e.currentTarget.duration;
                setVideoDuration(Number.isFinite(d) ? d : 0);
              }}
              onDurationChange={(e) => {
                // webm 等格式先报告 Infinity，之后变为有限值
                const d = e.currentTarget.duration;
                if (Number.isFinite(d) && d > 0) setVideoDuration(d);
              }}
              onTimeUpdate={(e) => setVideoTime(e.currentTarget.currentTime)}
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              onEnded={() => setVideoPlaying(false)}
              onVolumeChange={(e) => {
                setVideoVolume(e.currentTarget.volume);
                setVideoMuted(e.currentTarget.muted);
              }}
            />
            <span className="compose-video-tag">{video.name}</span>
          </div>
          <div className="compose-video-controls">
            <button
              type="button"
              className="vc-btn"
              onClick={togglePlay}
              title={videoPlaying ? "暂停（空格）" : "播放（空格）"}
            >
              {videoPlaying ? "❚❚" : "▶"}
            </button>
            <button
              type="button"
              className="vc-btn"
              onClick={stopVideo}
              title="停止"
            >
              ■
            </button>
            <span className="vc-time">{fmtTime(videoTime)}</span>
            <input
              className="range vc-progress"
              type="range"
              min={0}
              max={videoDuration || 0}
              step={0.1}
              value={videoDuration ? Math.min(videoTime, videoDuration) : 0}
              disabled={!videoDuration}
              onChange={(e) => seekVideo(Number(e.target.value))}
              title="拖动进度"
            />
            <span className="vc-time">{fmtTime(videoDuration)}</span>
            <button
              type="button"
              className={`vc-btn${videoMuted ? " muted" : ""}`}
              onClick={toggleMute}
              title={videoMuted ? "取消静音" : "静音"}
            >
              <span className="vc-vol-icon">♪</span>
            </button>
            <input
              className="range vc-vol"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={videoMuted ? 0 : videoVolume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              title="音量"
            />
          </div>
          </>
        )}
        {!previewMode && (
          <SafeZone
            visible={safeZone.visible}
            width={safeZone.width}
            opacity={safeZone.opacity}
          />
        )}
        {items.map((it, i) => {
          const def = defOf(it.componentId);
          if (!def) return null;
          // SRT 时间轴：start/end 区间内可见；无 start 的卡片全程可见。
          // 导出中强制全部可见：display:none 的卡片动画计算样式不可读，
          // 会让导出帧空白；具体哪些卡片进入当前帧由导出端按 start/end 过滤。
          const visible =
            exporting ||
            it.start == null ||
            (timelineNow >= it.start && timelineNow < (it.end ?? Infinity));
          return (
            <FreeItem
              key={it.id}
              item={it}
              def={def}
              selected={selectedId === it.id}
              zIndex={i + 2}
              runId={runId}
              frameVars={frameVars}
              visible={visible}
              onSelect={() => onSelect(it.id)}
              onMove={(x, y) => moveItem(it.id, x, y)}
              onResize={(x, y, w, h) => resizeItem(it.id, x, y, w, h)}
              onSizeChange={(w, h) =>
                setMeasured((prev) =>
                  prev[it.id]?.w === w && prev[it.id]?.h === h
                    ? prev
                    : { ...prev, [it.id]: { w, h } },
                )
              }
              onRemove={() => removeItem(it.id)}
            />
          );
        })}
      </CanvasShell>
        <TimelineBar
          duration={project.duration}
          current={timelineNow}
          playing={video && !exporting ? videoPlaying : timelinePlaying}
          items={items.map((it) => {
            const def = defOf(it.componentId);
            return {
              id: it.id,
              label: def ? `${def.index}·${def.nameEn}` : "?",
              start: it.start,
              end: it.end,
            };
          })}
          onSeek={seekTimeline}
          onTogglePlay={toggleTimelinePlay}
          onStop={stopTimeline}
          onSelectItem={onSelect}
        />
      </div>

      {/* 右栏：选中卡片配置（只读预览时隐藏） */}
      {!readonly && (
      <aside className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">
              {selectedDef ? selectedDef.name : "未选择卡片"}
            </div>
            <small>
              {selectedDef
                ? `${selectedDef.nameEn} · X ${Math.round(selected?.x ?? 0)} Y ${Math.round(selected?.y ?? 0)}`
                : "点画布卡片或左侧列表选择"}
            </small>
          </div>
        </div>
        {selected && selectedDef ? (
          <ControlPanelBody
            defs={selectedDef.controls}
            params={selected.params}
            onParamChange={(k, v) => setItemParam(selected.id, k, v)}
            header={
              <div>
              <div className="compose-time">
                <div className="compose-time-head">
                  时间轴 · TIMELINE
                  <span className="compose-time-hint">拖入时自动落在当前播放头</span>
                </div>
                <div className="compose-time-row">
                  <label className="compose-time-field">
                    出现
                    <input
                      className="input"
                      type="number"
                      min={0}
                      max={project.duration}
                      step={0.1}
                      value={
                        selected.start != null
                          ? Math.round(selected.start * 10) / 10
                          : 0
                      }
                      onChange={(e) => {
                        const v = Number(e.target.value) || 0;
                        const st = Math.max(
                          0,
                          Math.min(project.duration - 0.1, v),
                        );
                        const en = selected.end ?? project.duration;
                        setItemTime(
                          selected.id,
                          st,
                          en > st ? en : Math.min(project.duration, st + 0.1),
                        );
                      }}
                    />
                  </label>
                  <label className="compose-time-field">
                    消失
                    <input
                      className="input"
                      type="number"
                      min={0}
                      max={project.duration}
                      step={0.1}
                      value={
                        selected.end != null
                          ? Math.round(selected.end * 10) / 10
                          : Math.round(project.duration * 10) / 10
                      }
                      onChange={(e) => {
                        const v = Number(e.target.value) || 0;
                        const st = selected.start ?? 0;
                        setItemTime(
                          selected.id,
                          st,
                          Math.max(
                            st + 0.1,
                            Math.min(project.duration, v),
                          ),
                        );
                      }}
                    />
                  </label>
                  <span className="compose-time-code">
                    {fmtClock(selected.start ?? 0)} →{" "}
                    {fmtClock(selected.end ?? project.duration)}
                  </span>
                </div>
                <div className="compose-time-row">
                  <button
                    type="button"
                    className={`btn btn-sm${selected.start == null ? " on" : ""}`}
                    title="清空出现/消失时间：全程可见"
                    onClick={() =>
                      setItemTime(selected.id, undefined, undefined)
                    }
                  >
                    全程
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm${selected.end != null && selected.end >= project.duration ? " on" : ""}`}
                    title="消失时间设为项目结尾"
                    onClick={() =>
                      setItemTime(
                        selected.id,
                        selected.start ?? 0,
                        project.duration,
                      )
                    }
                  >
                    至结尾
                  </button>
                </div>
              </div>
              <div className="compose-pos">
                <label>
                  位置 X
                  <input
                    className="input"
                    type="number"
                    value={Math.round(selected.x)}
                    onChange={(e) =>
                      moveItem(
                        selected.id,
                        Math.max(0, Math.min(CANVAS_W, Number(e.target.value) || 0)),
                        selected.y,
                      )
                    }
                  />
                </label>
                <label>
                  位置 Y
                  <input
                    className="input"
                    type="number"
                    value={Math.round(selected.y)}
                    onChange={(e) =>
                      moveItem(
                        selected.id,
                        selected.x,
                        Math.max(0, Math.min(CANVAS_H, Number(e.target.value) || 0)),
                      )
                    }
                  />
                </label>
                <label>
                  宽 W
                  <input
                    className="input"
                    type="number"
                    min={MIN_CARD_W}
                    value={selectedSize ? Math.round(selectedSize.w) : ""}
                    onChange={(e) => {
                      if (!selectedSize) return;
                      const v =
                        Number(e.target.value) || MIN_CARD_W;
                      resizeItem(selected.id, selected.x, selected.y, v, selectedSize.h);
                    }}
                  />
                </label>
                <label>
                  高 H
                  <input
                    className="input"
                    type="number"
                    min={MIN_CARD_H}
                    value={selectedSize ? Math.round(selectedSize.h) : ""}
                    onChange={(e) => {
                      if (!selectedSize) return;
                      const v =
                        Number(e.target.value) || MIN_CARD_H;
                      resizeItem(selected.id, selected.x, selected.y, selectedSize.w, v);
                    }}
                  />
                </label>
                <div className="compose-layer-btns">
                  <button
                    type="button"
                    className="btn btn-sm"
                    title="上移一层"
                    onClick={() => moveLayer(selected.id, 1)}
                  >
                    ↑ 层
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    title="下移一层"
                    onClick={() => moveLayer(selected.id, -1)}
                  >
                    ↓ 层
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    title="恢复自动测量（内容盒自适应）"
                    onClick={() => resetSize(selected.id)}
                  >
                    ↺ 自适应
                  </button>
                </div>
              </div>
              </div>
            }
          />
        ) : (
          <div className="panel-empty">
            <div className="panel-empty-icon">◇</div>
            <div>画布为空或未选中</div>
            <small>从左侧拖动组件到画布，或点画布卡片选中</small>
          </div>
        )}
        <div className="panel-foot">
          <button className="btn" onClick={replay}>
            ↻ 全部重放
          </button>
          <button
            className="btn"
            disabled={!selected}
            onClick={() => selected && removeItem(selected.id)}
          >
            ⟲ 删除卡片
          </button>
        </div>
      </aside>
      )}
    </div>
  );
}
