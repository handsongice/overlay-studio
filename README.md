# Overlay Studio · 特效叠加工作台

> Overlay Studio — 高级短视频动效的 1080p 预览、参数调试与 SRT 特效生成环境
>
> React 19 + TypeScript + Vite · 无 Remotion / 无 ffmpeg / 无视频导出

## 桌面版（双击即用，无需安装依赖）

已打包为原生桌面应用，**双击图标即可启动**，不需要安装 Node / npm / 任何依赖：

| 平台 | 产物 | 启动方式 |
| --- | --- | --- |
| macOS（Apple 芯片） | `release/Overlay Studio.app` | 双击打开 |
| Windows 10/11（64 位） | `release/Overlay Studio-win32-x64.zip` | 解压后双击 `Overlay Studio.exe` |

- **macOS 首次打开提示“无法验证开发者”**：这是未签名应用的正常提示，右键（或按住 Control 点击）图标 →「打开」→ 再点「打开」即可；之后可正常双击。也可以把 .app 拖入“应用程序”文件夹。
- **Windows 首次打开提示 SmartScreen**：点「更多信息」→「仍要运行」即可（本地构建的未签名应用，属正常提示）。
- **数据完全保存在本机**（应用内置 localStorage / IndexedDB），不联网、不上传；与浏览器版的数据互不干扰。
- 导出透明 MOV 时会弹出系统「另存为」窗口，选择保存位置即可。
- 重新打包：`npm run package:mac`（macOS）/ `npm run package:win`（Windows，需在 macOS 上运行，自动从华为云镜像拉取 Electron 运行时）。


