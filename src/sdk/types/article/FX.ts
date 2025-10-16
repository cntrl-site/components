export type FXControlType = 'float' | 'int' | 'vec2';
export type FXControlInput = 'knob' | 'matrix2d' | 'slider';

export interface FXCursor {
  type: 'mouse' | 'manual';
  x: number;
  y: number;
}

export interface FXControlValuesMap {
  'float': number;
  'int': number;
  'vec2': [number, number];
}

export interface FXControlTypeMap {
  'float': 'knob' | 'slider';
  'int': 'knob';
  'vec2': 'matrix2d';
}

export interface FXControl<Type extends FXControlType, Input extends FXControlTypeMap[Type]> {
  type: Type;
  shaderParam: string;
  value: FXControlValuesMap[Type];
}

export type FXControlAny = FXControl<FXControlType, FXControlInput>;
