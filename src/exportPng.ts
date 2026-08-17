/* ============================================================
   导出透明动效层 · 透明 MOV 视频
   - 只包含当前画布上的动效卡片（剔除编辑框 / 角落水印 / 视频 / 安全区）
   - 背景透明、1920×1080、与画布一致
   - 按 currentTime 逐帧冻结 CSS 动画（负 delay seek + paused），
     rAF 驱动的组件（数字滚动/图表）在真实重放中按帧克隆 DOM，
     保证每帧与预览台时间一致
   - 全部帧渲染完后封装为 QuickTime 透明视频（PNG codec）自动下载，
     可直接拖入剪映 / PR / FCP 叠加到原视频
   ============================================================ */

import { downloadBlob } from "./lib/zip";
import { muxPngFramesToMov } from "./movMux";
import { setAnimClockOverride } from "./lib/motion";
import { flushSync } from "react-dom";

export const EXPORT_W = 1920;
export const EXPORT_H = 1080;

const MAX_INFLIGHT = 3; // 并发渲染帧数（限制内存与解码压力）
const MAX_FRAMES = 1800; // 单次导出帧数上限（MOV 需内存收集帧，兼顾文件体积）

export interface OverlayExportOptions {
  duration: number; // 秒
  fps: number;
  replay: () => void;
  signal: AbortSignal;
  onProgress: (p: ExportProgress) => void;
}

export interface ExportProgress {
  phase: "preparing" | "exporting" | "saving" | "done" | "error";
  frame: number;
  total: number;
  message?: string;
  elapsedMs?: number;
}

export interface ExportResult {
  frames: number;
  bytes: number;
  /** 导出产物为透明 MOV 视频（PNG codec） */
  video: boolean;
  /** 桌面版：文件实际保存路径（系统下载文件夹），浏览器版无此字段 */
  savedPath?: string;
}

/* ---------- CSS 收集 ---------- */

function collectAllCss(): string {
  const parts: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules;
      if (!rules) continue;
      for (const r of Array.from(rules)) parts.push(r.cssText);
    } catch {
      /* 跨域样式表跳过 */
    }
  }
  return parts.join("\n");
}

/** 收集设计令牌：所有样式表里出现过的 -- 变量，取根元素计算值 */
function collectRootVars(): string {
  const names = new Set<string>();
  const walk = (rules: CSSRuleList) => {
    for (const r of Array.from(rules)) {
      const sr = r as CSSStyleRule;
      if (sr.style) {
        for (let i = 0; i < sr.style.length; i++) {
          const p = sr.style[i];
          if (p.startsWith("--")) names.add(p);
        }
      }
      const cr = r as CSSMediaRule;
      if (cr.cssRules) walk(cr.cssRules);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules);
    } catch {
      /* skip */
    }
  }
  const cs = getComputedStyle(document.documentElement);
  let out = "";
  for (const n of names) {
    const v = cs.getPropertyValue(n);
    if (v) out += `${n}:${v};`;
  }
  return out;
}

/** 按顶层逗号拆分（忽略括号内的逗号，如 cubic-bezier(...)） */
function splitTopLevel(v: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of v) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

/** CSSNumberish / string → 毫秒数（兼容 CSSNumericValue） */
function animTimeMs(t: unknown): number {
  if (t == null) return 0;
  if (typeof t === "number") return t;
  if (typeof t === "string") return parseFloat(t) || 0;
  const v = (t as CSSNumericValue).to?.("ms");
  return typeof v === "number" ? v : 0;
}

/* ---------- 逐帧冻结 ---------- */

