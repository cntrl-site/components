import { ImageItem, VideoItem } from '../../sdk/types/article/Item';
import { KeyframeType } from '../../sdk/types/keyframe/Keyframe';
import { useKeyframeValue } from './useKeyframeValue';

const baseVariables = `precision mediump float;
uniform sampler2D u_image;
uniform sampler2D u_pattern;
uniform vec2 u_imgDimensions;
uniform vec2 u_patternDimensions;
uniform float u_time;
uniform vec2 u_cursor;
varying vec2 v_texCoord;`;

export function useItemFXData(item: ImageItem | VideoItem, sectionId: string): FXData {
  const { fragmentShader: shaderBody, FXControls } = item.commonParams;
  const controls = FXControls ?? [];
  const controlsVariables = controls.map((c) => `uniform ${c.type} ${c.shaderParam};`)
    .join('\n');
  const fragmentShader = `${baseVariables}\n${controlsVariables}\n${shaderBody}`;
  const controlsValues = useKeyframeValue(
    item,
    KeyframeType.FXParams,
    () => {
      const defaultValue = controls.reduce<Record<string, ControlValue>>((acc, control) => {
        if (Array.isArray(control.value)) {
          acc[control.shaderParam] = control.value[0];
        } else {
          acc[control.shaderParam] = control.value;
        }
        return acc;
      }, {});
      return defaultValue;
    },
    (animator, scroll, value) => animator.getFXParams(value, scroll),
    sectionId,
  );
  return {
    fragmentShader,
    controlsValues
  };
}

type FXData = {
  fragmentShader: string;
  controlsValues: Record<string, ControlValue>;
}

type ControlValue = number;
