/* eslint-disable */
// 由 scripts/sync-shot-cards.mjs 自动生成，勿手改。
// 数据源：public/shot-cards/（video-shotcraft · 152 张镜头配方卡）
export interface ShotCardMeta {
  id: string;
  name: string;
  category: string;
  summary: string;
  use: string;
  duration: string;
  energy: string;
  tags: string[];
  path: string;
  curated: boolean;
  ported: boolean;
  sections: string[];
}

export interface ShotCategoryMeta {
  id: string;
  zh: string;
  en: string;
  count: number;
}

export const SHOT_CARDS: ShotCardMeta[] = [
  {
    "id": "basic-3d-scene",
    "name": "basic-3d-scene",
    "category": "camera",
    "summary": "impress.js 式空间演示：卡片以不同位置/旋转/缩放散布 3D 空间，相机取各步姿态之逆依次飞行对齐，末步拉到 OVERVIEW 总览",
    "use": "概念/路线图/三步法的空间化讲述；替代平面 slides 的\"每一步都换个空间视角\"",
    "duration": "约 6.0s（180f@30fps；四站，三段飞行各 0.96s）",
    "energy": "中（每次转场有空间惊喜，停留段安静读卡）",
    "tags": [],
    "path": "shot-cards/camera/basic-3d-scene.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "crash-zoom-punch",
    "name": "crash-zoom-punch",
    "category": "camera",
    "summary": "全景一拍急推到目标特写（6f），落位二选一——过冲回弹（弹性）或撞停震屏（重量）",
    "use": "功能段\"点名\"镜头——把观众视线一拍按到目标卡/模块上；强调级用撞停",
    "duration": "约 0.5s 动作 + 前后 hold（动作 6–11f，前 hold ≥30f 建立全景、后 hold ≥45f 读特写）",
    "energy": "高（瞬时冲击，非持续高能）",
    "tags": [
      "effects"
    ],
    "path": "shot-cards/camera/crash-zoom-punch.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "cursor-flyover",
    "name": "cursor-flyover",
    "category": "camera",
    "summary": "整页俯瞰淡入后，相机依次飞到四个角落 zoom-in 特写，SVG 光标同步跟到位指点并留下点击涟漪",
    "use": "单页产品的功能巡览：一镜带观众看完四个功能区，光标当\"导游手指\"",
    "duration": "约 6.0s（180f@30fps；俯瞰 0–1.2s · 四步各 0.7s 过渡 + 0.5s 停留）",
    "energy": "中（匀速巡航，节奏靠点击涟漪打点）",
    "tags": [],
    "path": "shot-cards/camera/cursor-flyover.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "depth-layer-moves",
    "name": "depth-layer-moves",
    "category": "camera",
    "summary": "分层深度两款运镜——多层视差滑轨（3 层速度梯度横移出纵深）与伪 dolly-zoom（主体钉死、背景膨胀压来）",
    "use": "平面截图要\"有厚度\"的段落；戏剧性蓄力时刻用 dolly-zoom（一支片 ≤1 次）",
    "duration": "视差滑轨 4–5s 持续；dolly-zoom 3–4s 单向行程",
    "energy": "视差=中（质感型）；dolly-zoom=中高（压迫感渐强）",
    "tags": [],
    "path": "shot-cards/camera/depth-layer-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "graze-face-tour",
    "name": "graze-face-tour",
    "category": "camera",
    "summary": "大倾角贴面游走特写——镜头贴着 UI 表面低飞掠过（侧栏树/顶栏/列表当地形），页面文字初始悬浮在界面上空带同形软影，随镜头行进先后加速贴落回界面",
    "use": "功能区巡礼（把 UI 当地景飞掠）；配合暗场+霓虹缘光做产品\"内部世界\"段落；界面内容逐区登场",
    "duration": "单段 4–5s；可多段接力延长",
    "energy": "中高（运镜持续推进+元素连续落位，信息密度高）",
    "tags": [
      "ui-entrance"
    ],
    "path": "shot-cards/camera/graze-face-tour.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "overhead-camera-moves",
    "name": "overhead-camera-moves",
    "category": "camera",
    "summary": "俯拍揭示两式——tilt-reveal 俯仰抬正揭示、overhead-tabletop-drop 桌面卡阵横滑骤降扎入",
    "use": "用\"俯仰角\"讲故事的开场/转场：单页 establishing 用 A，多页巡视择一扎入用 B",
    "duration": "A ~4.8s / B ~4.7s",
    "energy": "A 中 / B 中高",
    "tags": [
      "opening",
      "transition"
    ],
    "path": "shot-cards/camera/overhead-camera-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "space-camera-moves",
    "name": "space-camera-moves",
    "category": "camera",
    "summary": "3D 空间化运镜两式——exploded-view 爆炸分解（构件沿 Z 炸开再合体）、drone-dive-landing 无人机俯冲降落",
    "use": "把平面页面当 3D 实体拍的高光段落；两式都是\"大动作\"，一支片合计 ≤2 次",
    "duration": "A 5s（炸开-悬停-合体全程）；C 3–5s 单向俯冲",
    "energy": "高",
    "tags": [],
    "path": "shot-cards/camera/space-camera-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "steep-tilt-glide",
    "name": "steep-tilt-glide",
    "category": "camera",
    "summary": "固定镜头下直立页面以 60° 强透视侧立（右近左远），页面自身沿其 3D 横面方向滑移掠过镜头（物动镜不动），滑移带速度重影、文字组件悬空贴落、由暗揭亮",
    "use": "长页面/多区块 UI 的炫技巡览（内容依次滑过固定机位）；暗场霓虹调性；与贴面运镜卡互补的\"侧掠\"机位",
    "duration": "4s（120f）单镜；页面越宽越可拉长",
    "energy": "中高（透视炫技+持续运动，但节奏是匀的）",
    "tags": [
      "ui-entrance"
    ],
    "path": "shot-cards/camera/steep-tilt-glide.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "tension-camera-moves",
    "name": "tension-camera-moves",
    "category": "camera",
    "summary": "情绪运镜四式——bullet-time 冻结环绕、dutch-roll 斜角滚正、slow-push 慢推压迫、pull-back 拉远孤立，相机替观众\"感受\"而非\"看\"",
    "use": "情绪节点（震撼/纠偏/积压/收束）的运镜语言；与 space-camera-moves 的\"炫技大动作\"互补——这四式动作小、情绪重",
    "duration": "单式 4–5s；全片合计 ≤2 式（各 ≤1 次）",
    "energy": "A 高 / B 中 / C 低压升 / D 低收",
    "tags": [],
    "path": "shot-cards/camera/tension-camera-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "四式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "terminal-3d",
    "name": "terminal-3d",
    "category": "camera",
    "summary": "三个终端窗散布 3D 空间，相机窗间飞行、途中正弦拉远，每到一窗打字机敲命令、结果逐行滑出——命令执行的空间叙事流",
    "use": "开发者产品的 CLI/工作流演示：把\"三步命令\"拍成三站空间旅程",
    "duration": "约 6.0s（180f@30fps；三站各约 1.6s 停留 + 0.85s 飞行）",
    "energy": "中（飞行给动感、打字给节奏，整体是沉稳的技术叙事）",
    "tags": [],
    "path": "shot-cards/camera/terminal-3d.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "avatar-grid-radial-build-colorize",
    "name": "avatar-grid-radial-build-colorize",
    "category": "data",
    "summary": "8×7 小卡片网格由中心分环生长铺满（内容混合首字母/图标/图片占位），随后约 15% 的卡片随机时刻染红标异常，标题图例常驻中央",
    "use": "\"群体中浮现异常/重点\"的数据叙事：用户群健康度、监控面板、批量状态总览",
    "duration": "约 5.6s（168f@30fps；铺满 0.5–1.7s · 染色 1.7–3.4s 陆续浮现）",
    "energy": "中（生长段有节奏感，染色段是安静的\"发现\"时刻）",
    "tags": [],
    "path": "shot-cards/data/avatar-grid-radial-build-colorize.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "before-after-slider-scrub",
    "name": "before-after-slider-scrub",
    "category": "data",
    "summary": "前后对比拉杆——\"处理前/后\"两版叠放，分割杆先猛甩后慢扫，杆过处新版\"显影\"揭出",
    "use": "AI 增强/优化/重构类功能的效果对比段落（\"用前 vs 用后\"一镜讲清）",
    "duration": "4–5s",
    "energy": "中（快甩是打击点，慢扫是阅读期）",
    "tags": [
      "interaction"
    ],
    "path": "shot-cards/data/before-after-slider-scrub.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "动作阶段",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "chart-live-moves",
    "name": "chart-live-moves",
    "category": "data",
    "summary": "活体图表三式——oscilloscope-stream 示波流线（曲线右端实时写入+突发尖峰）、unit-dot-swarm-regroup 点阵重组（点群三幕迁徙聚成数字）、axis-rescale-shock 轴爆表重标（新值冲出画框逼 y 轴重标）",
    "use": "数据叙事段落；分别讲\"实时性\"、\"每个数字是一个人\"、\"增长装不下\"",
    "duration": "各 4–6s",
    "energy": "中高（数据即剧情）",
    "tags": [],
    "path": "shot-cards/data/chart-live-moves.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "三式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "counter-confetti",
    "name": "counter-confetti",
    "category": "data",
    "summary": "大数字 easeOutQuart 冲刺计数并带 scale 过冲，到位前一拍 52 片彩纸从两侧抛物线炸入，冲击环扩散、标签字距收紧收尾",
    "use": "里程碑/成绩数字的庆祝拍：用户数、营收、下载量等\"值得开香槟\"的指标揭示",
    "duration": "约 4.6s（138f@30fps；计数 0.3–2.6s · 纸屑 2.4s 起 · 落定 3.3s）",
    "energy": "高（计数蓄力 + 爆点释放，标准的情绪峰值镜头）",
    "tags": [],
    "path": "shot-cards/data/counter-confetti.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "gauge-readout-moves",
    "name": "gauge-readout-moves",
    "category": "data",
    "summary": "仪表读数两式——needle-sweep-selftest 满弧扫针（点火自检指针甩满全弧再回落真值）与 tape-scroll-fixed-pointer 滚带定针（针不动刻度带滚过+冲刺刹车）",
    "use": "dashboard 开场仪式/性能指标揭晓；A 多表盘开机感，B 单指标大跳变",
    "duration": "A 4–5s / B 4–5s",
    "energy": "中高（机械仪式型）",
    "tags": [],
    "path": "shot-cards/data/gauge-readout-moves.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "hatch-depth",
    "name": "hatch-depth",
    "category": "data",
    "summary": "斜纹占位条逐条 wipe 伸长后，斜纹淡出、强调色实心层淡入并弹出数值，占位图蜕变为真数据条形图",
    "use": "\"从草稿到真实数据\"的叙事拍；dashboard/报表功能引入，或强调数据实时性的段落",
    "duration": "约 4.4s（132f@30fps；生长 0–1.7s · 蜕变 2.2–3.4s · 微颤收尾）",
    "energy": "中（信息渐进，无爆点，靠质感转换制造\"上线了\"的瞬间）",
    "tags": [],
    "path": "shot-cards/data/hatch-depth.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "odometer-digit-roll",
    "name": "odometer-digit-roll",
    "category": "data",
    "summary": "里程表数字滚动大字报——全屏巨号指标每个数位像老虎机滚轮独立纵向滚动带残影，从左到右逐位过冲停稳，全部锁定瞬间整体加深脉冲",
    "use": "单个王牌指标的全屏亮相（\"10x\"/\"99.98%\"级）；与 impact-feedback B 式（伤害数字弹出）分工——那是元素级配菜，这是全屏级主菜",
    "duration": "滚动+逐位锁定 ~63f + 脉冲 8f + hold ≥45f，约 5s",
    "energy": "中高",
    "tags": [
      "typography"
    ],
    "path": "shot-cards/data/odometer-digit-roll.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "particle-celebrate-hits",
    "name": "particle-celebrate-hits",
    "category": "data",
    "summary": "庆祝粒子两式——confetti-crossfire 双侧礼炮（里程碑揭晓帧双炮交叉彩屑弹幕）与 counter-tick-sparks 数字溅火（计数器每破整千顶部迸火星）",
    "use": "里程碑数字/KPI 揭晓/成就段落；A 一次性大庆祝，B 持续小打点",
    "duration": "A 3–4s / B 4–5s",
    "energy": "高潮点缀型（爆发后必须落回纯净静止）",
    "tags": [
      "effects"
    ],
    "path": "shot-cards/data/particle-celebrate-hits.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "particle-sand-fill",
    "name": "particle-sand-fill",
    "category": "data",
    "summary": "粒子落斗成柱——柱状图不长高而是\"下雨下出来\"：方点粒子逐颗坠落堆积成柱，堆满凝成实体+数值弹出",
    "use": "柱状图/量级对比入场；讲\"积累/汇聚\"语义的数据段落",
    "duration": "4–5s",
    "energy": "中高（构筑感入场）",
    "tags": [
      "effects"
    ],
    "path": "shot-cards/data/particle-sand-fill.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "scroll-brake-moves",
    "name": "scroll-brake-moves",
    "category": "data",
    "summary": "长卷急刹两式——changelog-scroll-brake 基本款（高速长卷指数减速精准停位+目标抬升）与 brake-reticle-lock 组合款（急刹帧同帧准星咬合）",
    "use": "changelog/发布史/长列表段落：\"一直在发货，今天这条最大\"；要给停点更强打击感用 B",
    "duration": "A 4–5s / B 5s",
    "energy": "高开中收（速度对比型）",
    "tags": [
      "rhythm"
    ],
    "path": "shot-cards/data/scroll-brake-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "timeline-travel",
    "name": "timeline-travel",
    "category": "data",
    "summary": "时间轴横移——镜头沿水平刻度轴加速掠过版本刻度，每过一格卡片弹立短停，末刻度急停推近",
    "use": "changelog/里程碑/发展史段落（\"我们一直在发货\"的另一种拍法）；与 scroll-brake-moves 分工：那卡是纵向列表急刹，本卡是横向时间旅行",
    "duration": "4–5s",
    "energy": "中高（加速→急刹的节奏型镜头）",
    "tags": [
      "camera"
    ],
    "path": "shot-cards/data/timeline-travel.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动作阶段",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "assemble-then-type-flyin",
    "name": "assemble-then-type-flyin",
    "category": "effects",
    "summary": "空的暗底网格上，无文字的组件骨架先从四面八方飞入贴合；随后各处文字逐字从 3D 空间旋转着飞来落位，先大标题后小标注，全部落位后页面成形",
    "use": "页面/海报\"自己长出来\"的开场；排版类产品的能力展示；从骨架到成稿的两段式叙事",
    "duration": "约5.2s（156f@30fps）",
    "energy": "中高（骨架段稀疏、文字段密集，能量单调上升到收尾）",
    "tags": [],
    "path": "shot-cards/effects/assemble-then-type-flyin.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "aurora-bloom-bg-flip",
    "name": "aurora-bloom-bg-flip",
    "category": "effects",
    "summary": "浅灰底从底部升起紫橙柔焦 blob，随后整个底色在约 0.36s 内压暗到近黑、blob 压成余晖；文案同步 blur-out 换句 blur-in，换句间留空档不 cross-fade",
    "use": "叙事转折点（\"多年以来…→一切都变了\"）；品牌片从铺垫拉到重音的那一拍；深浅色系之间的段落切换",
    "duration": "约5.2s（156f@30fps）",
    "energy": "由低到高（前 2/3 是酝酿，压暗那一瞬是全片重音）",
    "tags": [],
    "path": "shot-cards/effects/aurora-bloom-bg-flip.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "brand-frame-snap",
    "name": "brand-frame-snap",
    "category": "effects",
    "summary": "品牌色画框语法——一圈粗纯色画框先于内容长出包住全屏，录屏窗口落进框内；模式切换时整圈画框同帧硬翻色+窗内布局同帧换，一个 borderColor 干完章节导航/状态提示/品牌露出三件事",
    "use": "双模式/双章节产品片的全片包装层（蓝=模式A、绿=模式B 颜色编码）；真实录屏素材的品牌化包裹",
    "duration": "单次翻色 ~4.3s（130f）；画框本身可全片驻场",
    "energy": "中（翻色瞬间高，其余时间是安静的包装层）",
    "tags": [
      "transition"
    ],
    "path": "shot-cards/effects/brand-frame-snap.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "dashboard-glow-highlight-pill",
    "name": "dashboard-glow-highlight-pill",
    "category": "effects",
    "summary": "金字悬于黑场，数据仪表盘自底带透视升入并持续 3D 漂移；金色光斑从右侧巡游到底部拉成胶囊，再由它起笔描出弹窗的辉光轮廓",
    "use": "金融/数据类产品的重功能揭示；\"注意这里\"的高级指引；黑金调品牌片的核心一拍",
    "duration": "约2.0s（60f@30fps）",
    "energy": "高（2s 里塞了升入 + 巡游 + 描边 + 弹窗四段，交棒必须密不透风）",
    "tags": [],
    "path": "shot-cards/effects/dashboard-glow-highlight-pill.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "fui-hud-moves",
    "name": "fui-hud-moves",
    "category": "effects",
    "summary": "FUI/HUD 两式——line-unfold-panel 一线展面（线→面 CRT 语法）与 reticle-lock-on 准星咬合（取景框飞入锁定目标）",
    "use": "暗场/科技感段落的面板入退场用 A；任何\"看这里\"的目标点名用 B（替代箭头圈红，画面不冻结）",
    "duration": "A 3–4s（含退场）/ B 2–3s",
    "energy": "A 中 / B 中高（咬合帧是打击点）",
    "tags": [
      "ui-entrance"
    ],
    "path": "shot-cards/effects/fui-hud-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "glow-flyline-moves",
    "name": "glow-flyline-moves",
    "category": "effects",
    "summary": "暗场光斑与飞线三式——glow-orb-ambient 光斑底噪、flyline-arc 飞线连接、orb-flyline-relay 同帧共振组合",
    "use": "全片唯一暗场段落的氛围与数据叙事：铺底噪用 A、讲数据流向用 B、要背景给前景搭腔用 C；Linear 官网味",
    "duration": "A ~5s / B ~4.7s / C ~5.2s",
    "energy": "A 低（底噪级）/ B 中 / C 中高",
    "tags": [
      "data"
    ],
    "path": "shot-cards/effects/glow-flyline-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "三式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "icon-performance-moves",
    "name": "icon-performance-moves",
    "category": "effects",
    "summary": "图标表演两式——pop-burst-confirm 爆花确认（对勾蓄力弹大+炸粒子+扩散环）与 attention-bounce 求关注弹跳（图标连跳递增+落地压扁+镜头被吸引）",
    "use": "半屏级 icon 特写段落；A \"完成/成功\"的标点符号，B 新功能引出",
    "duration": "A 3–4s / B 4–5s",
    "energy": "A 高潮点缀 / B 蓄势引入",
    "tags": [
      "interaction"
    ],
    "path": "shot-cards/effects/icon-performance-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "impact-feedback",
    "name": "impact-feedback",
    "category": "effects",
    "summary": "命中反馈两式——hit-counter 连招计数（顿帧+伤害数字+combo 跳字）、anime-impact 动漫打击帧（负片+集中线+色散）",
    "use": "元素落位/撞击的\"命中一瞬\"——给砸入、撞停加游戏级手感；按强度阶梯选式",
    "duration": "n/a（元素级技法，寄生在落位动作上；各式占用帧数见参数表）",
    "energy": "高（瞬时冲击）",
    "tags": [],
    "path": "shot-cards/effects/impact-feedback.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型表",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "light-play-moves",
    "name": "light-play-moves",
    "category": "effects",
    "summary": "光效三式——spotlight-sweep 聚光扫字、sheen 单点扫光、halation-bloom 撞停晕染",
    "use": "把光当第四种笔触（扫/擦/晕）：暗场标题揭示（A）、主角卡加冕（B）、撞停帧冲击（D）",
    "duration": "A ~5.3s / B ~4.7s / D ~4.8s",
    "energy": "A 中 / B 低 / D 高",
    "tags": [
      "typography"
    ],
    "path": "shot-cards/effects/light-play-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "三式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "line-boil",
    "name": "line-boil",
    "category": "effects",
    "summary": "线条沸腾——hold 期间文字/描边轮廓每 3 帧轻微扭动一次，像手绘逐帧重描，静止画面保持\"活着\"的呼吸感",
    "use": "标题字卡/描边元素的长 hold 段（黑场字卡升级首选）；质感层手法，寄生在别的镜头上",
    "duration": "寄生型——沸腾段随宿主 hold 长度，无自身时长",
    "energy": "低（底噪级）",
    "tags": [
      "typography"
    ],
    "path": "shot-cards/effects/line-boil.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "radial-ripple-phone-chips",
    "name": "radial-ripple-phone-chips",
    "category": "effects",
    "summary": "浅灰底四层同心圆错相呼吸如水波，中央手机 mockup 屏内 feed 自动缓滚，两侧白色 chip 先后 spring pop 入场并悬浮",
    "use": "移动端产品的\"这就是它\"定格镜头；功能点分列两侧的介绍段；片头/片尾的产品全景",
    "duration": "约5.6s（168f@30fps）",
    "energy": "低（安静、有呼吸感，靠同心圆的持续起伏撑住不冷场）",
    "tags": [],
    "path": "shot-cards/effects/radial-ripple-phone-chips.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "riso-print-hits",
    "name": "riso-print-hits",
    "category": "effects",
    "summary": "套印错位两式——riso-misregistration-hit 单发冲击帧（撞停裂双色版抖两下套准）与 riso-beat-pump 节拍泵（逐拍跳大+错版逐次加码）",
    "use": "标题/卡片的命中强调，纸墨审美版的\"故障闪\"；A 单发高潮、B 节奏段连打",
    "duration": "A 4s（单发）；B 4.7s（四拍）",
    "energy": "高",
    "tags": [
      "typography",
      "rhythm"
    ],
    "path": "shot-cards/effects/riso-print-hits.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "scan-bracket-sweep",
    "name": "scan-bracket-sweep",
    "category": "effects",
    "summary": "骨架文档弹到中央，四角落下 L 形取景括号，一条 2.5px 实线带渐变拖尾在文档上往复扫 5 趟——文档全程静止，只有光在读它",
    "use": "\"正在解析/校验这份内容\"的过程镜头；文档类产品的能力演示；上传→分析链路的中段",
    "duration": "约5.0s（150f@30fps）",
    "energy": "中低（机械、克制，节奏全在往复扫掠的呼吸上）",
    "tags": [],
    "path": "shot-cards/effects/scan-bracket-sweep.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "scanline-annotate-focus",
    "name": "scanline-annotate-focus",
    "category": "effects",
    "summary": "一条亮扫描线自上而下掠过页面，扫过之处按先后顺序弹出相机取景框（1.75 倍收拢对准 + 轻微过冲），随后旁侧打出等宽小字标注，顶部状态行同步计数 00/06→06/06",
    "use": "\"AI 正在读你的页面/品牌\"的分析镜头；设计系统/品牌规范的拆解介绍；产品能力的自我说明段",
    "duration": "约4.6s（138f@30fps）",
    "energy": "中（机械冷静，节奏由扫描线匀速推动，标注是节拍点）",
    "tags": [],
    "path": "shot-cards/effects/scanline-annotate-focus.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "scanline-assemble-flyin",
    "name": "scanline-assemble-flyin",
    "category": "effects",
    "summary": "页面开场是空的暗底网格，一条亮扫描线自上而下掠过；扫到每个区块的落点，该处组件就从画外飞入贴合，带残影模糊与落位闪边——扫完整页恰好装配完成",
    "use": "\"页面自己生成\"的开场；AI 建站/自动排版类产品的核心演示；从空白到成品的能力叙事",
    "duration": "约4.6s（138f@30fps）",
    "energy": "中高（扫描线是稳的，但每次组件飞入都是一个爆点，密度递进）",
    "tags": [],
    "path": "shot-cards/effects/scanline-assemble-flyin.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "slam-entrance-moves",
    "name": "slam-entrance-moves",
    "category": "effects",
    "summary": "高能砸入三式——kanada-perspective-snap 金田透视急停、score-slam 比分砸落、impact-burst-kit 落点冲击套件（波及邻卡）",
    "use": "主角卡/KPI 卡的重拳入场；impact-feedback 管落位后的反馈，本卡管入场本身就是冲击",
    "duration": "单式动作段 6–22f + 冲击余波 ~16f + hold ≥45f",
    "energy": "高",
    "tags": [
      "ui-entrance"
    ],
    "path": "shot-cards/effects/slam-entrance-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "三式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "spotlight-sweep-moves",
    "name": "spotlight-sweep-moves",
    "category": "effects",
    "summary": "暗场聚光显影三式——A 醒睡扫过（光到即亮光走即暗）、B 贴边泛光横摇（紫光贴 UI 边缘渗入+聚光匀速右移）、C 角落匀速显影（径向聚光从角落匀速扩张点亮全屏）；黑场里\"光即叙事\"的 UI 展示",
    "use": "暗色调品牌片里逐个介绍 UI 面板/功能区；黑场开场把界面\"点亮\"登场；段落间光转场",
    "duration": "单式 3.5–4.5s；A/B 可串联成巡礼段",
    "energy": "中低（克制、神秘感，爆点在\"亮起\"瞬间）",
    "tags": [
      "ui-entrance",
      "transition"
    ],
    "path": "shot-cards/effects/spotlight-sweep-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "ai-stream-response",
    "name": "ai-stream-response",
    "category": "interaction",
    "summary": "AI 响应面板先落一句可读摘要，再让带状态图标的证据行逐条汇入，最后统一收束成完成态",
    "use": "AI 助手/agent/search/copilot 的结果生成镜头；强调“结论先到、证据随后、任务完成”",
    "duration": "约 4–5s（120–150f，含 ≥15f 完成态静止）",
    "energy": "中高（信息持续增加，但阅读优先于速度炫技）",
    "tags": [],
    "path": "shot-cards/interaction/ai-stream-response.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "声音",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "autolayout-gap-dial",
    "name": "autolayout-gap-dial",
    "category": "interaction",
    "summary": "间距拨盘驱动布局——一排链接块带框选描边+缝隙间距标注，徽章数字逐格跳动、块被参数实时推开再弹簧回弹归位；\"参数驱动布局\"的可视化",
    "use": "设计工具/低代码产品的\"改一个数、界面跟着动\"卖点镜头；\"用设计工具语义做包装\"的品类语言",
    "duration": "~4s（120f：框选入场 + 拉松 38f + hold + 弹簧回弹）",
    "energy": "中（工具理性型，爽点在数字与位移的锁定同步）",
    "tags": [],
    "path": "shot-cards/interaction/autolayout-gap-dial.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "canvas-materialize-moves",
    "name": "canvas-materialize-moves",
    "category": "interaction",
    "summary": "内容\"物化上画布\"两式——panel-to-canvas 行倒卡（面板表格行沿弧线飞出、跨容器变形成画布卡片）与 diagram-cascade 级联生成树（prompt 打字后节点逐层弹出、连线先于节点生长）",
    "use": "AI/协作工具\"生成结果落到画布上\"的叙事段落；A 式讲\"已有内容换了个存在形态\"，B 式讲\"从一句话长出一棵结构\"",
    "duration": "A ~4.3s（130f）/ B ~5.3s（160f）",
    "energy": "中",
    "tags": [
      "ui-entrance"
    ],
    "path": "shot-cards/interaction/canvas-materialize-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "chip-grid-single-select-blackout",
    "name": "chip-grid-single-select-blackout",
    "category": "interaction",
    "summary": "五个选项 chip 以 3+2 居中排布逐个淡入；选中帧先插一帧灰色按压块，紧接数帧内底色变纯黑、文字变白并做 1→1.04→1 极轻回弹，其余 chip 淡到 18% 但位置锁死；随后余项归零，黑 chip 上移收窄，下方浮现算式行",
    "use": "单选/套餐/档位选择的交互演示；\"选了它之后会怎样\"的因果镜头；价格/参数结算类链路",
    "duration": "约5.0s（150f@30fps）",
    "energy": "中低（唯一的爆点是那一帧灰闪，其余都在收）",
    "tags": [],
    "path": "shot-cards/interaction/chip-grid-single-select-blackout.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "chip-lift-to-user-pill",
    "name": "chip-lift-to-user-pill",
    "category": "interaction",
    "summary": "网格里的目标 chip 先 3 帧硬切反色成黑底白字，其余 chip 按到它的曼哈顿距离交错淡出缩小；黑 chip 左缘锚定向右生长成药丸，内部逐字打出人名并点亮绿点，再拉一条 1px 连接线接到圆形徽标",
    "use": "\"从一堆候选里选中并展开这一个\"的交互链路；协作/通讯录/收件人类产品的功能演示；选中→详情的转场",
    "duration": "约5.0s（150f@30fps）",
    "energy": "中（选中那一下是硬爆点，之后全是从容的生长与打字）",
    "tags": [],
    "path": "shot-cards/interaction/chip-lift-to-user-pill.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "collab-cursor-moves",
    "name": "collab-cursor-moves",
    "category": "interaction",
    "summary": "协作光标当演员的两式——dialogue-duet 双光标暗场对话双人舞（靠近/绕位/灯光交接/放大成转场），与 cast-ensemble 五光标群演氛围层（错峰飞入+正弦漂移+打字 cameo+聚拢围观）",
    "use": "协作/多人/交接主题的叙事段；A 撑起无 UI 的纯叙事拍，B 给画布场景铺\"团队在场\"体温",
    "duration": "A ~4.7s（140f）/ B ~4.7s（140f）",
    "energy": "A 中（叙事密度高）/ B 低中（氛围层，可垫任何时长）",
    "tags": [],
    "path": "shot-cards/interaction/collab-cursor-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "command-palette-summon",
    "name": "command-palette-summon",
    "category": "interaction",
    "summary": "命令面板降临——整屏压暗加模糊，⌘K 面板带过冲弹落，候选行错峰浮现，敲字列表实时收窄",
    "use": "效率型产品的\"全产品在一个输入框里\"叙事；命令面板/搜索/快捷键功能的标志性登场",
    "duration": "4–5s",
    "energy": "中（仪式感型，弹落帧与收窄是两个小打击点）",
    "tags": [
      "ui-entrance"
    ],
    "path": "shot-cards/interaction/command-palette-summon.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动作阶段",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "glass-pill-dictation-typing",
    "name": "glass-pill-dictation-typing",
    "category": "interaction",
    "summary": "纯黑底上一条定宽玻璃胶囊以约 1.25 倍略大弹出后缓落到位，内部自左暗到右亮铺一层强调色光；光标先行、随后打字出现占位句，光随打字进度渐渐熄灭，收尾成中性深色玻璃条",
    "use": "语音/AI 输入框的登场；\"跟它说话\"的交互提示镜头；高能段之间的一个安静过渡拍",
    "duration": "约1.7s（50f@30fps）",
    "energy": "低（全片最安静的一拍，只有光在退）",
    "tags": [],
    "path": "shot-cards/interaction/glass-pill-dictation-typing.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "hashtag-to-pill-materialize",
    "name": "hashtag-to-pill-materialize",
    "category": "interaction",
    "summary": "话题词打字实体化——居中打出 \"#word\"（红实心光标恒亮），1 帧硬切变成宽大胶囊标签，hold 后缩小左移落到页面标签位，再 1 帧硬切揭示成品页；\"两次硬切一次滑动\"的节奏骨架",
    "use": "标签/分类/关键词功能的演示段（笔记 app 打 tag、话题聚合）；\"输入 → 变成 UI 实体 → 归位到成品\"的三段式叙事",
    "duration": "打字 ~40f + 硬切胶囊 hold ~18f + 缩移 ~14f + 硬切揭示后静置；全段约 3.5s（原片 18–21.5s）",
    "energy": "中（干脆利落，靠硬切给劲，不靠弹跳）",
    "tags": [
      "typography"
    ],
    "path": "shot-cards/interaction/hashtag-to-pill-materialize.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "input-trigger-moves",
    "name": "input-trigger-moves",
    "category": "interaction",
    "summary": "输入触发两式——cursor-performance 光标表演点击推近、keycap-smash-cut 键帽引信引爆猛切",
    "use": "发布片的第一人称段落：演示核心交互、开场即高潮；观众\"在用\"而不是\"在看\"产品",
    "duration": "A ~5s / C ~5s",
    "energy": "A 中 / C 高",
    "tags": [
      "opening"
    ],
    "path": "shot-cards/interaction/input-trigger-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "picker-carousel-feature-cycle",
    "name": "picker-carousel-feature-cycle",
    "category": "interaction",
    "summary": "移动端风竖向选择器——焦点药丸不动、内容穿过它，每项带明显 outQuint 减速吸附后完全静止，按到中心距离分层控制透明度/字号/灰度，落定时药丸做 scaleY 极轻呼吸",
    "use": "逐个念出功能名/场景名的列表镜头；\"选一个\"的交互演示；移动端产品的 picker 类控件展示",
    "duration": "约3.6s（108f@30fps）",
    "energy": "中（每一次吸附都是一个节拍点，5 拍匀速推进）",
    "tags": [],
    "path": "shot-cards/interaction/picker-carousel-feature-cycle.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "segmented-thumb-hero",
    "name": "segmented-thumb-hero",
    "category": "interaction",
    "summary": "分段控件 thumb 位移当主角特写——超大胶囊 segmented control 弹簧浮入，描边箭头光标画外滑入按下，白 thumb 8f ease-out 滑到另一段，到位瞬间新图标 spring 弹出、旧图标收起",
    "use": "\"模式切换/二选一\"功能的宣告镜头（Ask→Computer、Chat→Agent 式）；一个 UI 微交互撑一整镜的特写拍法",
    "duration": "~3.5s（demo 110f：浮入 18f + 光标 24f + 点击 + 滑动 8f + 图标弹出 + hold）",
    "energy": "中（微交互特写，精致不轰）",
    "tags": [],
    "path": "shot-cards/interaction/segmented-thumb-hero.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "theme-switch-moves",
    "name": "theme-switch-moves",
    "category": "interaction",
    "summary": "主题切换两式——theme-sweep 斜向扫场（边界扫过处就地换肤）与 palette-ripple 组合款（⌘K 面板收缩成点、涟漪从点荡开换肤）",
    "use": "深色模式/主题功能的叙事段落；同一 UI \"在你眼前变色\"而非切到新场景",
    "duration": "A 3–4s / B 5–6s",
    "energy": "A 中 / B 中高（组合款有完整因果链）",
    "tags": [],
    "path": "shot-cards/interaction/theme-switch-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "type-and-filter",
    "name": "type-and-filter",
    "category": "interaction",
    "summary": "真实 UI 上打字搜索、网格自己收敛成一张卡、点击穿透进详情页",
    "use": "功能演示的\"操作叙事\"段；搜索/筛选/进入详情的任何交互链路",
    "duration": "约 2.5s（118–190f）",
    "energy": "中（发牌高能段之后的从容一拍）",
    "tags": [],
    "path": "shot-cards/interaction/type-and-filter.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "声音",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "voice-waveform-live",
    "name": "voice-waveform-live",
    "category": "interaction",
    "summary": "录音胶囊实时声纹——64 根细竖条随\"说话\"起伏，说话时中部高耸、停顿缩成点线，波形从右往左滚动；说→停→说→提交塌缩的完整表演",
    "use": "语音输入/AI 助手\"正在听你说\"的功能镜头；无 UI 内容可展示但需要持续活性撑画面的段落",
    "duration": "~5s（150f：入场 12f + 说 1.4s + 停 0.8s + 说 1.4s + 提交塌缩 0.8s）",
    "energy": "中（功能性活性，不是炫技）",
    "tags": [],
    "path": "shot-cards/interaction/voice-waveform-live.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "brand-ink-open",
    "name": "brand-ink-open",
    "category": "opening",
    "summary": "墨线十字准星描画→字标逐字压印→打字机副标→满一秒静止再上浮消散",
    "use": "品牌开场；任何\"先立名号再进产品\"的片头",
    "duration": "约 2.8s（83f）",
    "energy": "低（起步位，为后续镜头留爬升空间）",
    "tags": [
      "typography"
    ],
    "path": "shot-cards/opening/brand-ink-open.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "声音",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "crane-rise-reveal",
    "name": "crane-rise-reveal",
    "category": "opening",
    "summary": "升降臂拉升揭示——开场怼在一行数据特写，相机沿 Y 轴减速升起后拉，行行涌入直到整面 dashboard 铺满全幅",
    "use": "\"从细节到全局\"的开场定场；与 drone-dive-landing（全局→单点俯冲）互为反向",
    "duration": "5s（特写 hold 20f + 拉升 100f + 满幅静止 30f）",
    "energy": "中高（持续单向运动，无冲击拍）",
    "tags": [
      "camera",
      "data"
    ],
    "path": "shot-cards/opening/crane-rise-reveal.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "dataviz-landscape-open",
    "name": "dataviz-landscape-open",
    "category": "opening",
    "summary": "暗场支流线束地景开场——多条流线汇入主干、虚构 ID 标签浮在线上、相机重景深低速飞越",
    "use": "品牌级抽象开场（\"数据宇宙\"隐喻），接亮场产品段或字标；与 glow-flyline-moves 分工：那卡是段落内卡片之间的连线叙事，本卡是开场专用的全画幅地景",
    "duration": "5–8s（开场氛围段，一支片 ≤1 次）",
    "energy": "低开缓升（起步位，为后续爬升留空间）",
    "tags": [
      "data",
      "camera"
    ],
    "path": "shot-cards/opening/dataviz-landscape-open.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动作阶段",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "fracture",
    "name": "fracture",
    "category": "opening",
    "summary": "5×5 瓦片从 3D 碎片态按中心波纹逐圈聚合成整面海报，停一拍亮字，随后全部碎片背离中心加速旋转飞出画面",
    "use": "开场第一镜\"从混沌到成形\"的品牌/海报揭示；倒放或只取后半可作硬转场",
    "duration": "约 5.2s（156f@30fps；聚合 0–2.6s · hold 1s · 飞散 1.5s）",
    "energy": "高（两头高能、中段静止，适合压 BGM 重音起收）",
    "tags": [],
    "path": "shot-cards/opening/fracture.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "icon-field-colorize",
    "name": "icon-field-colorize",
    "category": "opening",
    "summary": "灰阶小图标点阵错峰浮现铺满全屏，停一拍后多道品牌色横带波纹极快向下扫翻全场——\"功能全景先摆满，品牌一瞬间点亮\"的开场/收束卡",
    "use": "开场铺陈产品能力面（图标=功能宇宙）再一举打上品牌色；功能集合页、生态/集成规模展示、片头 logo 前垫场",
    "duration": "浮现 ~45f 错峰 + 静置 ~10f + 翻色 12–45f + 终态静置；全段 3–4s",
    "energy": "中（浮现是铺垫，翻色瞬间是唯一爆点）",
    "tags": [
      "ui-entrance",
      "outro"
    ],
    "path": "shot-cards/opening/icon-field-colorize.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "letterspace-materialize",
    "name": "letterspace-materialize",
    "category": "opening",
    "summary": "大字距字标全字符并行连续描画结晶——所有字母同帧起笔、笔画像手写一样连续生长、同帧齐收成词；氛围底景上的品牌字标显影",
    "use": "片尾/片头品牌字标登场（SUPERHUMAN 式大字距全大写）；章节题字；needs 静谧/高级感的收束帧",
    "duration": "静置 ~15f + 描画 ~50f + 终态静置 ≥30f；全段 3–4s",
    "energy": "低（静谧仪式感，一次呼吸完成）",
    "tags": [
      "typography",
      "outro"
    ],
    "path": "shot-cards/opening/letterspace-materialize.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "magician-card-flourish",
    "name": "magician-card-flourish",
    "category": "opening",
    "summary": "纯黑场上蓝色星芒闪现 0.3s（X 形针状光束旋转 90°+中心辉光放射小光芒），卡片从闪光点弹射而出——极速自旋弧线飞向镜头、自旋随靠近衰减、瞬间硬定格近满幅、定格后 sheen 扫光",
    "use": "单张卡片/海报/封面的魔术性登场（片头主视觉、产品卡揭晓）；纯黑暗场；需要\"变出来\"仪式感的爆点",
    "duration": "闪光 0.3s + 飞行 ~1.7s + 定格展示+扫光 ~2s；全段 4.2s",
    "energy": "高（一次性爆点，定格后即静）",
    "tags": [
      "ui-entrance",
      "effects"
    ],
    "path": "shot-cards/opening/magician-card-flourish.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "spotlight-hero-card",
    "name": "spotlight-hero-card",
    "category": "opening",
    "summary": "聚光灯扫过页面锁定一张卡，斜 45° 推进后卡片弹起悬浮、光束沿轮廓两圈、贴回原位",
    "use": "\"单一主角\"式产品开场；把一个核心对象（卡片/条目/模块）立成全片主角",
    "duration": "约 4.6s（82–220f）",
    "energy": "中（质感最高的一镜，节奏慢而稳）",
    "tags": [
      "effects",
      "camera"
    ],
    "path": "shot-cards/opening/spotlight-hero-card.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "声音",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "stroke-segment-build",
    "name": "stroke-segment-build",
    "category": "opening",
    "summary": "断笔成字——标题拆成十几段互不相连的笔画乱序逐段点亮，前 70% 不可读，末段落位瞬间语义\"啪\"地成立",
    "use": "开场吊悬念的产品名/大数字揭晓；一支片 ≤1 次；与 type-assembly/draw-svg-trace 分工：那些是\"看着字被组装/描画\"，本卡是\"意义延迟揭晓\"",
    "duration": "4–5s",
    "energy": "低起中收（悬念型，落位帧是能量点）",
    "tags": [
      "typography"
    ],
    "path": "shot-cards/opening/stroke-segment-build.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动作阶段",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "text-as-mask",
    "name": "text-as-mask",
    "category": "opening",
    "summary": "文字视频遮罩——超粗大标题字内部透出缓慢平移的产品画面，结尾字形放大 26 倍溢出、内部画面接管全屏",
    "use": "品牌词/口号与产品画面二合一的开场或章节卡；字是门、产品在门里",
    "duration": "5s（hold 20f + 字内漂移 80f + 放大接管 30f + 静止 20f）",
    "energy": "中高（漂移段沉稳，接管段一次爆发）",
    "tags": [
      "typography"
    ],
    "path": "shot-cards/opening/text-as-mask.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "edit-hook-moves",
    "name": "edit-hook-moves",
    "category": "outro",
    "summary": "logo-sting-button 片尾钩子——片尾 logo 定住后突插 12f 彩蛋再收，预告片 button ending",
    "use": "片尾收束（全片 ≤1 次）",
    "duration": "~5s",
    "energy": "低→瞬时中→低",
    "tags": [],
    "path": "shot-cards/outro/edit-hook-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "单式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "grain-dissolve",
    "name": "grain-dissolve",
    "category": "outro",
    "summary": "整行字爆裂成沸腾颗粒噪点并浮现斜纹选区框，噪点云急速凝聚成更大号发光短字标，位移衰减归零定格",
    "use": "收尾\"XX. Now Live\"式上线宣告；长句信息压缩成品牌短标的能量聚合拍",
    "duration": "约 2.0s（60f@30fps；砂化 0.26–0.56s · 凝聚 1.2–1.42s · 凝固回落收尾）",
    "energy": "中高（短促、一次性的能量脉冲，天然的 outro 卡点）",
    "tags": [],
    "path": "shot-cards/outro/grain-dissolve.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "logo-shrink-wordmark-lockup",
    "name": "logo-shrink-wordmark-lockup",
    "category": "outro",
    "summary": "霓虹切口大环快速收束成中央实心小白 O 并带过冲刹车，图标左移让位，字母逐个滑入完成 lockup，强调色标语收尾",
    "use": "片尾品牌定妆：从满屏图形能量收束到\"图标+字标+标语\"的标准 lockup",
    "duration": "约 4.4s（132f@30fps；收束 0.1–1.2s · 让位 1.5–2.1s · 字母 2–2.7s · 标语 3.2–3.7s）",
    "energy": "中（收束段有冲击力，整体是沉稳的落定节奏）",
    "tags": [],
    "path": "shot-cards/outro/logo-shrink-wordmark-lockup.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "neon-triple-marquee",
    "name": "neon-triple-marquee",
    "category": "outro",
    "summary": "三行对向霓虹跑马灯 recap——BETTER/FASTER/STRONGER 空心描边巨字上中下排满全屏，奇偶行反向匀速无限横滚，三行按 1/3 相位轮流亮起，结尾整组淡出",
    "use": "片尾主题词复读机段落；三连词口号的\"余韵\"拍法（cel-flash-stomp 砸完之后的低一档收尾）；音乐段无旁白铺陈",
    "duration": "4–5s（demo 150f：10f 淡入 + 循环体 + 20f 淡出）",
    "energy": "中高（持续流动 + 逐行脉冲，无瞬时冲击）",
    "tags": [
      "typography"
    ],
    "path": "shot-cards/outro/neon-triple-marquee.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "outro-group-photo-launch",
    "name": "outro-group-photo-launch",
    "category": "outro",
    "summary": "全片元素从四面八方飞来围住字标合影，crane 落机位+舞台光+金尘做成发布会收场",
    "use": "outro/品牌收尾；多功能产品的\"全家福\"式终镜",
    "duration": "约 4.8s（145f）",
    "energy": "峰值（全片最高点）",
    "tags": [],
    "path": "shot-cards/outro/outro-group-photo-launch.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "声音",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "ui-strip-away-outro",
    "name": "ui-strip-away-outro",
    "category": "outro",
    "summary": "减法式收尾——点击 Publish 后整个编辑器 UI 从外围到中心层层错峰蒸发，黑场上只剩那颗按钮滑到屏心放大，按钮再淡出交棒字标定版",
    "use": "\"发布/完成\"语义的 outro；想讲\"一键之后一切复杂性消失\"的产品收尾",
    "duration": "~4.3s（130f：光标就位 34f → 蒸发 ~40f → 按钮独占 → 字标接棒）",
    "energy": "中（前段安静操作，中段持续退场，无瞬时冲击）",
    "tags": [],
    "path": "shot-cards/outro/ui-strip-away-outro.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "ui-to-brand-morph",
    "name": "ui-to-brand-morph",
    "category": "outro",
    "summary": "UI 变品牌两式——icon-flip-bloom 图标 Y 轴翻扁成竖线绽放成花形 mark + wordmark 逐字落定，与 input-morph-assemble 输入框收缩成胶囊、三粒图元落下集结成 logo 单瓣",
    "use": "品牌收尾/outro 前最后一拍；\"你每天用的那个 UI 就是这个品牌\"的视觉论证",
    "duration": "A ~4.3s（130f）/ B ~4.7s（140f）",
    "energy": "中高（收尾点睛，一次完整变形讲完）",
    "tags": [],
    "path": "shot-cards/outro/ui-to-brand-morph.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "beat-cut-moves",
    "name": "beat-cut-moves",
    "category": "rhythm",
    "summary": "硬切当节拍乐器的两式——递进硬切串（间隔减半加速逼近）与连闪定格（三次白闪各切一个裁切）",
    "use": "高光/冲刺段落把\"切\"本身打成鼓点；A 式预告片式加速逼近，B 式颁奖连拍仪式感",
    "duration": "A 全程 ~4.3s（建立 49f + 五连切 + 定格 hold 35f）；B 全程 ~4.3s（活素材 30f + 三闪 + hold 60f）",
    "energy": "高",
    "tags": [
      "transition"
    ],
    "path": "shot-cards/rhythm/beat-cut-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "beat-step-list-theme-cycle",
    "name": "beat-step-list-theme-cycle",
    "category": "rhythm",
    "summary": "三通道节拍器——深色场形容词列表逐拍上移一行，视口中央固定胶囊\"接住\"下一个词并换色，整场底色同拍跟换；行、色、场三通道锁死同一拍点",
    "use": "\"同一产品多种气质/多主题展示\"段落（modern/playful/expressive 式形容词连打）；全片节奏最密的一段；音乐段对拍",
    "duration": "铺垫 30f + 每拍 18f × 拍数 + 收尾 hold；3 拍约 3.5s（demo 110f）",
    "energy": "高（0.6s 一拍三通道齐跳，密度型高能）",
    "tags": [
      "typography"
    ],
    "path": "shot-cards/rhythm/beat-step-list-theme-cycle.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "montage-rhythm-moves",
    "name": "montage-rhythm-moves",
    "category": "rhythm",
    "summary": "蒙太奇节奏三式——drop-blackout-slam 黑场蓄爆、wright-triple-cut 三连咔哒特写、domino-cascade 多米诺连锁入场",
    "use": "段落级节奏设计：蓄力爆发（A）、流程速写（B）、开场连锁（C）；与 beat-cut-moves（切点排布）互补——这三式管\"段落的呼吸形状\"",
    "duration": "A 4.3s / B 4.3s / C 5s",
    "energy": "高",
    "tags": [],
    "path": "shot-cards/rhythm/montage-rhythm-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "三式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "panel-grid-moves",
    "name": "panel-grid-moves",
    "category": "rhythm",
    "summary": "分格节奏三式——grid-flash-mosaic 九宫格闪切填墙吞屏、flip-grid-reflow 网格集体重排、comic-panel-split 漫画斜格三机位并列",
    "use": "把\"格子\"当节奏器：逐格踩拍亮相（A）、节拍点集体换位（B）、同主体多机位定格并列（C）；三式都吃拍点",
    "duration": "A ~4.7s / B ~4.8s / C ~5s",
    "energy": "A 高 / B 中 / C 中高",
    "tags": [
      "ui-entrance"
    ],
    "path": "shot-cards/rhythm/panel-grid-moves.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "三式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "quad-split-parallel-scenes",
    "name": "quad-split-parallel-scenes",
    "category": "rhythm",
    "summary": "画面硬切 2×2 四宫格，四个象限并行跑各自的微场景（打字、急推、逐词、交互链），关键节拍错开 3–6 帧制造信息轰炸",
    "use": "节奏段\"功能很多、同时发生\"的蒙太奇拍；预告片中段的密度峰值",
    "duration": "约 2.1s（63f@30fps，全程无转场）",
    "energy": "高（四线并行 + 错拍冲击，标准的 BGM 副歌位）",
    "tags": [],
    "path": "shot-cards/rhythm/quad-split-parallel-scenes.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "rhythm-interrupt-moves",
    "name": "rhythm-interrupt-moves",
    "category": "rhythm",
    "summary": "打断节奏两式——jump-cut-punch-in 三级跳切推近、strobe-black-frames 频闪黑帧",
    "use": "用\"打断连续性\"本身当节奏器：顿挫推近（B）、窒息逼近（C）；与 beat-cut-moves（切点排布）、montage-rhythm（段落呼吸）互补",
    "duration": "B ~4.5s / C ~4.5s",
    "energy": "B 中 / C 高",
    "tags": [],
    "path": "shot-cards/rhythm/rhythm-interrupt-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "sakuga-timing-shift",
    "name": "sakuga-timing-shift",
    "category": "rhythm",
    "summary": "一拍三转一拍一——元素先以每 3 帧一步的手翻书顿挫移动，高潮瞬间切成逐帧丝滑冲刺，帧率量化的突变本身就是看点",
    "use": "单元素的强调性位移（卡片入场、指标冲线）；需要\"手工感→高潮爆发\"反差的段落",
    "duration": "~5s",
    "energy": "中高",
    "tags": [
      "ui-entrance"
    ],
    "path": "shot-cards/rhythm/sakuga-timing-shift.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "smear-multiples",
    "name": "smear-multiples",
    "category": "rhythm",
    "summary": "残像分身——卡片高速横移时拖 4 个清晰可数的半透明分身副本，落位瞬间收拢合一；motion blur 的动画式平替",
    "use": "元素高速位移段想要\"漫画式速度感\"而非\"摄影式模糊\"时；与 CameraMotionBlur 二选一",
    "duration": "元素级技法（移动 12f + 合拢回弹 8f，寄生在位移动作上）",
    "energy": "中高",
    "tags": [
      "effects"
    ],
    "path": "shot-cards/rhythm/smear-multiples.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "spectrum-morph-ui",
    "name": "spectrum-morph-ui",
    "category": "rhythm",
    "summary": "频谱化 UI——标题下划线裂成一排竖条按频谱跳动两小节，再收拢还原成直线；音乐可视化长在 UI 上",
    "use": "有音轨片子的声画同步高光段（BGM 副歌起/鼓点密集段）；标题字卡、章节页的下划线/分隔线构件",
    "duration": "~4.7s（裂开 8f + 跳动 64f + 收拢 12f + 静止 39f）",
    "energy": "中",
    "tags": [
      "typography"
    ],
    "path": "shot-cards/rhythm/spectrum-morph-ui.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "speed-ramp-freeze",
    "name": "speed-ramp-freeze",
    "category": "rhythm",
    "summary": "帧号非线性 remap 的两款节奏手法——变速（快→0.2x 凝视→快）与定格标注（流动→定格圈注→解冻）",
    "use": "卡片流/长横移中把一个重点\"放慢/停下给人看\"；教学解说语境用定格标注",
    "duration": "变速全程 4–5s（慢速窗 ≥40f）；定格标注全程 4–5s（定格段 ≥45f）",
    "energy": "中高（速度反差本身即energy beat）",
    "tags": [],
    "path": "shot-cards/rhythm/speed-ramp-freeze.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "trailer-grammar-moves",
    "name": "trailer-grammar-moves",
    "category": "rhythm",
    "summary": "预告片语法三式——trailer-bumper 前置速剪钩子、card-footage-cadence 字卡穿插对话、smash-cut 猛切入定",
    "use": "预告片的三个结构性时刻：开场怎么钩（A）、中段怎么对话（B）、高潮怎么收（C）；三式合用即一支预告片的骨架",
    "duration": "A ~4.7s / B ~5s / C ~4.5s",
    "energy": "A 高 / B 中 / C 高",
    "tags": [
      "opening",
      "transition"
    ],
    "path": "shot-cards/rhythm/trailer-grammar-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "三式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "bottom-push-stack-wipe",
    "name": "bottom-push-stack-wipe",
    "category": "transition",
    "summary": "底边上推换章——新场景连底色整屏从底边向上推入，把旧场景物理顶出画外，连推数章各配一种饱和底色，内容钉死在各自色底坐标系里随底色走",
    "use": "多章节产品片的换章骨架（每章一个卖点一种底色）；需要\"翻页节奏感\"贯穿全片的段落切换",
    "duration": "单次推入 30f + 章内 hold ~1s；demo 三连推 140f（~4.7s）",
    "energy": "中",
    "tags": [],
    "path": "shot-cards/transition/bottom-push-stack-wipe.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "bubble-swarm-takeover",
    "name": "bubble-swarm-takeover",
    "category": "transition",
    "summary": "珠光气泡群幕布转场——大小不一的气泡从画外飘入越涨越大遮满整屏，页面同步\"洗白\"，遮蔽峰值处藏切换，气泡向外散开后已是新场景；可混入 i18n 文字胶囊变体",
    "use": "章节级换景且品牌世界里有\"实体装饰物\"可当幕布（气泡/花瓣/图标皆可换皮）；转场即品牌露出的段落",
    "duration": "~4.3s（130f：飘入 ~67f + 峰值藏切 + 散开 ~43f）",
    "energy": "中高（持续群体涌动，无瞬时冲击）",
    "tags": [],
    "path": "shot-cards/transition/bubble-swarm-takeover.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "card-flip-reveal",
    "name": "card-flip-reveal",
    "category": "transition",
    "summary": "功能卡 3D 翻面揭示——卡片沿 Y 轴翻 180°，正面 UI 翻到侧棱最薄处闪过一道随角度移动的高光带，背面揭出大号结论数字，逐张错峰扫过整排",
    "use": "\"功能→成果\"的成对叙事：一排功能卡逐张翻出各自的指标/结论；元素级转场卡",
    "duration": "单卡翻转 26f，三卡错峰 10f，全程 ~4.9s（含 hold）",
    "energy": "中高",
    "tags": [
      "data"
    ],
    "path": "shot-cards/transition/card-flip-reveal.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "card-flock-tumble",
    "name": "card-flock-tumble",
    "category": "transition",
    "summary": "三张 UI 页卡从侧棱薄边 3D 翻飞成阶梯站定（全程清晰、样条连续丝滑），站定后保持慢转不停，快速收束吸入中心，炸出单个湍流烟雾环扩散，巨字横贯收场",
    "use": "能量高潮段（功能页群→品牌口号的爆点转场）；霓虹暗场调性；\"多页面能力\"收束成一句话的段落",
    "duration": "翻飞 ~1.5s + 慢转展示 ~0.3s + 收束 0.3s + 烟环+巨字 ~2s；全段 4.5s",
    "energy": "极高（全片能量顶点用）",
    "tags": [],
    "path": "shot-cards/transition/card-flock-tumble.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "circle-match-iris",
    "name": "circle-match-iris",
    "category": "transition",
    "summary": "圆心匹配光圈切——光圈从页面上圆形元素的圆心炸开，圈内新页的圆形图表接在同一个圆上；匹配剪辑给光圈一个语义锚点",
    "use": "前景有圆形元素（头像/图标/圆钮）、后景有圆形主体（donut 图/圆环进度）的接缝；转场技法卡",
    "duration": "4.7s（锚点脉冲 30f + 光圈扩张 45f + 图表生长 55f + 静止 40f）",
    "energy": "中高",
    "tags": [],
    "path": "shot-cards/transition/circle-match-iris.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "color-block-step-wipe",
    "name": "color-block-step-wipe",
    "category": "transition",
    "summary": "离散阶跃色块吞屏两式——A 中央小条按 3–5 步硬跳阶跃扩成全屏（接管后徽章两跳弹出），B 色块从角落斜向 3 步吃屏并携带一张页面卡逐跳前进",
    "use": "品牌色转场/章节交接；\"硬朗无缓动\"的像素游戏手感段落；接管后的纯色场当下一段的舞台",
    "duration": "A ~2.5s（生长 44f + 徽章 + hold）/ B ~1.5–2s（3 跳 30f + hold）；demo 合计 150f",
    "energy": "中高（能量来自\"跳变\"的顿挫而非速度）",
    "tags": [],
    "path": "shot-cards/transition/color-block-step-wipe.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "cube-navigation",
    "name": "cube-navigation",
    "category": "transition",
    "summary": "内容贴满 3D 立方体六面，相机正面特写→拉远等轴看棱角→转面推近交替步进，每面按法线朝向实时算明暗",
    "use": "多模块产品的\"逐面导航\"陈列：Overview/Metrics/Timeline 等 3–6 个板块的空间化串讲",
    "duration": "约 6.0s（180f@30fps；五段相机步进，每段约 0.7s + hold）",
    "energy": "中（稳定的空间巡航，靠转面瞬间的透视变化给节拍）",
    "tags": [],
    "path": "shot-cards/transition/cube-navigation.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "gradient-transition",
    "name": "gradient-transition",
    "category": "transition",
    "summary": "背景在 linear、radial、conic 三类 CSS 渐变间平滑过渡——角度、色标、中心、半径逐参数插值，段间交叉淡化换类型",
    "use": "氛围底/章节底色的连续变奏；给静态排版段落提供\"活着\"的背景层",
    "duration": "约 6.0s（180f@30fps；linear 0–2.4s · radial 2–4.2s · conic 4–6s）",
    "energy": "低（纯背景运动，为前景内容让路）",
    "tags": [],
    "path": "shot-cards/transition/gradient-transition.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "line-carry-transition",
    "name": "line-carry-transition",
    "category": "transition",
    "summary": "线条接力横移转场——场景 A 的进度条延伸出画，镜头跟线横移，线在移动中拐角围出场景 B 的卡框，全程无剪切",
    "use": "两个有图形亲缘的场景之间（进度条→卡框、下划线→图表轴）；一支片子的招牌转场位，Catch Me If You Can 片头的图形接力",
    "duration": "~5.3s（进度条走满 + 横移 60f + 围框 + 内容淡入 + 静止 36f）",
    "energy": "中",
    "tags": [
      "camera"
    ],
    "path": "shot-cards/transition/line-carry-transition.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "mosaic-reframe",
    "name": "mosaic-reframe",
    "category": "transition",
    "summary": "12 张瓦片在规则网格、feature mosaic、对角瀑布串三种排版间连续变形，位置宽高各自插值、逐片微错峰，段间留 hold",
    "use": "\"同一批内容多种看法\"的陈列转场：作品集/模板库/相册产品的布局能力展示",
    "duration": "约 6.0s（180f@30fps；浮现 0–0.6s · A→B 1.6–2.5s · hold · B→C 3.7–4.8s）",
    "energy": "中（连续流动的重排，无爆点，气质从容）",
    "tags": [],
    "path": "shot-cards/transition/mosaic-reframe.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "page-turn-transitions",
    "name": "page-turn-transitions",
    "category": "transition",
    "summary": "整页体块转场两式——cube-rotate 立方体翻转（两页贴盒子相邻面转 90°）与 barn-door-split 对开门裂幕（旧页裂两半滑出、新页迎上）",
    "use": "章节级换页：两个并列大段落之间的\"翻篇\"仪式；与 shot-transitions 系（镜头交棒）分工——那是\"航拍机移过去\"，这是\"页面自己是实体\"",
    "duration": "单式 前态建立 30f + 转场 20–38f + 收尾 ≥40f，约 4.4–4.7s",
    "energy": "中高",
    "tags": [],
    "path": "shot-cards/transition/page-turn-transitions.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "paper-plane-messenger",
    "name": "paper-plane-messenger",
    "category": "transition",
    "summary": "纸飞机信使转场——点击\"发送\"后镜头拉远脱离窗口 A，折纸飞机沿贝塞尔弧线飞出（俯仰跟随切线），镜头伴飞穿过多层视差道具，飞抵窗口 B 门前落定，B 放大接管全屏",
    "use": "\"发送/邀请/分享\"动作连接两个人物/场景视角的叙事转场；抽象动作需要一个隐喻实体当转场载具时",
    "duration": "~5s（150f：点击 12f → 拉远 16–42f → 飞行 34–104f → B 接管 112–146f）",
    "energy": "中",
    "tags": [
      "camera"
    ],
    "path": "shot-cards/transition/paper-plane-messenger.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "print-texture-transitions",
    "name": "print-texture-transitions",
    "category": "transition",
    "summary": "印刷质感转场——ink-bleed-reveal 墨渗揭示（须状渗边洇开吃掉旧景）",
    "use": "换景接缝的纸墨审美款；与交棒六式/穿越三式并列的第三族——\"介质显影\"型转场",
    "duration": "4–4.5s（洇开段 55–80f + 静止收尾 ≥30f）",
    "energy": "中（渐进显形，无冲击拍）",
    "tags": [],
    "path": "shot-cards/transition/print-texture-transitions.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "单式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "shot-transitions",
    "name": "shot-transitions",
    "category": "transition",
    "summary": "镜头交棒六式——推进流白、穿暗场直航、虚焦接力、黑场字卡、whip-pan 甩镜、mask-wipe 穿窗（含纵深款），按能量落差选型",
    "use": "任何两镜衔接处（技法卡，分镜阶段排完镜头后逐个接缝选一式）",
    "duration": "n/a（技法卡；各式占用帧数见参数表，从相邻镜头预算里划）",
    "energy": "n/a（技法卡，不占能量位）",
    "tags": [],
    "path": "shot-cards/transition/shot-transitions.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "六式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "tear-streak-transitions",
    "name": "tear-streak-transitions",
    "category": "transition",
    "summary": "撕裂转场——glitch-displace 噪声撕裂（16 横条错位抖动中硬切），数字故障语义的条带级撕裂",
    "use": "高能换页：数字故障/断裂语义；页面完整性不破、能量拉满的条带级撕裂",
    "duration": "前态 ≥40f + 撕裂 17–24f + 收尾 ≥40f，约 4.5s（135–140f）",
    "energy": "高",
    "tags": [
      "effects"
    ],
    "path": "shot-cards/transition/tear-streak-transitions.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "单式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "transition-hidden-cut",
    "name": "transition-hidden-cut",
    "category": "transition",
    "summary": "藏切点转场三式——前景遮挡隐形切、对撞开屏、暖色漏光，硬切藏进遮挡/撞击/光峰的 1-3 帧里，观众看不见剪刀",
    "use": "两镜衔接处需要\"无痕换景\"或\"仪式感开屏\"时（技法卡，与 shot-transitions 六式同层选型）",
    "duration": "n/a（技法卡；各式占用帧数见参数表，从相邻镜头预算里划）",
    "energy": "n/a（技法卡，不占能量位）",
    "tags": [],
    "path": "shot-cards/transition/transition-hidden-cut.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "三式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "transition-travel",
    "name": "transition-travel",
    "category": "transition",
    "summary": "穿越式转场两式——共享元素归位、字腔穿越，镜头钻进画面里的真实元素完成换景",
    "use": "前后两镜存在\"元素/容器\"级空间关系的接缝（技法卡，与 shot-transitions 六式互补选用）",
    "duration": "n/a（技法卡；各式动作段 25–60f，前后 hold 另计，帧数从相邻镜头预算里划）",
    "energy": "n/a（技法卡，不占能量位）",
    "tags": [
      "camera"
    ],
    "path": "shot-cards/transition/transition-travel.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型表",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "white-flash-logo-simplify-cut",
    "name": "white-flash-logo-simplify-cut",
    "category": "transition",
    "summary": "彩色液态渐变字标静置流光，画面一拍冲白过曝，白底上扁平版字标淡入定格——一次闪白完成质感降维",
    "use": "品牌段落收束（华丽演绎→干净定妆）；情绪从炫技切换到正式宣告的转场拍",
    "duration": "约 3.6s（108f@30fps；静置流光 0–1.2s · 冲白 1.2–1.5s · 扁平定格 1.7–2.7s）",
    "energy": "中高（一次脉冲式重音，前后都是静场）",
    "tags": [],
    "path": "shot-cards/transition/white-flash-logo-simplify-cut.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "wipe-transitions",
    "name": "wipe-transitions",
    "category": "transition",
    "summary": "几何擦除转场两式——clock-wipe 时钟扫描（雷达指针扫一圈换页）与 blinds-slice 百叶窗切条（12 竖条错峰翻换成波）",
    "use": "新旧页都不动、一条几何边界扫过完成交接的通用转场；不依赖构图里有合适元素，哪儿都能用",
    "duration": "单式 前态 ≥20f + 擦除 32–60f + 收尾 ≥40f，约 5s（150f）",
    "energy": "中",
    "tags": [],
    "path": "shot-cards/transition/wipe-transitions.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "blur-slide",
    "name": "blur-slide",
    "category": "typography",
    "summary": "标题逐词入场，y 40→0 + blur 10→0 + opacity 0→1 三通道走同一条 outCubic 同步收敛，词间隔约 3.5f；副标题在标题收完前就错峰跟进",
    "use": "几乎所有标题/副标题成对出现的场合；产品页首屏文案、章节小标题；需要\"专业但不抢戏\"的默认文字 reveal",
    "duration": "约 3.8s（114f@30fps）",
    "energy": "低（一次性收敛，无峰值无循环）",
    "tags": [],
    "path": "shot-cards/typography/blur-slide.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "brace-expand",
    "name": "brace-expand",
    "category": "typography",
    "summary": "一对花括号先小字号出现在正中，随即带过冲向左右滑到 ±148px 并放大到标题级，文字 clip 宽度严格绑括号间距、像被拉开幕布般揭示，落定后字距再细微松弛",
    "use": "开发者/技术产品的标题字卡；章节开场；需要\"一个符号完成揭示\"的极简一拍",
    "duration": "约 3.8s（114f@30fps：7f 出现 → 弹开 → 落定后字距松弛 → hold）",
    "energy": "中（单次过冲是唯一峰值，其余静止）",
    "tags": [],
    "path": "shot-cards/typography/brace-expand.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "cel-flash-stomp",
    "name": "cel-flash-stomp",
    "category": "typography",
    "summary": "底色闪砸字——大词逐拍像图章歪着砸满屏，每词落定瞬间背景层在两个纯色间频闪数帧而文字纹丝不动；动漫必杀技字卡的 UI 翻译",
    "use": "口号/三连词的高能段落（\"SHIP / FASTER / TODAY\"式）；文字节奏卡，与 type-rhythm-sync 互补（那是字属性动，这是字砸+底闪）",
    "duration": "每词 ~30f × 词数 + 收尾 ≥45f；三词约 4.8s",
    "energy": "高",
    "tags": [
      "rhythm"
    ],
    "path": "shot-cards/typography/cel-flash-stomp.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "countdown-arc-scatter",
    "name": "countdown-arc-scatter",
    "category": "typography",
    "summary": "白底表盘 9 个等大数字沿大弧切向排布，整盘扫过 96° 后减速急停，\"5\" 停在弧顶随即平移落位成标题首字符，其余数字带 blur 原地散去，标题逐词模糊淡入、末词转强调色",
    "use": "倒计时/时长承诺类文案（\"5 min to install\"）；数据揭晓的一拍；需要\"仪表盘\"语汇的浅底短镜",
    "duration": "约 1.1s（33f@30fps，极短单拍）",
    "energy": "高（96° 大幅扫动压进 17 帧，纯冲击）",
    "tags": [],
    "path": "shot-cards/typography/countdown-arc-scatter.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "document-typewriter-reveal",
    "name": "document-typewriter-reveal",
    "category": "typography",
    "summary": "整页真排版文档在光标后自己\"写\"出来、侧栏跟进、历史条目逐个落入轨道",
    "use": "文档/报告/笔记类功能镜头；信息密度最高的一拍",
    "duration": "约 3.7s（110f，含 history-list-stack 尾段）",
    "energy": "低中（信息密度最高，节奏放稳让观众读字）",
    "tags": [
      "ui-entrance"
    ],
    "path": "shot-cards/typography/document-typewriter-reveal.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "声音",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "flying-words",
    "name": "flying-words",
    "category": "typography",
    "summary": "22 个关键词按黄金角铺在扁椭圆截面上，沿 z 轴从 -1750px 飞到相机前 800px 擦身而过，透明度走 [0,1,0.5,0.2,0] 生命曲线，跑满 2 整圈首尾无缝",
    "use": "关键词云/能力清单的动态背景；片头片尾的\"信息量\"垫底层；需要纵深穿越感的转场",
    "duration": "约 6.0s（180f@30fps，2 个完整循环，可无缝接续）",
    "energy": "高（全屏持续 3D 位移，画面无一刻静止）",
    "tags": [],
    "path": "shot-cards/typography/flying-words.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "glitch-cycle",
    "name": "glitch-cycle",
    "category": "typography",
    "summary": "同一行等宽槽位循环轮播 4 条状态短语，每条头尾按概率关键帧 [1,0,0,0.1,0,0,1] 全乱码、中段偶发单字抖动，切换瞬间叠 RGB 分离与整行位移；末条概率收 0 保证收尾干净",
    "use": "加载/构建/部署过程的状态播报；技术型片头的\"系统自述\"；需要机器口吻推进时间的一段垫底",
    "duration": "约 5.6s（168f@30fps，4 条短语各 42f）",
    "energy": "中高（持续的高频噪声脉冲，切换点是峰值）",
    "tags": [],
    "path": "shot-cards/typography/glitch-cycle.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "gradient-word-sweep",
    "name": "gradient-word-sweep",
    "category": "typography",
    "summary": "黑底标语里关键词被渐变彩光从左到右快速扫过\"充能\"——波前字符辉光最强向后衰减，填满后字符间勾连细紫红闪电、整词稳态泛光呼吸",
    "use": "标语里给单个动词/卖点词充能（Supercharged/faster/AI…）；能量高潮段的文字戏；黑场品牌片的口号帧",
    "duration": "扫充 ~15–20f（要快）+ 稳态闪电呼吸 1–2s；全段 2.5–3.5s",
    "energy": "高（一词爆点，前后都该让位）",
    "tags": [
      "effects"
    ],
    "path": "shot-cards/typography/gradient-word-sweep.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "marker-underline-title",
    "name": "marker-underline-title",
    "category": "typography",
    "summary": "大标题落定后，关键词下方马克笔下划线从左到右快速描画——变宽笔形、毛糙边缘、微上斜跟随斜体字势，贴着字底",
    "use": "标题里强调单个关键词（new/free/AI…）；手写感/人味的品牌调性；正文标注式强调",
    "duration": "标题落定 +4~8f 后起笔，划线 8–12f，总 1–1.5s",
    "energy": "低（一笔点睛，不抢标题的戏）",
    "tags": [],
    "path": "shot-cards/typography/marker-underline-title.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "outline-word-fill",
    "name": "outline-word-fill",
    "category": "typography",
    "summary": "空心词（1px 灰描边、500 字重）从 3.2 倍急缓收缩落位，虚线大圆随后从 2.8 倍收到字周围并缓慢自转，左右水平虚线从画框边缘内伸；描边先微微增亮，实心白在 0.6 帧内瞬间点亮，一闪辉光即定格",
    "use": "单词式利益点/口号的重锤一拍；节奏卡点上的\"钉子\"镜；深底品牌片的强调帧",
    "duration": "约 2.5s（75f@30fps，短促单拍）",
    "energy": "高（3.2 倍收缩 + 瞬时点亮，短时高冲击）",
    "tags": [],
    "path": "shot-cards/typography/outline-word-fill.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "paper-title-card",
    "name": "paper-title-card",
    "category": "typography",
    "summary": "一句话逐词压印上纸、一个词标强调色斜体、短划线收束",
    "use": "章节转场/价值主张字卡；重要功能出场前的引导卡；全片呼吸位",
    "duration": "1.7–1.8s（50–55f）",
    "energy": "低（呼吸位，隔开两段高能镜头）",
    "tags": [
      "transition",
      "rhythm"
    ],
    "path": "shot-cards/typography/paper-title-card.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "声音",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "pill-chip-slot-cycle-handled",
    "name": "pill-chip-slot-cycle-handled",
    "category": "typography",
    "summary": "白底句式 \"Your `chip` Handled\" 里深色胶囊内词竖向滚轮轮换，胶囊宽度按预量文本宽插值平滑伸缩、两侧文字被自然挤开收拢，胶囊上下露出 13% 透明度的灰色幽灵项",
    "use": "\"我们替你搞定 ___\" 这类句式卖点；SaaS 功能列举的一句话收口；浅底品牌片主视觉一拍",
    "duration": "约 5.0s（150f@30fps：静置 → 3 次切换（0.25/0.47/0.69）→ 尾部静置）",
    "energy": "中（三拍稳定节拍，宽度伸缩是唯一的连续运动）",
    "tags": [],
    "path": "shot-cards/typography/pill-chip-slot-cycle-handled.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "pill-slot-cycle",
    "name": "pill-slot-cycle",
    "category": "typography",
    "summary": "句中词槽轮换——固定句干钉死不动，句尾 pill 徽章每 ~0.7s 老虎机滚一格（旧的上飞加速淡出、新的从下带模糊滑入），连换 N 个功能词后落成完整句子收束",
    "use": "\"功能列举\"类文案的最优雅解法（比逐条列表快、比乱码解码有语义）；一句话卖点 + 多个动词短语的段落",
    "duration": "入场 12f + 每拍 21f × 词数 + 收束 14f + hold；6 词约 5.8s（demo 175f）",
    "energy": "中（稳定节拍器，无峰值）",
    "tags": [],
    "path": "shot-cards/typography/pill-slot-cycle.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "scramble",
    "name": "scramble",
    "category": "typography",
    "summary": "等宽整行字符先每 2 帧高速跳乱码，再从左到右逐个锁定为真字，锁定瞬间蓝白高光闪一下——种子驱动可复现的解密感",
    "use": "技术型开场标题；版本号/代号揭晓；\"系统就绪\"\"数据解锁\"这类带机器口吻的一拍",
    "duration": "约 3.2s（96f@30fps）",
    "energy": "中高（持续高频跳字的视觉噪声，无单点冲击）",
    "tags": [],
    "path": "shot-cards/typography/scramble.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "split-flap-title",
    "name": "split-flap-title",
    "category": "typography",
    "summary": "机场翻牌屏字标题——每字符上下两半机械翻牌格，翻过 2 个乱码咔哒停在目标字，左→右级联成波",
    "use": "开场/章节大标题；倒计时、发布日期、数据播报类文案；需要\"机械宣告感\"的一拍",
    "duration": "约 4.7s（140f：≥20f 乱码静止建立 + 级联翻牌 + ≥15f 停定静止）",
    "energy": "中（持续的机械动感，非瞬时冲击）",
    "tags": [
      "opening"
    ],
    "path": "shot-cards/typography/split-flap-title.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "text-column-converge",
    "name": "text-column-converge",
    "category": "typography",
    "summary": "双词对峙合拢——左\"NEW\"右特性词钉死在等屏边距两侧硬切轮换、全程零收缩，换到最后一词才唯一一次 ease-in-out 滑到居中咬合成短语，下方小字近乎硬切浮现；收尾揭晓型文字卡",
    "use": "特性清单收束到产品名/口号的段落（\"NEW × 一串特性 → NEW <产品名>\"式）；发布会式 recap、版本号揭晓",
    "duration": "轮换 7–16f/词 × 8–9 词 + 合拢 ~36f + 小字后静置；全段约 5–6s",
    "energy": "中低（机器节奏、小字规格清单气质，不是砸字）",
    "tags": [
      "outro"
    ],
    "path": "shot-cards/typography/text-column-converge.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "title-demote-to-label",
    "name": "title-demote-to-label",
    "category": "typography",
    "summary": "大标题降格为节标签两式——A 大标题居中显影站稳一拍后连续缩小 0.3x 平移到左上角落成小节标签、内容区在其下生长；B 同套路但登场时带文本选中态高亮块扫入再撤掉",
    "use": "章节开场（标题先当主角再让位给内容）；教程/功能演示片的小节交接；B 式给\"文字/编辑\"类产品加身份暗示",
    "duration": "A ~3s（92f）/ B ~3.5s（104f）；demo 两式串播 196f",
    "energy": "低中（版式变换型，氛围镜头）",
    "tags": [
      "transition"
    ],
    "path": "shot-cards/typography/title-demote-to-label.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "type-assembly-moves",
    "name": "type-assembly-moves",
    "category": "typography",
    "summary": "文字集结四式——split-text-stagger 逐字裂升、letterform-drift-assembly 漂移合拢、tracking-expand-reveal 字距呼吸、text-on-path 沿线流入",
    "use": "大标题/标语的入场；与 type-entrance-moves 两式、split-flap-title、document-typewriter-reveal 同属标题入场大品类，全片 ≤2 种",
    "duration": "单式 4–5s（动作段 A ~56f / B ~104f / C ~58f / D ~99f，均含 hold）",
    "energy": "A 中 / B 中高 / C 低中 / D 中",
    "tags": [],
    "path": "shot-cards/typography/type-assembly-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "四式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "type-entrance-moves",
    "name": "type-entrance-moves",
    "category": "typography",
    "summary": "标题文字入场两式——scramble-decode 乱码解码（噪声里长出答案）与 letter-drop-physics 字符坠落（重力砸落弹跳归位），按调性二选一",
    "use": "大标题/章节字卡的入场；与 split-flap-title（机械翻牌）、document-typewriter-reveal（打字机）同品类互斥选用",
    "duration": "单式 4–5s（含 hold 与静止收尾；动作段 A ~66f / B ~106f）",
    "energy": "中高（A 偏理性推进，B 偏物理趣味）",
    "tags": [],
    "path": "shot-cards/typography/type-entrance-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "type-rhythm-sync",
    "name": "type-rhythm-sync",
    "category": "typography",
    "summary": "文字随声同步两式——font-weight-pump 字重脉冲（笔画随鼓点变粗弹回）与 karaoke-fill-sync 卡拉OK填色（词随旁白逐个点亮）",
    "use": "标题/标语与音轨强绑定的段落；A 绑节拍（鼓点），B 绑语音（旁白逐词）",
    "duration": "单式 4–5s；A 每拍占 10f 衰减窗、B 每词按语速 15–35f",
    "energy": "A 高（蹦迪感）/ B 中（跟读引导）",
    "tags": [
      "rhythm"
    ],
    "path": "shot-cards/typography/type-rhythm-sync.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "typewriter-moves",
    "name": "typewriter-moves",
    "category": "typography",
    "summary": "打字机两式——terminal-typewriter 终端命令敲完即引爆场景切换、error-retype 误删重打的\"改口\"三幕剧",
    "use": "开发者产品开场（A）、slogan/卖点字卡（B）；文字自带时间性的入场",
    "duration": "A ~5s / B ~5.5s",
    "energy": "A 中高 / B 中低",
    "tags": [
      "opening"
    ],
    "path": "shot-cards/typography/typewriter-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "typing-code-block",
    "name": "typing-code-block",
    "category": "typography",
    "summary": "同一段语法高亮代码左右并置两种 reveal——左侧行级 stagger 4f 淡入上浮 8px，右侧逐字符打字但字符保持原 token 色，当前字符垫一块 #3a4468 方块光标",
    "use": "代码/配置揭示镜头；开发者产品的\"就三行\"演示；需要对比两种揭示节奏时的选型参考镜",
    "duration": "约 4.6s（138f@30fps）",
    "energy": "中（右侧持续打字推进，左侧一次性收敛）",
    "tags": [],
    "path": "shot-cards/typography/typing-code-block.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "vertical-word-roll-blur-cycle",
    "name": "vertical-word-roll-blur-cycle",
    "category": "typography",
    "summary": "句尾词换成竖向滚轮，3 次换词各 0.55s（outQuint 七成 + outBack 三成，前快后极慢带微过冲），相邻行按距离上垂直 blur 与灰度，中心词落定瞬间从灰染成强调色",
    "use": "\"Built for ___\" 这类句干 + 受众/对象列举的一句话卖点；浅底品牌片的干净一拍",
    "duration": "约 5.0s（150f@30fps：静置 → 3 次换词 → 尾部整组淡出）",
    "energy": "中（稳定三拍，无峰值）",
    "tags": [],
    "path": "shot-cards/typography/vertical-word-roll-blur-cycle.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "word-relay-filmstrip",
    "name": "word-relay-filmstrip",
    "category": "typography",
    "summary": "左列黑白相间等高页面卡步进滚动、右侧衬线大词原位接力（名词恒定+动词轮换）——切词瞬间才滚动一格，词块垂直中心与当前页面卡中点精确对齐",
    "use": "\"一个主体 × 多种能力\"的枚举段（Computer researches/builds/codes…）；作品集/案例流展示；产品多场景巡礼",
    "duration": "每词期 ~1.5–2s × 3–4 词；全段 5–7s",
    "energy": "中低（编辑部气质，节奏靠切词的\"咔哒\"感）",
    "tags": [
      "ui-entrance"
    ],
    "path": "shot-cards/typography/word-relay-filmstrip.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "word-relay-geometry",
    "name": "word-relay-geometry",
    "category": "typography",
    "summary": "三个利益词各带一套专属几何接力——虚线大圆自转收缩 → 三实线圆 trim 依次生长（相位差 0.06）→ 金属 sheen 扫过后一拍收成纯白；旧词缩到 0.86 淡出，新词描边→填充揭示",
    "use": "三点式利益陈述（更快/更好/更强）；品牌价值观段落；需要\"一词一世界\"的中段推进",
    "duration": "约 6.0s（180f@30fps：三段各 0.36 时长窗，段间重叠 0.04）",
    "energy": "中高（三拍推进 + 全程几何运动 + 背景粒子，无静止帧）",
    "tags": [],
    "path": "shot-cards/typography/word-relay-geometry.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "avatar-bracket-carousel",
    "name": "avatar-bracket-carousel",
    "category": "ui-entrance",
    "summary": "\"Your ___ teammates\" 填空排版，四角对焦框钉在句中不动，头像队列在框内垂直 spring 轮换三次，入框放大清晰、出框按距离缩小淡化模糊，角色标签同步更换，切换瞬间对焦框呼吸 7%",
    "use": "\"一个位置，多种角色\"的能力枚举；团队/身份/预设/人格类产品的核心一句话镜头",
    "duration": "约 5.2s（156f@30fps）",
    "energy": "中（三次等距切换构成稳定节拍器，对焦框脉冲是唯一装饰性动作）",
    "tags": [],
    "path": "shot-cards/ui-entrance/avatar-bracket-carousel.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "bezier-source-converge-merge",
    "name": "bezier-source-converge-merge",
    "category": "ui-entrance",
    "summary": "左侧四个来源节点各有一条细贝塞尔曲线连向右侧同一汇聚点，曲线先错峰由左向右 draw-on，节点沿自己的曲线滑向汇聚点并三段式加速缩小到消失，强调色数据包全程沿路径滑行，吞并完成后曲线从左端反向擦除只留圆形徽标",
    "use": "\"多源整合/统一接入/数据汇聚\"的核心机制镜头；集成、聚合、单一入口类产品的说明段落",
    "duration": "约 5.6s（168f@30fps）",
    "energy": "中（长镜慢速推进，靠数据包滑行维持活性；吞并瞬间是唯一小高点）",
    "tags": [],
    "path": "shot-cards/ui-entrance/bezier-source-converge-merge.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "card-stack",
    "name": "card-stack",
    "category": "ui-entrance",
    "summary": "8 张卡从屏幕下方逐张 spring 弹入叠成一摞，全员落位后整摞一次性展成 3D 扇面——每张按序号偏转 8°、横移 34px、向后退一层 z",
    "use": "需要交代\"我们有一组东西\"的产品段落；卡片墙/模板库/方案列表的建立镜头，也能当 logo 前的一拍蓄势",
    "duration": "约 4.2s（126f@30fps）",
    "energy": "中高（入场是连续小爆发，展开段收成一次平滑的整体动作）",
    "tags": [],
    "path": "shot-cards/ui-entrance/card-stack.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "carousel-3d",
    "name": "carousel-3d",
    "category": "ui-entrance",
    "summary": "8 张卡按 sin/cos 排成半径 190px 的圆环并匀速整环自转一圈，每卡只绕 Y 公转、自身 billboard 朝外，正反两层同向贴图配 backface-visibility:hidden 保证任何时刻都正立不倒置，相机全程钉在浅俯角近景",
    "use": "作品集/模板库/集成清单的循环展示；需要无缝 loop 的背景拍或落地页 hero",
    "duration": "约 5.6s（168f@30fps）",
    "energy": "中（匀速无变化，是可无限循环的稳态运动）",
    "tags": [],
    "path": "shot-cards/ui-entrance/carousel-3d.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "cloner-depth-echo",
    "name": "cloner-depth-echo",
    "category": "ui-entrance",
    "summary": "克隆纵队——主卡瞬间\"复印\"出 7 个半透明分身沿斜向纵深排开成队，停一拍后全体加速吸回本体合一+弹跳",
    "use": "\"多副本/多租户/规模感/批量处理\"卖点；一镜讲完\"一个=很多\"",
    "duration": "4–5s",
    "energy": "中（陈列-收束型）",
    "tags": [],
    "path": "shot-cards/ui-entrance/cloner-depth-echo.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "deck-deal-flyin",
    "name": "deck-deal-flyin",
    "category": "ui-entrance",
    "summary": "暗场金属背景里的实体牌堆特写环绕开局，拉远交给页面后一摞卡像发牌一样硬加速甩进网格，相机追着滚动、满板停半秒",
    "use": "展示\"内容量大/源源不断汇入\"的列表页与卡片墙；建立信息密度的第一印象",
    "duration": "约 2.6s 发牌段（36–113f），前接约 2s（62f）牌堆特写可选",
    "energy": "高（节奏爬升段主力，不放开场第一镜）",
    "tags": [],
    "path": "shot-cards/ui-entrance/deck-deal-flyin.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "声音",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "doc-park-left-pill-deal",
    "name": "doc-park-left-pill-deal",
    "category": "ui-entrance",
    "summary": "文档不淡出而是向左滑出只露约 35% 宽并微缩到 0.92，右侧按旁白节奏慢速发牌三张白底描边药丸（outBack 弹入），每张落定后其下方字幕逐词加深、下一张到来前整句淡出，左侧文档全程极缓慢自动滚动保持\"正在被读\"",
    "use": "旁白驱动的\"分析结论逐条给出\"段落；文档理解、推荐理由、审阅意见类产品的核心说明镜头",
    "duration": "约 5.8s（174f@30fps）",
    "energy": "低（慢发牌节奏，全片无峰值；靠自动滚动维持活性）",
    "tags": [],
    "path": "shot-cards/ui-entrance/doc-park-left-pill-deal.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "draw-svg-trace",
    "name": "draw-svg-trace",
    "category": "ui-entrance",
    "summary": "描边生长圈注——一条带笔头的墨线沿元素轮廓跑一圈把它\"画\"出来，闭合瞬间闪黑交棒、内容淡入；同套路可给标题画下划线",
    "use": "单个卡片/图表/标题的被点名入场；元素级手法（整页级蓝图描线归 wall-reveal-moves C 式）",
    "duration": "描边 40f + 闪黑交棒 16f + hold ≥35f，约 3–4s",
    "energy": "中",
    "tags": [
      "typography"
    ],
    "path": "shot-cards/ui-entrance/draw-svg-trace.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "element-body-moves",
    "name": "element-body-moves",
    "category": "ui-entrance",
    "summary": "元素身体感两式——axial-stretch 轴向拉伸糖稀拉丝、contact-shadow-lift 接触阴影离面抬升",
    "use": "给\"位置在变\"之外补\"身体在变\"：高速飞入给速度肉身（A）、卡片点名给悬浮证据（B）；A 配横冲入场，B 配 2.5D 运镜与逐张点名",
    "duration": "A ~4.7s / B ~5.3s",
    "energy": "A 中高 / B 低中",
    "tags": [],
    "path": "shot-cards/ui-entrance/element-body-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "floating-glossy-label-pills",
    "name": "floating-glossy-label-pills",
    "category": "ui-entrance",
    "summary": "四块浅灰 dashboard wireframe 面板各顶一枚高光胶囊标签横向排队，轨道三拍向右换位（缓起→中段冲→缓收，首拍更慢带长尾），居中者放大清晰、两侧缩到 0.62 并下沉变淡微模糊形成走廊感，末段黑色描白边光标从右上斜滑到末位胶囊右端静止",
    "use": "多功能横向枚举（Feature A–D 各一屏）；产品概览、功能巡览类段落，也可作落地页 hero 的循环底",
    "duration": "约 4.0s（120f@30fps）",
    "energy": "中（三拍换位构成节拍，无爆点；光标是收尾的注意力交接）",
    "tags": [],
    "path": "shot-cards/ui-entrance/floating-glossy-label-pills.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "integration-hub-map",
    "name": "integration-hub-map",
    "category": "ui-entrance",
    "summary": "旧页面一次性快翻 180°（侧棱瞬间亮闪）落成新中枢页，五个集成 app 图标同帧弹现、随即五条彩虹光管同帧齐连，光管内输送脉冲持续流动——\"翻开新一页，生态一齐接入\"",
    "use": "集成/生态能力段（一个产品连一切）；版本翻新叙事（旧页翻成新页）；暗场霓虹调性的功能高潮",
    "duration": "前摇 ~0.5s + 快翻 ~1.2s + 图标齐现 → 光管齐连两拍 ~0.7s + 输送呼吸 ≥1.5s；全段 4.5–5s",
    "energy": "中高（翻面是爆点，输送段是余韵）",
    "tags": [
      "effects"
    ],
    "path": "shot-cards/ui-entrance/integration-hub-map.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "list-reveal",
    "name": "list-reveal",
    "category": "ui-entrance",
    "summary": "垂直菜单 6 项按 0.09 的间隔依次 scale 找位、outBack 轻微过冲落定，同时整个列表容器全程线性上移 32px——逐项入场与整体漂移是两层不相干的运动",
    "use": "导航/侧边栏/设置面板的入场；任何\"界面自己长出来\"的 UI 段落，也适合做旁白铺垫时的低能量底",
    "duration": "约 3.6s（108f@30fps）",
    "energy": "低（稳定节拍，无峰值；靠漂移维持画面不死）",
    "tags": [],
    "path": "shot-cards/ui-entrance/list-reveal.md",
    "curated": true,
    "ported": true,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "list-stack-press",
    "name": "list-stack-press",
    "category": "ui-entrance",
    "summary": "列表卡从画面底部逐张飞上摞起，每张落地压弹整摞、计数器同步跳一格",
    "use": "feed/雷达/收件箱类\"每天有新东西\"的镜头；强调持续积累的资产列表",
    "duration": "约 3s（18–88f）",
    "energy": "中",
    "tags": [],
    "path": "shot-cards/ui-entrance/list-stack-press.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "声音",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "morph-from-primitive",
    "name": "morph-from-primitive",
    "category": "ui-entrance",
    "summary": "原型变形——正圆呼吸一拍（anticipation）后 SVG path 插值 24f 长成圆角卡轮廓，内容淡入",
    "use": "图形/图标/卡轮廓类主体的入场；logo→UI 容器的经典原语",
    "duration": "~4.7s（呼吸 20f + 变形 24f + 内容淡入 12f）",
    "energy": "中低",
    "tags": [
      "opening"
    ],
    "path": "shot-cards/ui-entrance/morph-from-primitive.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "neon-frame-forerun",
    "name": "neon-frame-forerun",
    "category": "ui-entrance",
    "summary": "强透视直角霓虹框自左缘两头奔画先行成型，页面在框内由暗转亮，同时框内组件/文字从 3D 上空带同形软影错峰贴落、随页面点亮同步完成贴合，背景霓虹管群终段熄灭让位",
    "use": "暗场品牌片里给 UI 面板做\"登场仪式\"（框先到、内容后落）；功能区首次亮相；霓虹/赛博调性的段落开场",
    "duration": "框奔画 ~0.6s + 点亮&贴落 ~2s + 背景熄灭收束 ~0.8s；全段 4–4.5s",
    "energy": "中高（三层动作叠进，但都服务同一次登场）",
    "tags": [
      "effects"
    ],
    "path": "shot-cards/ui-entrance/neon-frame-forerun.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "neon-frame-orbit-drop",
    "name": "neon-frame-orbit-drop",
    "category": "ui-entrance",
    "summary": "霓虹框先行描框后，镜头绕页面左→右弧线旋转，页面全部组件/文字**同帧**从空中往下贴合（同形软影同步收敛）——整体登场式的框内安放",
    "use": "单页 UI 的一次性隆重登场（与巡礼/逐区亮相相对）；暗场霓虹调性段落的主视觉揭幕；neon-frame-forerun 的姊妹镜",
    "duration": "描框 ~0.5s + 旋转&同时贴落 ~2.5s + 落定 ~1s；全段 4–4.5s",
    "energy": "中高（一次性的大动作，落定即静）",
    "tags": [
      "effects",
      "camera"
    ],
    "path": "shot-cards/ui-entrance/neon-frame-orbit-drop.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "page-waterfall-wall",
    "name": "page-waterfall-wall",
    "category": "ui-entrance",
    "summary": "页面瀑布墙——真实页面截图切成 3–4 列在 3D 后仰墙面上差速反向无限滚动，视差 + 镜头缓推做\"内容多到流不完\"的一览",
    "use": "\"多页面/多功能/多模板\"体量感段落；montage 中段铺陈或 intro 后的产品广度镜头",
    "duration": "4–6s（无限循环体，时长由段落需要裁）",
    "energy": "中（流动陈列型）",
    "tags": [],
    "path": "shot-cards/ui-entrance/page-waterfall-wall.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "paper-craft-moves",
    "name": "paper-craft-moves",
    "category": "ui-entrance",
    "summary": "纸艺两式——masking-tape-slap 纸胶带拍定（悬浮微晃被\"啪啪\"按死）与 popup-book-rise 立体书立起（卡片沿底边错峰立墙）",
    "use": "纸墨主视觉片的实体材料语言：单卡定妆入场用 A、整版 dashboard 开场建立用 B；与纸墨+强调色的主视觉（模板片为纸/墨/琥珀）天然同源",
    "duration": "A 3–4s / B 4–5.5s",
    "energy": "A 中（两拍打击）/ B 中高（立墙有纵深冲击）",
    "tags": [],
    "path": "shot-cards/ui-entrance/paper-craft-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "两式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "product-card-progressive-assemble",
    "name": "product-card-progressive-assemble",
    "category": "ui-entrance",
    "summary": "详情卡像被逐字段抓取般自建——图→标题→breadcrumb pill 依次 pop→原价出现后被划线降级、强调色新价 spring 跳出→正文逐行揭示且高亮块由左向右刷过→色卡点亮，整卡全程极慢 scale 前推",
    "use": "商品/条目详情页的能力展示；\"结构化抽取\"\"自动填充\"\"数据自己长出来\"类叙事的主镜头",
    "duration": "约 5.0s（150f@30fps）",
    "energy": "中（连续小事件密集排布，无单点爆发；靠前推保持推进感）",
    "tags": [],
    "path": "shot-cards/ui-entrance/product-card-progressive-assemble.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "radial-wave",
    "name": "radial-wave",
    "category": "ui-entrance",
    "summary": "17×9 圆点阵列按到波源的欧氏距离错峰点亮，每点 scale 过冲到 1.5 再落回常亮，第一道波扫完后第二道亮蓝脉冲从外圈反向收拢回中心",
    "use": "产品/品牌开场的\"系统上电\"一拍；也用作数据网格、节点地图、覆盖范围类叙事的建立镜头",
    "duration": "约 3.8s（114f@30fps）",
    "energy": "中高（起手爆发一次，波前过后转为常亮低能量底子）",
    "tags": [],
    "path": "shot-cards/ui-entrance/radial-wave.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "research-card-stack-scroll",
    "name": "research-card-stack-scroll",
    "category": "ui-entrance",
    "summary": "深色论文卡每 12 帧一张沿右下轴线飞入中心叠压，落位带 1 帧压缩，只有最上一张全清晰渲染标题+作者+摘要，下方卡按堆积深度递增模糊变暗只露标题条，背景横向 grid 同步下移做速度参照",
    "use": "\"读了大量资料/处理了海量文档\"的量级交代；研究类、检索类、批处理类产品的能力镜头",
    "duration": "约 4.8s（144f@30fps）",
    "energy": "中高（匀速高频，无爆发但持续压迫）",
    "tags": [],
    "path": "shot-cards/ui-entrance/research-card-stack-scroll.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "row-embed",
    "name": "row-embed",
    "category": "ui-entrance",
    "summary": "内容行像卡片一样从空中降下、rotateX 收平、嵌入瞬间底边亮一道强调色的缝",
    "use": "\"结构化数据长进页面\"的详情页/列表镜头；行级内容的批量入场",
    "duration": "约 2s（12–68f）",
    "energy": "中",
    "tags": [],
    "path": "shot-cards/ui-entrance/row-embed.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "声音",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "runway-ground-skim",
    "name": "runway-ground-skim",
    "category": "ui-entrance",
    "summary": "低角度掠地机位下 UI 卡片群从空中一阵急雨式快速贴落（起点微错、下落大量重叠并行、着地即停零回弹），落齐后整页立起、视角转正收尾",
    "use": "仪表盘/卡片流界面的登场（内容\"从天而降完成自己\"）；低角度炫技段后的收正；clickup 系悬空贴落语言的\"齐落\"重型版",
    "duration": "悬空展示 ~0.4s + 贴落 ~1.2s + 立起转正 ~1.8s；全段 4s",
    "energy": "高（掉落感是戏眼，立起转正是收束）",
    "tags": [
      "camera"
    ],
    "path": "shot-cards/ui-entrance/runway-ground-skim.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "skeleton-reveal",
    "name": "skeleton-reveal",
    "category": "ui-entrance",
    "summary": "草稿→骨架→内容三级显影——手绘涂鸦占位（煮沸抖动）一拍被灰条骨架窗口替换，骨架列表滚入后镜头推近、灰条逐行显影成头像+逐词文字，末词晚半拍落地",
    "use": "产品 UI 的\"从无到有\"登场叙事；开场后第一次亮产品界面的段落",
    "duration": "~5.7s（172f：涂鸦 1s + 换真 0.3s + 骨架滚入 1.2s + 推近显影 3s）",
    "energy": "中（叙事型登场，重点是\"变成真的\"那两次跃迁）",
    "tags": [],
    "path": "shot-cards/ui-entrance/skeleton-reveal.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "svg-shape-morph",
    "name": "svg-shape-morph",
    "category": "ui-entrance",
    "summary": "一条 140 点闭合轮廓平滑变形为另一条再变回，两形状先在极坐标下重采样到相同点数、逐点半径插值 + inOutCubic，变形中段叠轻微 scale 呼吸、缓慢自转与色相从 185° 漂到 305°",
    "use": "抽象概念的\"形态转换/自适应/有机生长\"表达；开场 logo 前的氛围一拍，或章节之间的过渡形",
    "duration": "约 5.2s（156f@30fps）",
    "energy": "低（无爆点的连续流动，适合当旁白底或呼吸拍）",
    "tags": [],
    "path": "shot-cards/ui-entrance/svg-shape-morph.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "value-stagger-gradient",
    "name": "value-stagger-gradient",
    "category": "ui-entrance",
    "summary": "16 根柱入场时 delay 是时间错峰，同时高度/色相/位移/模糊四个属性各自铺成从首到末的数值梯度；第二拍把错峰原点换成中心，脉冲幅度以中心为最大重新铺开",
    "use": "技法演示与参数化能力的展示镜头；也可直接当数据/频谱/均衡器类界面的入场",
    "duration": "约 5.0s（150f@30fps）",
    "energy": "中高（第一拍是连续铺开，第二拍中心脉冲是明确的一次峰值）",
    "tags": [],
    "path": "shot-cards/ui-entrance/value-stagger-gradient.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "动效核心",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  },
  {
    "id": "wall-reveal-moves",
    "name": "wall-reveal-moves",
    "category": "ui-entrance",
    "summary": "整墙批量入场三式——bento 逐格点亮、网格波浪翻面、蓝图描线成形，全部原位显形不位移，与 deck-deal-flyin 的飞入位移型互补成品类矩阵",
    "use": "功能墙/卡片墙/整页界面的整体亮相；内容已在原位、要\"显形\"而非\"涌入\"的段落",
    "duration": "单式约 4.3–5s（A 150f / B 130f / C 150f @30fps，含建立 hold 与静止收尾）",
    "energy": "中",
    "tags": [],
    "path": "shot-cards/ui-entrance/wall-reveal-moves.md",
    "curated": false,
    "ported": false,
    "sections": [
      "意图",
      "三式选型",
      "参数表",
      "已知坑",
      "参考实现"
    ]
  }
];

export const SHOT_CATEGORIES: ShotCategoryMeta[] = [
  {
    "id": "opening",
    "zh": "开场与品牌",
    "en": "Opening & Brand",
    "count": 10
  },
  {
    "id": "typography",
    "zh": "文字与字卡",
    "en": "Typography & Title Cards",
    "count": 25
  },
  {
    "id": "ui-entrance",
    "zh": "界面登场与陈列",
    "en": "UI Entrance & Showcase",
    "count": 27
  },
  {
    "id": "camera",
    "zh": "运镜与空间",
    "en": "Camera & Space",
    "count": 10
  },
  {
    "id": "data",
    "zh": "数据与指标",
    "en": "Data & Metrics",
    "count": 11
  },
  {
    "id": "interaction",
    "zh": "交互与功能演示",
    "en": "Interaction & Feature Demo",
    "count": 15
  },
  {
    "id": "transition",
    "zh": "转场",
    "en": "Transitions",
    "count": 19
  },
  {
    "id": "rhythm",
    "zh": "节奏与蒙太奇",
    "en": "Rhythm & Montage",
    "count": 11
  },
  {
    "id": "effects",
    "zh": "光效与强调",
    "en": "Light & Emphasis",
    "count": 17
  },
  {
    "id": "outro",
    "zh": "收尾",
    "en": "Outro",
    "count": 7
  }
];

export const SHOT_CARD_COUNT = 152;