function freezeAnimations(
  srcRoot: Element,
  cloneRoot: Element,
  t: number,
  start: number,
) {
  // 卡片本地时间：导出帧的项目时间 - 卡片挂载时间（无时间轴 = 从 0 挂载）
  const local = Math.max(0, t - start);
  const srcEls = Array.from(srcRoot.querySelectorAll("*"));
  const cloneEls = Array.from(cloneRoot.querySelectorAll("*"));
  for (let i = 0; i < srcEls.length; i++) {
    const src = srcEls[i];
    const cEl = cloneEls[i] as HTMLElement | null;
    if (!cEl) continue;
    const anims = src.getAnimations ? src.getAnimations() : [];
    const cssTrans = anims.filter(
      (a): a is CSSTransition => a instanceof CSSTransition,
    );

    // 注意：display:none 的卡片（live 时钟尚未走到它的 start 区间）不会产生
    // 运行中的 CSSAnimation，getAnimations() 为空。因此这里以计算样式里
    // “声明的动画”为准做确定性 seek，而不是依赖 getAnimations()。
    const cs = getComputedStyle(src);
    const names = splitTopLevel(cs.animationName);
    const durs = splitTopLevel(cs.animationDuration);
    const tfs = splitTopLevel(cs.animationTimingFunction);
    const delays = splitTopLevel(cs.animationDelay);
    const iters = splitTopLevel(cs.animationIterationCount);
    const dirs = splitTopLevel(cs.animationDirection);
    const fills = splitTopLevel(cs.animationFillMode);
    const parts: string[] = [];
    for (let ai = 0; ai < names.length; ai++) {
      const name = names[ai];
      if (!name || name === "none") continue;
      const delayS = parseFloat(delays[ai] ?? "0") || 0;
      // 确定性 seek：不依赖 live 时钟的 currentTime，
      // 直接按卡片本地时间算出新 delay（负 delay = 立即 seek 到正确相位）
      const newDelay = delayS - local;
      parts.push(
        `${name} ${durs[ai] ?? "0s"} ${tfs[ai] ?? "ease"} ${newDelay}s ${
          iters[ai] ?? "1"
        } ${dirs[ai] ?? "normal"} ${fills[ai] ?? "both"}`,
      );
    }
    if (parts.length) {
      cEl.style.animation = parts.join(", ");
      cEl.style.animationPlayState = "paused";
    }

    if (cssTrans.length) {
      const cs2 = getComputedStyle(src);
      for (const tr of cssTrans) {
        const prop = tr.transitionProperty;
        const val = cs2.getPropertyValue(prop);
        if (val) cEl.style.setProperty(prop, val);
      }
      cEl.style.transition = "none";
    }
  }
}

/* ---------- SVG 序列化 ---------- */

function escapeAttr(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** 同步构建当前帧的 SVG（克隆 + 冻结 + 序列化，耗时毫秒级） */
/** 同步构建当前帧的 SVG（克隆 + 冻结 + 序列化，耗时毫秒级）
    t = 当前动画时间（秒）；带 start/end 的卡片仅在区间内导出 */
function buildFrameSvg(
  frameEl: Element,
  css: string,
  rootVars: string,
  t: number,
): string {
  const sfL =
    getComputedStyle(frameEl).getPropertyValue("--sf-l") || "570px";
  const sfR =
    getComputedStyle(frameEl).getPropertyValue("--sf-r") || "1350px";
  const vars = `${rootVars}--sf-l:${sfL};--sf-r:${sfR};`;

  const xml = new XMLSerializer();
  // 直接序列化每张卡片，作为 wrapper（1920×1080 relative）的子元素，
  // 与 .canvas-frame 内定位完全一致；无需隐藏层，避免 DOM 泄漏。
  const inner = Array.from(frameEl.querySelectorAll(".free-item"))
    .filter((fi) => {
      const el = fi as HTMLElement;
      const st = parseFloat(el.dataset.start ?? "");
      const en = parseFloat(el.dataset.end ?? "");
      if (!Number.isFinite(st) || !Number.isFinite(en)) return true; // 无时间轴=全程
      return t >= st && t < en;
    })
    .map((fi) => {
      const clone = fi.cloneNode(true) as HTMLElement;
      clone.classList.remove("sel");
      clone.style.borderColor = "transparent";
      // 时间轴卡片可能正处在 live 时钟的隐藏区间（display:none），
      // 但 filter 已按导出帧 t 决定包含该卡：克隆必须强制可见，否则帧为空白
      clone.style.display = "block";
      const fiEl = fi as HTMLElement;
      const stNum = parseFloat(fiEl.dataset.start ?? "");
      // display:none 的卡片（live 时钟尚未走到它的 start 区间）在 Chrome 里
      // 动画计算样式全部退化为 none/0s，导致无法做确定性 seek。
      // 读取前临时强制显示，读完立刻还原，避免影响 live 预览。
      const wasHidden = fiEl.style.display === "none";
      if (wasHidden) fiEl.style.display = "block";
      try {
        freezeAnimations(fi, clone, t, Number.isFinite(stNum) ? stNum : 0);
      } finally {
        if (wasHidden) fiEl.style.display = "none";
      }
      clone
        .querySelectorAll(
          ".free-item-handle,.free-item-del,.free-item-resize,.pf-chrome",
        )
        .forEach((e) => e.remove());
      // 画布级背景改为透明：导出的是可叠加的动效卡片，不携带全幅底色
      clone
        .querySelectorAll(".preview-frame")
        .forEach((e) => {
          (e as HTMLElement).style.background = "transparent";
        });
      return xml.serializeToString(clone);
    })
    .join("");
  const html = `<div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:${EXPORT_W}px;height:${EXPORT_H}px;${escapeAttr(vars)}">${inner}</div>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${EXPORT_W}" height="${EXPORT_H}" viewBox="0 0 ${EXPORT_W} ${EXPORT_H}"><style>${css}</style><foreignObject width="${EXPORT_W}" height="${EXPORT_H}" x="0" y="0">${html}</foreignObject></svg>`;
}

/* ---------- 渲染 ---------- */

async function renderSvgToPngBlob(svg: string): Promise<Blob> {
  const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  const img = new Image();
  img.decoding = "async";
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("SVG 渲染失败"));
    img.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_W;
  canvas.height = EXPORT_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建 2D 画布");
  ctx.clearRect(0, 0, EXPORT_W, EXPORT_H);
  ctx.drawImage(img, 0, 0, EXPORT_W, EXPORT_H);
  const blob = await new Promise<Blob>((res, rej) => {
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("PNG 编码失败"))),
      "image/png",
    );
  });
  return blob;
}