## 快速开始

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 类型检查 + 生产构建
npm run sync:shots   # 重新生成镜头卡元数据（编辑 scripts/sync-shot-cards.mjs 后）
```

## 用法

| 操作 | 方式 |
| --- | --- |
| 新建项目 | 顶栏「＋ 新建项目」（重置名称/时长，清空画布） |
| 设置总时长 | 顶栏项目时长（秒），或导入视频后「⏱ 对齐视频」自动对齐 |
| 导入原始视频 | 顶栏「＋ 导入视频」（仅预览叠加，不参与导出） |
| 添加组件（类→对象） | 左侧类库拖到画布任意位置（落在当前播放头） / 快捷键 `1`–`17` |
| 定位时间 | 画布下方时间轴：点击/拖动播放头，卡片轨道块点击选中对象 |
| 出现/消失时间 | 选中对象 → 右侧「时间轴」：出现/消失秒数、全程、至结尾 |
| 播放预览 | 时间轴 ▶/❚❚/■；有视频时联动视频播放 |
| 切换配色 | 顶栏主题按钮：Mono / Cobalt / Amber / Ivory |
| 重放动画 | 顶栏按钮 / `R` / 面板底部 |
| 调整参数 | 右侧面板（文案 / 数值 / 布局 / 节奏 / 外观） |
| 安全区参考 | 面板顶部开关 / 快捷键 `S` |
| 导出透明动效层 | 顶栏「⇪ 导出透明动效层」：时长 = 项目时长，PNG 序列 |

## 工作流：项目 → 时间轴 → 类/对象

Overlay Studio 的本质是**动效层剪辑**：与最终视频一起合成，所以一切以时间为中心。

1. **新建项目**：顶栏设定项目总时长；导入原始视频可自动把时长对齐到视频长度，也可手填。
2. **拖组件到画布 = 创建对象**：左侧是「类」（组件库），拖到画布即为一个「对象」（实例），
   出现时间自动落在当前播放头，默认持续到项目结尾。
3. **设置消失时间**：选中对象，在右侧「时间轴」配置出现/消失时间，或一键「全程」/「至结尾」；
   画布下方时间轴上每个对象显示为一条轨道块，点击可选中。
4. **预览**：时间轴播放头经过对象的出现区间时，对象才挂载/可见；有视频时跟随视频播放进度。
5. **导出**：导出时长 = 项目总时长，仅导出画布上的对象（透明背景、不含视频画面），
   帧号与预览 currentTime 一一对应。

## 横版构图：人物居中，动效在两侧

- 画布固定 **1920×1080**，中央预留**人物安全区**（默认宽 780px，可在右侧面板调整 560–920px）。
- 安全区为参考层：左右细边界 + 弱透明人形剪影，仅用于取景，可随时隐藏（`S`）。
- **所有动效元素始终锚定在安全区外侧**：安全区宽度变化时，两侧布局自动跟随，几何断言保证不遮挡人物。
- 侧栏面板收束在 520px 内、贴画布边缘保留 20px 呼吸边距，既充分利用两侧空间又不侵入安全区。
- 安全区垂直范围 150–900，底部结论（如 CompareSplit 的效率提升）落在 900 以下，不压人物。

## 17 个动效组件

| # | 组件 | 说明 | 来源 |
| --- | --- | --- | --- |
| 01 | MetricFocus · 核心数字动效 | 主数字单侧滚动、副数据对侧竖排、底部幽灵数字水印 | 自研 |
| 02 | CompareSplit · 左右对比卡 | A/B 分居两侧、中间完全留空、双数字滚动、底部结论 | 自研 |
| 03 | QuoteLockup · 金句定格卡 | 默认左对齐贴安全区、逐行上浮金句、细线收尾 | 自研 |
| 04 | BlurSlide · 逐词入场 | 镜头卡 blur-slide 移植：逐词浮起聚焦 | 移植 |
| 05 | OdometerRoll · 数字滚筒 | 镜头卡 odometer-digit-roll 移植：逐位滚动锁定 | 移植 |
| 06 | ScrubCompare · 对比拉杆 | 镜头卡 before-after-slider-scrub 移植：快甩慢扫 + clip 显影 | 移植 |
| 07 | Letterspace · 字距拉开 | 镜头卡 letterspace-expand 移植：字形描边展开 + 字距拉开 | 移植 |
| 08 | BraceExpand · 花括号展开 | 镜头卡 brace-expand 移植：花括号两端撑开、内容居中浮现 | 移植 |
| 09 | SplitFlap · 翻牌机 | 镜头卡 split-flap-display 移植：逐位翻牌、停稳脉冲 | 移植 |
| 10 | WordRoll · 换词滚动 | 镜头卡 word-roll 移植：句干 + 纵向滚筒换词 | 移植 |
| 11 | ColumnConverge · 双栏合拢 | 镜头卡 column-converge 移植：左右两栏逐词轮换后合拢成一句 | 移植 |
| 12 | ListReveal · 列表逐行揭示 | 镜头卡 list-stagger-reveal 移植：行级 stagger 淡入 | 移植 |
| 13 | ScanSweep · 扫描揭示 | 镜头卡 ui-scan-sweep 移植：细光带扫过 + 卡片内容显影 | 移植 |
| 14 | CardFlip · 卡片翻转 | 镜头卡 card-flip 移植：3D 翻牌 + 背面高亮条 | 移植 |
| 15 | GaugeReadout · 仪表读数 | 镜头卡 gauge-live-readout 移植：环形仪表 + 磁带数字滚动 | 移植 |
| 16 | ChartLive · 数据图表直播 | 镜头卡 chart-live 移植：示波流线 / 点阵重组 / 轴爆表三式 | 移植 |
| 17 | PanelGrid · 面板网格 | 镜头卡 panel-grid 移植：网格重排 / 九宫格闪切 / 漫画分格三式 | 移植 |

> 全部组件均可在右侧切换左/右排布方位；默认成对分居两侧或单侧贴边，中央始终留给人物。

## 主题系统

- 顶栏可实时切换 **4 套配色**（`data-theme` 设计令牌，全部组件即时生效）：
  - **Mono** · 黑白灰：经典克制的单色
  - **Cobalt** · 钴蓝科技（默认）：深蓝底 + `#4f7dff` accent
  - **Amber** · 琥珀暖调：暖褐底 + `#d9a35c` accent
  - **Ivory** · 象牙浅底：米白底 + `#3b5bdb` accent
