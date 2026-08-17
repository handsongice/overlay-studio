import { useEffect, useMemo, useRef, useState } from "react";
import {
  BROWSER_MAX_FRAMES,
  runOverlayExport,
  type ExportProgress,
  type ExportResult,
} from "../exportPng";

/* ============================================================
   导出透明动效层 · 对话框
   - 透明 MOV 视频（PNG codec）：只含画布上的动效卡片，透明背景，不含视频
   - 渲染完成后自动下载 overlay-studio-transparent.mov
   - 导出全程锁定界面（遮罩），保证动画重放不被干扰
   ============================================================ */

const FPS_OPTIONS = [24, 30, 60] as const;

interface ExportDialogProps {
  open: boolean;
  hasItems: boolean;
  /** 项目总时长（秒）：仅用于展示与兜底 */
  projectDuration: number;
  /** 导出时长（秒）：由画布上结束时间最晚的组件决定 */
  overlayDuration: number;
  onClose: () => void;
  /** 重放画布动画（App 持有 runId，让预览台重新挂载所有卡片） */
  replay: () => void;
  onDone: (r: ExportResult) => void;
  /** 导出进行中状态同步给顶栏按钮 */
  onExportingChange: (v: boolean) => void;
}

function fmtElapsed(ms?: number): string {
  if (ms == null) return "";
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${Math.floor(s / 60)}m${Math.floor(s % 60).toString().padStart(2, "0")}s`;
}

/** 桌面版（Electron）才有的保存能力 */
function hasDesktopBridge(): boolean {
  return typeof window !== "undefined" && !!window.overlayStudio;
}

export function ExportDialog({
  open,
  hasItems,
  projectDuration,
  overlayDuration,
  onClose,
  replay,
  onDone,
  onExportingChange,
}: ExportDialogProps) {
  const [fps, setFps] = useState<number>(30);
  const [duration, setDuration] = useState(10);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<ExportResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* 打开时重置，导出时长 = 画布上结束时间最晚的组件 */
  useEffect(() => {
    if (!open) return;
    setRunning(false);
    setProgress(null);
    setError(null);
    setLast(null);
    abortRef.current = null;
    setDuration(Math.max(0.1, overlayDuration));
  }, [open, overlayDuration]);

  const totalFrames = useMemo(
    () => Math.max(1, Math.round(duration * fps)),
    [duration, fps],
  );
  const pct =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.frame / progress.total) * 100))
      : 0;

  const close = () => {
    if (running) return;
    onClose();
  };

  const start = async () => {
    if (!hasItems || running) return;
    setRunning(true);
    onExportingChange(true);
    setError(null);
    setProgress(null);
    setLast(null);
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const result = await runOverlayExport({
        duration,
        fps,
        replay,
        signal: ac.signal,
        onProgress: setProgress,
      });
      setProgress({
        phase: "done",
        frame: result.frames,
        total: result.frames,
        message: `导出完成 · 透明 MOV 视频（${result.frames} 帧）`,
      });
      setLast(result);
      onDone(result);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setProgress(null);
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setRunning(false);
      onExportingChange(false);
      abortRef.current = null;
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
  };

  if (!open) return null;

  const phaseText =
    progress?.phase === "preparing"
      ? "正在重放画布动画并校准时间…"
      : progress?.phase === "exporting"
        ? `正在渲染帧 ${progress.frame} / ${progress.total} · ${fmtElapsed(
            progress.elapsedMs,
          )}`
        : progress?.phase === "saving"
          ? progress.message ?? "正在封装透明 MOV…"
          : progress?.phase === "done"
            ? progress.message ?? "导出完成"
            : null;

  return (
    <div className="export-overlay">
      <div className="export-dialog" role="dialog" aria-modal="true">
        <div className="export-head">
          <div>
            <div className="export-title">导出透明动效层</div>
            <small>
              透明 MOV 视频 · 仅动效卡片 · 透明背景 · 不含视频画面
            </small>
          </div>
          <button
            type="button"
            className="export-close"
            onClick={close}
            disabled={running}
            title="关闭"
          >
            ✕
          </button>
        </div>

        <div className="export-body">
          <div className="export-row">
            <label>帧率 FPS</label>
            <div className="export-fps">
              {FPS_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={fps === f ? "active" : ""}
                  onClick={() => setFps(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="export-row">
            <label>时长</label>
            <span className="export-dur">{duration.toFixed(1)} 秒</span>
            <span className="export-dur-note">
              ≈ {totalFrames.toLocaleString()} 帧 · 1920×1080
            </span>
          </div>
          {projectDuration > duration + 0.05 && (
            <div className="export-note">
              项目总时长 {projectDuration.toFixed(1)} 秒，但画布上最晚结束的组件为{" "}
              {duration.toFixed(1)} 秒，仅导出到 {duration.toFixed(1)} 秒，避免无用空帧。
            </div>
          )}

          <div className="export-hint">
            <i />
            导出时长由画布上<b>结束时间最晚的组件</b>决定（而非视频/项目总时长），
            完成后自动保存到系统{" "}
            <b>下载</b>文件夹
            <code>overlay-studio-transparent.mov</code>
            （PNG codec 透明视频，可直接拖入剪映 / PR / FCP 叠加）。
            {hasDesktopBridge() ? (
              <>
                {" "}
                桌面版为流式写盘，<b>无帧数上限</b>。
              </>
            ) : (
              <>
                {" "}
                浏览器版单次最多导出 {BROWSER_MAX_FRAMES.toLocaleString()} 帧（约{" "}
                {(BROWSER_MAX_FRAMES / fps).toFixed(0)} 秒），超出部分截断，建议使用桌面版导出完整时长。
              </>
            )}
          </div>

          {phaseText && (
            <div className="export-progress">
              <div className="export-progress-bar">
                <i style={{ width: `${pct}%` }} />
              </div>
              <div className="export-progress-meta">
                <span>{phaseText}</span>
                <span>{pct}%</span>
              </div>
            </div>
          )}

          {error && <div className="export-error">导出失败：{error}</div>}

          {last && !running && !error && (
            <div className="export-done">
              {last.savedPath ? (
                <>
                  <div className="export-done-line">
                    ✓ 已导出并保存到
                  </div>
                  <div className="export-done-path" title={last.savedPath}>
                    {last.savedPath}
                  </div>
                  {hasDesktopBridge() && (
                    <div className="export-done-actions">
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => window.overlayStudio!.showItemInFolder(last.savedPath!)}
                        title="在 Finder / 资源管理器中显示该文件"
                      >
                        📂 打开所在文件夹
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => window.overlayStudio!.openPath(last.savedPath!)}
                        title="用系统默认播放器打开查看"
                      >
                        ▶ 查看视频
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>✓ 已导出透明 MOV 视频（{last.frames} 帧），已开始下载</>
              )}
            </div>
          )}
        </div>

        <div className="export-foot">
          {running ? (
            <button type="button" className="btn" onClick={cancel}>
              ■ 取消导出
            </button>
          ) : (
            <>
              <button type="button" className="btn" onClick={close}>
                关闭
              </button>
              <button
                type="button"
                className="btn btn-solid"
                onClick={start}
                disabled={!hasItems}
                title={
                  hasItems
                    ? "渲染透明 MOV 视频并保存到下载文件夹"
                    : "画布为空，请先添加动效卡片"
                }
              >
                {last ? "⇪ 再导一次" : "⇪ 开始导出"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
