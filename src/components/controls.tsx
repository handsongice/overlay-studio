import type { ControlDef, ParamValue, Params } from "../types";
import { toString } from "../lib/motion";
import { FONT_OPTIONS } from "../appearance";

interface ControlProps {
  def: ControlDef;
  value: ParamValue;
  onChange: (key: string, value: ParamValue) => void;
}

export function Control({ def, value, onChange }: ControlProps) {
  switch (def.type) {
    case "text":
      return <TextControl def={def} value={value} onChange={onChange} />;
    case "number":
      return <NumberControl def={def} value={value} onChange={onChange} />;
    case "slider":
      return <SliderControl def={def} value={value} onChange={onChange} />;
    case "select":
      return <SelectControl def={def} value={value} onChange={onChange} />;
    case "toggle":
      return <ToggleControl def={def} value={value} onChange={onChange} />;
    default:
      return null;
  }
}

function ControlShell({
  label,
  readout,
  children,
}: {
  label: string;
  readout?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ctrl">
      <div className="ctrl-head">
        <span className="ctrl-label">{label}</span>
        {readout !== undefined && <span className="ctrl-readout">{readout}</span>}
      </div>
      {children}
    </div>
  );
}

function TextControl({ def, value, onChange }: ControlProps) {
  if (def.type !== "text") return null;
  return (
    <ControlShell label={def.label}>
      {def.multiline ? (
        <textarea
          className="textarea"
          value={toString(value)}
          placeholder={def.placeholder}
          rows={3}
          onChange={(e) => onChange(def.key, e.target.value)}
        />
      ) : (
        <input
          className="input"
          type="text"
          value={toString(value)}
          placeholder={def.placeholder}
          onChange={(e) => onChange(def.key, e.target.value)}
        />
      )}
    </ControlShell>
  );
}

function NumberControl({ def, value, onChange }: ControlProps) {
  if (def.type !== "number") return null;
  const num = typeof value === "number" ? value : Number(value) || 0;
  const step = def.step ?? 1;
  const min = def.min;
  const max = def.max;

  const clampAndSet = (n: number) => {
    let next = n;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    onChange(def.key, next);
  };

  return (
    <ControlShell
      label={def.label}
      readout={def.unit ? `${num} ${def.unit}` : undefined}
    >
      <div className="num-wrap">
        <input
          className="input"
          type="number"
          value={Number.isNaN(num) ? "" : num}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange(def.key, 0);
              return;
            }
            const n = Number(raw);
            if (Number.isFinite(n)) onChange(def.key, n);
          }}
        />
        <div className="stepper">
          <button
            type="button"
            aria-label="增加"
            onClick={() => clampAndSet(num + step)}
          >
            ▲
          </button>
          <button
            type="button"
            aria-label="减少"
            onClick={() => clampAndSet(num - step)}
          >
            ▼
          </button>
        </div>
      </div>
    </ControlShell>
  );
}

function SliderControl({ def, value, onChange }: ControlProps) {
  if (def.type !== "slider") return null;
  const num = typeof value === "number" ? value : Number(value) || 0;
  return (
    <ControlShell
      label={def.label}
      readout={def.unit ? `${num.toFixed(1)}${def.unit}` : String(num)}
    >
      <input
        className="range"
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={num}
        onChange={(e) => onChange(def.key, Number(e.target.value))}
      />
    </ControlShell>
  );
}

function SelectControl({ def, value, onChange }: ControlProps) {
  if (def.type !== "select") return null;
  return (
    <ControlShell label={def.label}>
      <select
        className="select"
        value={toString(value)}
        onChange={(e) => onChange(def.key, e.target.value)}
      >
        {def.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </ControlShell>
  );
}

function ToggleControl({ def, value, onChange }: ControlProps) {
  if (def.type !== "toggle") return null;
  const checked = value === true;
  return (
    <div className="ctrl ctrl-toggle">
      <span className="ctrl-label">{def.label}</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(def.key, e.target.checked)}
        />
        <span className="switch-track" />
      </label>
    </div>
  );
}

/** 按分组渲染全部控件 */
export function ControlPanelBody({
  defs,
  params,
  onParamChange,
  header,
}: {
  defs: ControlDef[];
  params: Params;
  onParamChange: (key: string, value: ParamValue) => void;
  /** 面板滚动区顶部的全局设置（如安全区） */
  header?: React.ReactNode;
}) {
  const groups = new Map<string, ControlDef[]>();
  for (const def of defs) {
    const list = groups.get(def.section) ?? [];
    list.push(def);
    groups.set(def.section, list);
  }

  return (
    <div className="panel-scroll">
      {header}
      {Array.from(groups.entries()).map(([section, list]) => (
        <div className="ctrl-group" key={section}>
          <div className="ctrl-group-title">{section}</div>
          {list.map((def) => (
            <Control
              key={def.key}
              def={def}
              value={params[def.key] ?? def.defaultValue}
              onChange={onParamChange}
            />
          ))}
        </div>
      ))}
      <AppearancePanel params={params} onParamChange={onParamChange} />
    </div>
  );
}