- 所有颜色均走设计令牌：`--bg / --ink / --surface / --accent` 等，组件内无硬编码色值；accent 只作细线、标签、结论句等点睛，不做大面积铺色。
- 主题在 `src/styles/global.css` 定义，切换逻辑在 `src/App.tsx` + `TopBar`。

## 镜头卡库（video-shotcraft）

- 内置 **152 张镜头配方卡**（`public/shot-cards/`，来自 [video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) skill），按 10 大分类浏览。
- **黑白灰适配**：人工精选 14 张适合当前设计系统的卡（`scripts/sync-shot-cards.mjs` 中的 `CURATED`）。
- **已移植**：14 张卡已转写为本地 React 动效组件（04–17），详情页可一键「在预览台打开」。
- 详情抽屉完整渲染卡片正文：意图 / 动效核心 / 参数表 / 声音 / 已知坑 / 参考实现。

## 设计规范

- **色板**：黑白灰为骨，主题 accent 为点睛（钴蓝 / 琥珀 / 靛蓝），无彩虹渐变、无发光、无弹跳。
- **阴影**：仅 hairline 边框与弱透明面（`rgba(...,0.06–0.16)`），不依赖投影。
- **字体**：系统栈（macOS 上为 SF Pro / PingFang SC）+ 等宽 mono 用于标签与数据。
- **动效**：统一 `cubic-bezier(0.22,1,0.36,1)` / easeOutExpo；只动 `transform` / `opacity`；无弹跳。
- **节奏**：组件 1.4–5s 完成，元素以 0.1–0.16s 错峰级联，靠留白与弱透明传达质感。
- 已内置 `prefers-reduced-motion` 支持。

## 架构

```
src/
  registry.ts              # 组件注册表（新增组件只需加一个条目）
  previews/                # 1080p 动效组件（17 个，含 14 张镜头卡移植）+ 安全区参考层
  shots/                   # 镜头卡库：ShotLibrary 视图 + 极简 Markdown 渲染器
  data/shotCards.generated.ts  # 152 张卡的元数据（脚本生成）
  components/              # 预览台外壳：顶栏 / 侧栏 / 画布 / 参数面板 / 安全区设置
  lib/motion.ts            # 缓动、useCountUp、动画时钟、格式化、delayVar
  styles/                  # 设计系统 tokens（4 主题）+ 预览组件样式 + 卡库样式
scripts/sync-shot-cards.mjs    # 解析 public/shot-cards/*.md → 生成元数据
public/shot-cards/         # 152 张原始配方卡（video-shotcraft 源码）
```

每个组件 = `PreviewDefinition`（id / 名称 / 参数 schema / 默认值 / 组件），参数面板由 schema 自动生成，新增组件无需改外壳代码。

## Phase 路线

- ✅ Phase 01：动效组件预览台（3 个自研组件）
- ✅ Phase 02：镜头卡库 + 首批 3 张卡移植
- ✅ Phase 03：4 套主题配色 + 14 张卡移植 + 17 组件（当前）
- ⬜ Phase 04：时间轴 / 多组件编排
- ⬜ Phase 05：导出与接入视频管线（届时再评估 Remotion / ffmpeg）

## 导出透明动效层（PNG 序列）

- 顶栏「⇪ 导出透明动效层」打开导出面板：选择帧率（24/30/60）后点击「开始导出」。
- 导出内容**只包含画布上的动效卡片**：透明背景、1920×1080、不包含视频画面与编辑框/水印。
- 每一帧按画布当前时间逐帧冻结 CSS 动画并克隆渲染，动效出现时间与预览一致；文件命名 `frame_000001.png` 递增。
- 导出时长：有视频时与视频时长一致；无视频时取最晚动画结束时间 + 0.3s。
- 保存方式：Chrome/Edge 优先弹出文件夹选择器直接写入所选目录；不支持时自动打包 ZIP 下载。
- 导出完成后可把 PNG 序列拖入剪映 / PR / FCP，叠加到原视频上（WebM/MOV 透明视频后续版本再支持）。
