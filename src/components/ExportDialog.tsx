import { useEffect, useMemo, useRef, useState } from "react";
import {
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
  /** 项目总时长（秒）：导出时长以它为准 */
  projectDuration: number;
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

export function ExportDialog({
  open,
  hasItems,
  projectDuration,
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

  /* 打开时重置，导出时长 = 项目总时长 */
  useEffect(() => {
    if (!open) return;
    setRunning(false);
    setProgress(null);
    setError(null);
    setLast(null);
    abortRef.current = null;
    setDuration(Math.max(0.1, projectDuration));
  }, [open, projectDuration]);

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

          <div className="export-hint">
            <i />
            按画布当前时间逐帧渲染动画，完成后自动下载{" "}
            <code>overlay-studio-transparent.mov</code>
            （PNG codec 透明视频，可直接拖入剪映 / PR / FCP 叠加）。
            超出 1800 帧自动截断。
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
              ✓ 已导出透明 MOV 视频（{last.frames} 帧），已开始下载
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
                    ? "渲染透明 MOV 视频并自动下载"
                    : "画布为空，请先添加动效卡片"
                }
              >
                ⇪ 开始导出
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