/* ---------- 时间基准 ---------- */

/** 等待重放挂载完成，返回动画挂载的 performance.now() 时间点。
    只认 replay 之后新出现的 CSSAnimation（旧动画对象从 before 快照排除），
    用 currentTime 反推真实挂载时刻；无 CSS 动画时按当前时刻快速兜底。 */
function waitForMount(signal: AbortSignal, timeoutMs = 1200): Promise<number> {
  return new Promise((resolve) => {
    const started = performance.now();
    const before = new Set<Animation>();
    for (const a of document.getAnimations()) {
      if (a instanceof CSSAnimation) before.add(a);
    }
    const tick = () => {
      if (signal.aborted) {
        resolve(started);
        return;
      }
      if (performance.now() - started > timeoutMs) {
        // 无新 CSS 动画（纯 rAF 组件 / 静态卡）：视为当前时刻挂载
        resolve(performance.now());
        return;
      }
      for (const a of document.getAnimations()) {
        if (!(a instanceof CSSAnimation)) continue;
        if (before.has(a)) continue;
        if (a.currentTime == null) continue;
        // currentTime 含 delay，且从挂载即开始计时
        resolve(performance.now() - animTimeMs(a.currentTime) / 1000);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function waitUntil(target: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const tick = () => {
      if (signal.aborted || performance.now() >= target) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ---------- 时长估算 ---------- */

/** 估算项目时长：视频时长优先；无视频时取 SRT 时间轴最晚 end、CSS 动画最晚结束时间 + 0.3s；再兜底 10s */
export function estimateOverlayDuration(): number {
  const v = document.querySelector<HTMLVideoElement>(".canvas-frame video");
  if (v && Number.isFinite(v.duration) && v.duration > 0.05) {
    return v.duration;
  }
  let end = 0;
  // SRT 导入的卡片时间轴：取最晚 end
  for (const fi of Array.from(
    document.querySelectorAll<HTMLElement>(".canvas-frame .free-item"),
  )) {
    const e = parseFloat(fi.dataset.end ?? "");
    if (Number.isFinite(e)) end = Math.max(end, e);
  }
  for (const el of Array.from(
    document.querySelectorAll(".canvas-frame .free-item *"),
  )) {
    for (const a of el.getAnimations()) {
      if (!(a instanceof CSSAnimation) || !a.effect) continue;
      const t = a.effect.getTiming();
      const iter =
        Number.isFinite(t.iterations) && (t.iterations as number) > 0
          ? (t.iterations as number)
          : 1;
      end = Math.max(
        end,
        animTimeMs(t.delay) / 1000 + (animTimeMs(t.duration) / 1000) * iter,
      );
    }
  }
  if (end > 0) return end + 0.3;
  return 10;
}

/* ---------- 主流程 ---------- */

export async function runOverlayExport(
  opts: OverlayExportOptions,
): Promise<ExportResult> {
  const { duration, fps, replay, signal, onProgress } = opts;
  const total = Math.min(
    MAX_FRAMES,
    Math.max(1, Math.round(duration * fps)),
  );
  onProgress({ phase: "preparing", frame: 0, total, message: "准备导出…" });

  replay();
  const mountTime = await waitForMount(signal);
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  try {

  const css = collectAllCss();
  const rootVars = collectRootVars();
  const frameEl = document.querySelector(".canvas-frame");
  if (!frameEl) throw new Error("未找到预览画布");

  let inFlight = 0;
  const waiters: (() => void)[] = [];
  const acquire = async () => {
    while (inFlight >= MAX_INFLIGHT) {
      await new Promise<void>((r) => waiters.push(r));
    }
    inFlight++;
  };
  const release = () => {
    inFlight--;
    waiters.shift()?.();
  };

  const frames: Blob[] = [];
  const jobs: Promise<void>[] = [];
  let bytes = 0;
  let saved = 0;
  const startedAt = performance.now();

  for (let i = 0; i < total; i++) {
    if (signal.aborted) break;
    const target = mountTime + i / fps;
    await waitUntil(target, signal);
    if (signal.aborted) break;

    // 把共享动效时钟固定到当前帧的项目时间，flushSync 强制同步渲染，
    // 让 rAF 驱动的组件（数字滚动/图表）按确定性时间出值
    flushSync(() => setAnimClockOverride(i / fps));
    const svg = buildFrameSvg(frameEl, css, rootVars, i / fps);
    await acquire();
    const idx = i;
    jobs.push(
      (async () => {
        try {
          const blob = await renderSvgToPngBlob(svg);
          frames[idx] = blob;
          bytes += blob.size;
          saved++;
          onProgress({
            phase: "exporting",
            frame: saved,
            total,
            elapsedMs: performance.now() - startedAt,
          });
        } catch (e) {
          if (!signal.aborted) throw e;
        } finally {
          release();
        }
      })(),
    );
    // 让异步渲染/写入有机会推进
    await new Promise((r) => setTimeout(r, 0));
  }

  await Promise.all(jobs);
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");

  if (!frames.length) {
    return { frames: 0, bytes: 0, video: true };
  }

  onProgress({
    phase: "saving",
    frame: total,
    total,
    message: "正在封装透明 MOV 视频…",
  });
  const mov = await muxPngFramesToMov(frames, fps, EXPORT_W, EXPORT_H);

  // 桌面版（Electron）：通过 preload 桥流式写入系统「下载」文件夹，
  // 直接拿到保存路径，完成后可「打开所在文件夹 / 查看视频」
  const bridge = (window as unknown as { overlayStudio?: OverlayBridge }).overlayStudio;
  if (bridge?.saveMovStart) {
    const start = await bridge.saveMovStart("overlay-studio-transparent.mov");
    if (!start.ok || !start.filePath) {
      throw new Error(start.error || "无法创建保存文件");
    }
    const savePath: string = start.filePath;
    try {
      let written = 0;
      const reader = mov.stream().getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        written += value.byteLength;
        const r = await bridge.saveMovChunk(savePath, new Uint8Array(value));
        if (!r.ok) throw new Error(r.error || "写入文件失败");
      }
      const end = await bridge.saveMovEnd(savePath, written);
      if (!end.ok || !end.filePath) throw new Error(end.error || "保存文件失败");
      onProgress({
        phase: "done",
        frame: saved,
        total,
        message: `已保存到：${end.filePath}`,
      });
      return { frames: saved, bytes, video: true, savedPath: end.filePath };
    } catch (e) {
      await bridge.saveMovAbort(savePath).catch(() => {});
      throw e;
    }
  }

  // 浏览器版兜底：触发下载
  downloadBlob(mov, "overlay-studio-transparent.mov");
  return { frames: saved, bytes, video: true };
  } finally {
    // 导出结束（含中止/异常）：恢复实时时钟
    setAnimClockOverride(null);
  }
}