/* ---------- 外观：字体 / 文字颜色 / 背景颜色 / 强调·图表色 ---------- */

function ColorRow({
  label,
  value,
  onChange,
  onReset,
  defaultValue = "#1f1f24",
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  onReset: () => void;
  /** 未设置时色块预览用色（不影响渲染） */
  defaultValue?: string;
}) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : defaultValue;
  return (
    <div className="ctrl">
      <div className="ctrl-head">
        <span className="ctrl-label">{label}</span>
        {value ? (
          <button
            type="button"
            className="ctrl-reset"
            title="恢复默认"
            onClick={onReset}
          >
            ↺ 默认
          </button>
        ) : (
          <span className="ctrl-tag">默认</span>
        )}
      </div>
      <div className="color-row">
        <label className="color-swatch" style={{ background: hex }}>
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
        <span className="color-hex">{value ? value.toUpperCase() : "跟随主题"}</span>
      </div>
    </div>
  );
}

function AppearancePanel({
  params,
  onParamChange,
}: {
  params: Params;
  onParamChange: (key: string, value: ParamValue) => void;
}) {
  const font = String(params.__font ?? "default");
  const text = typeof params.__text === "string" ? params.__text : "";
  const bg = typeof params.__bg === "string" ? params.__bg : "";
  const accent = typeof params.__accent === "string" ? params.__accent : "";
  const opacity = Math.min(1, Math.max(0.1, Number(params.__opacity ?? 1)));
  const panel = String(params.__panel ?? "glass");
  const panelAlpha = Math.min(1, Math.max(0, Number(params.__panelOpacity ?? 0.45)));

  return (
    <div className="ctrl-group">
      <div className="ctrl-group-title">外观</div>

      <div className="ctrl">
        <div className="ctrl-head">
          <span className="ctrl-label">字体</span>
          {font !== "default" && (
            <button
              type="button"
              className="ctrl-reset"
              onClick={() => onParamChange("__font", "default")}
            >
              ↺ 默认
            </button>
          )}
        </div>
        <select
          className="select"
          value={font}
          onChange={(e) => onParamChange("__font", e.target.value)}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <ColorRow
        label="文字颜色"
        value={text}
        onChange={(v) => onParamChange("__text", v)}
        onReset={() => onParamChange("__text", "")}
      />
      <ColorRow
        label="背景颜色"
        value={bg}
        onChange={(v) => onParamChange("__bg", v)}
        onReset={() => onParamChange("__bg", "")}
      />
      <ColorRow
        label="强调 / 图表色"
        value={accent}
        onChange={(v) => onParamChange("__accent", v)}
        onReset={() => onParamChange("__accent", "")}
      />

      <div className="ctrl">
        <div className="ctrl-head">
          <span className="ctrl-label">不透明度</span>
          <div className="ctrl-head-right">
            {opacity !== 1 && (
              <button
                type="button"
                className="ctrl-reset"
                onClick={() => onParamChange("__opacity", 1)}
              >
                ↺ 默认
              </button>
            )}
            <span className="ctrl-readout">{Math.round(opacity * 100)}%</span>
          </div>
        </div>
        <input
          className="range"
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => onParamChange("__opacity", Number(e.target.value))}
        />
        <div className="ctrl-hint">整体透明度，视频叠加时可调低避免遮挡</div>
      </div>

      <div className="ctrl">
        <div className="ctrl-head">
          <span className="ctrl-label">面板底</span>
          {panel !== "glass" && (
            <button
              type="button"
              className="ctrl-reset"
              onClick={() => onParamChange("__panel", "glass")}
            >
              ↺ 默认
            </button>
          )}
        </div>
        <select
          className="select"
          value={panel}
          onChange={(e) => onParamChange("__panel", e.target.value)}
        >
          <option value="glass">玻璃底（深色半透明）</option>
          <option value="none">纯透明（无底衬）</option>
        </select>
        <div className="ctrl-hint">给图表/卡片加一层深色底衬，叠加到亮色视频上更清晰</div>
      </div>

      <div className="ctrl">
        <div className="ctrl-head">
          <span className="ctrl-label">面板底透明度</span>
          <div className="ctrl-head-right">
            {panelAlpha !== 0.45 && (
              <button
                type="button"
                className="ctrl-reset"
                onClick={() => onParamChange("__panelOpacity", 0.45)}
              >
                ↺ 默认
              </button>
            )}
            <span className="ctrl-readout">{Math.round(panelAlpha * 100)}%</span>
          </div>
        </div>
        <input
          className="range"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={panelAlpha}
          disabled={panel === "none"}
          onChange={(e) => onParamChange("__panelOpacity", Number(e.target.value))}
        />
      </div>
    </div>
  );
}
