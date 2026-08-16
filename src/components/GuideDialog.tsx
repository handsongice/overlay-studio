import { useCallback, useState } from "react";

/* ============================================================
   Overlay Studio · 引导 / 使用说明
   分步介绍工具如何工作：项目管理 → 时长 → 视频 → 动效卡 →
   时间轴 → 导出。首次启动自动弹出，之后可从顶栏
   「使用说明」随时打开。
   ============================================================ */

export const GUIDE_SEEN_KEY = "overlay-studio:guide:seen:v1";

export function isGuideSeen(): boolean {
  try {
    return localStorage.getItem(GUIDE_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markGuideSeen(): void {
  try {
    localStorage.setItem(GUIDE_SEEN_KEY, "1");
  } catch {
    /* 忽略 */
  }
}

interface Step {
  key: string;
  no: string;
  title: string;
  en: string;
  body: React.ReactNode;
}

const STEPS: Step[] = [
  {
    key: "projects",
    no: "01",
    title: "项目管理",
    en: "PROJECTS",
    body: (
      <>
        <p>
          Overlay Studio 是<em>多项目</em>工作流。第一页是
          <b>项目管理页</b>：可以搜索、新建、打开编辑、只读预览、删除项目。
        </p>
        <p>
          点「＋ 新建项目」创建项目并进入编辑器；点卡片「✎ 编辑」继续上次工作。
          所有项目都保存在<b>本机浏览器</b>（localStorage + IndexedDB），
          不依赖网络。
        </p>
      </>
    ),
  },
  {
    key: "duration",
    no: "02",
    title: "新建项目 · 时长",
    en: "PROJECT & DURATION",
    body: (
      <>
        <p>
          每个项目都有一个<b>总时长</b>（秒），它决定时间轴长度和导出长度。
          顶栏「项目」里可以直接改名称与时长。
        </p>
        <p>
          也可以在编辑器导入原始视频后点<b>「⏱ 对齐视频」</b>，
          让项目时长自动等于视频时长——先确定展示时间，再摆动效。
        </p>
      </>
    ),
  },
  {
    key: "video",
    no: "03",
    title: "导入视频（可选）",
    en: "VIDEO BACKGROUND",
    body: (
      <>
        <p>
          顶栏「＋ 导入视频」可把原始视频放进画布当背景，仅用于
          <b>预览叠加效果</b>，不会进入导出。带播放 / 暂停 / 停止 / 拖动 / 音量控制。
        </p>
        <p>
          动效卡片默认半透明叠加，不遮挡人物；人物中轴的安全区会提示
          「内容安全区域」。
        </p>
      </>
    ),
  },
  {
    key: "cards",
    no: "04",
    title: "添加动效卡",
    en: "ADD CARDS",
    body: (
      <>
        <p>
          编辑器左侧是<b>动效卡类库</b>：按分类分组、支持搜索和多选。
          把卡片<b>拖到画布</b>就创建了一个对象实例（也可点卡片「＋ 添加」）。
        </p>
        <p>
          对象落在当前播放头时间；点选画布上的卡片，右侧可以配置
          文案、数值、颜色、字号、卡片框位置与大小、图层顺序等。
          拖拽卡片可移动，拖动蓝色虚线框边缘可调整卡片框。
        </p>
      </>
    ),
  },
  {
    key: "timeline",
    no: "05",
    title: "时间轴",
    en: "TIMELINE",
    body: (
      <>
        <p>
          画布下方是时间轴：<b>点击 / 拖动播放头</b>定位时间，播放 / 暂停 / 停止
          控制预览。每个对象都有自己的<b>出现时间与消失时间</b>（右侧「时间轴」面板配置，
          或点「全程」「至结尾」）。
        </p>
        <p>
          时间轴上彩色轨道块表示卡片的时间区间，点击轨道块可选中对应卡片；
          多个卡片可以同时出现，只要区间不互相覆盖到不合理即可。
        </p>
      </>
    ),
  },
  {
    key: "export",
    no: "06",
    title: "导出透明动效层",
    en: "EXPORT",
    body: (
      <>
        <p>
          顶栏「⇪ 导出透明动效层」导出<b>PNG 序列</b>：1920×1080、背景透明、
          只含动效卡片、不含原视频画面；时长 = 项目时长，每帧按 currentTime 渲染，
          保证与预览一致（frame_000001.png …）。
        </p>
        <p>
          导出后把 PNG 序列拖进剪映 / PR / FCP 叠加到原始视频上即可。
          WebM / MOV 透明视频是后续方向。
        </p>
      </>
    ),
  },
];

const SHORTCUTS: { keys: string; desc: string }[] = [
  { keys: "L", desc: "切换 预览台 / 镜头卡库" },
  { keys: "P", desc: "进入 / 退出纯预览模式" },
  { keys: "R", desc: "全部重放" },
  { keys: "S", desc: "显示 / 隐藏安全区" },
  { keys: "C", desc: "回到预览台" },
  { keys: "Space", desc: "播放 / 暂停背景视频" },
  { keys: "1–23", desc: "数字键快速添加对应动效卡" },
  { keys: "Delete", desc: "删除选中卡片" },
  { keys: "ESC", desc: "取消选中 / 退出预览" },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "动效会挡住人物吗？",
    a: "默认布局把动效放在左右两侧，中间人物中轴安全区（约 x 570–1350）始终保留；你可以用安全区开关实时确认。",
  },
  {
    q: "为什么导出是 PNG 序列而不是视频？",
    a: "第一版做最稳的透明导出：PNG 序列背景透明、逐帧精确。WebM / MOV 透明视频会在后续版本加入。",
  },
  {
    q: "数据存在哪里？换电脑会丢吗？",
    a: "项目、画布对象存在浏览器 localStorage，背景视频存在 IndexedDB。都是本机存储，不换电脑不清理浏览器就不会丢；目前不提供云同步。",
  },
  {
    q: "SRT 字幕怎么变成动效卡？",
    a: "使用《特效生成》Codex Skill 处理 SRT，会按字幕内容与时间生成 overlay JSON，再在编辑器顶栏「⇩ 导入特效 JSON」导入，卡片会自动带上出现/消失时间。",
  },
];

interface GuideDialogProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "steps" | "shortcuts" | "faq";

export function GuideDialog({ open, onClose }: GuideDialogProps) {
  const [tab, setTab] = useState<Tab>("steps");
  const [stepIdx, setStepIdx] = useState(0);

  const close = useCallback(() => {
    markGuideSeen();
    onClose();
  }, [onClose]);

  if (!open) return null;
  const step = STEPS[stepIdx];

  return (
    <div className="export-overlay guide-overlay" onClick={close}>
      <div className="guide-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="guide-head">
          <div>
            <div className="guide-title">使用说明 · GUIDE</div>
            <small>从「项目管理 → 制作 → 导出」完整工作流，约 1 分钟读完</small>
          </div>
          <button type="button" className="export-close" onClick={close} title="关闭">
            ✕
          </button>
        </div>

        <div className="guide-tabs" role="tablist">
          {(
            [
              { id: "steps", label: "使用流程" },
              { id: "shortcuts", label: "快捷键" },
              { id: "faq", label: "常见问题" },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`guide-tab${tab === t.id ? " active" : ""}`}
              onClick={() => {
                setTab(t.id);
                if (t.id === "steps") setStepIdx(0);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="guide-body">
          {tab === "steps" && (
            <div className="guide-steps">
              <ol className="guide-step-nav">
                {STEPS.map((s, i) => (
                  <li key={s.key}>
                    <button
                      type="button"
                      className={`guide-step-btn${i === stepIdx ? " active" : ""}${i < stepIdx ? " done" : ""}`}
                      onClick={() => setStepIdx(i)}
                    >
                      <span className="guide-step-no">{s.no}</span>
                      <span>
                        <b>{s.title}</b>
                        <small>{s.en}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="guide-step-panel">
                <div className="guide-step-panel-title">
                  <span>{step.no}</span> {step.title}
                </div>
                <div className="guide-step-panel-body">{step.body}</div>
                <div className="guide-step-pager">
                  <button
                    type="button"
                    className="btn btn-sm"
                    disabled={stepIdx === 0}
                    onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                  >
                    ← 上一步
                  </button>
                  <span>
                    {stepIdx + 1} / {STEPS.length}
                  </span>
                  {stepIdx === STEPS.length - 1 ? (
                    <button type="button" className="btn btn-sm guide-done" onClick={close}>
                      开始使用 ✓
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))}
                    >
                      下一步 →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "shortcuts" && (
            <div className="guide-section">
              <div className="guide-section-title">快捷键 · SHORTCUTS</div>
              <div className="guide-kv">
                {SHORTCUTS.map((s) => (
                  <div key={s.keys} className="guide-kv-row">
                    <kbd>{s.keys}</kbd>
                    <span>{s.desc}</span>
                  </div>
                ))}
              </div>
              <p className="guide-note">
                输入框聚焦时快捷键不生效；导出期间快捷键暂停。
              </p>
            </div>
          )}

          {tab === "faq" && (
            <div className="guide-section">
              <div className="guide-section-title">常见问题 · FAQ</div>
              <div className="guide-faq">
                {FAQS.map((f) => (
                  <details key={f.q} className="guide-faq-item">
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="guide-foot">
          <span>OVERLAY·STUDIO · 动效叠加工作台</span>
          <button type="button" className="btn btn-sm" onClick={close}>
            知道了
          </button>
        </div>
      </div>
    </div>
  );
}
