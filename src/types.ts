import type { ComponentType } from "react";
import type { CategoryId } from "./categories";

/* ---------- 参数控制 Schema ---------- */

export interface BaseControl {
  key: string;
  label: string;
  section: "文案" | "数值" | "节奏" | "布局";
}

export interface TextControl extends BaseControl {
  type: "text";
  defaultValue: string;
  multiline?: boolean;
  placeholder?: string;
}

export interface NumberControl extends BaseControl {
  type: "number";
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface SliderControl extends BaseControl {
  type: "slider";
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export interface SelectControl extends BaseControl {
  type: "select";
  defaultValue: string;
  options: { value: string; label: string }[];
}

export interface ToggleControl extends BaseControl {
  type: "toggle";
  defaultValue: boolean;
}

export type ControlDef =
  | TextControl
  | NumberControl
  | SliderControl
  | SelectControl
  | ToggleControl;

export type ParamValue = string | number | boolean;
export type Params = Record<string, ParamValue>;

/* ---------- 预览组件定义 ---------- */

export interface PreviewDefinition {
  id: string;
  index: string;
  name: string;
  nameEn: string;
  category: CategoryId;
  description: string;
  controls: ControlDef[];
  defaults: Params;
  component: ComponentType<{ params: Params }>;
}
