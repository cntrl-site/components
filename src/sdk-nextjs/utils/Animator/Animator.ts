import { CntrlColor } from '@cntrl-site/color';
import { binSearchInsertAt, createInsert } from '../binSearchInsertAt';
import { rangeMap } from '../rangeMap';
import { KeyframeType, KeyframeValueMap } from '../../../sdk/types/keyframe/Keyframe';
import { FillLayer } from '../../../sdk/types/article/Item';

export interface AnimationData<T extends KeyframeType> {
  position: number;
  value: KeyframeValueMap[T];
  type: T;
}

interface PositionKeyframes<T extends KeyframeType> {
  start: AnimationData<T>;
  end: AnimationData<T>;
}

export type KeyframesMap = {
  [T in KeyframeType]: AnimationData<T>[];
};

type ColorPoint = {
  id: string;
  value: string;
  position: number;
};

const compare = (lhs: { position: number }, rhs: { position: number }) => lhs.position - rhs.position;
const insertBin = createInsert(binSearchInsertAt, compare);

export class Animator {
  private static pushKeyframeToMap<T extends KeyframeType>(keyframe: AnimationData<T>, map: KeyframesMap): void {
    insertBin(map[keyframe.type], keyframe);
  }

  private keyframesMap: KeyframesMap = createKeyframesMap();
  constructor(
    private keyframes: AnimationData<KeyframeType>[]
  ) {
    this.fillKeyframesMap();
  }

  getFXParams(
    valuesMap: Record<string, number>,
    pos: number
  ): KeyframeValueMap[KeyframeType.FXParams] {
    const keyframes = this.keyframesMap[KeyframeType.FXParams];
    if (!keyframes.length) return valuesMap;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return Object.entries(valuesMap).reduce<Record<string, number>>((acc, [key, fallbackValue]) => {
        acc[key] = keyframe.value[key] ?? fallbackValue;
        return acc;
      }, {});
    }
    const { start, end } = this.getStartEnd<KeyframeType.FXParams>(pos, keyframes);
    return Object.entries(valuesMap).reduce<Record<string, number>>((acc, [key, fallbackValue]) => {
      acc[key] = rangeMap(pos, start.position, end.position, start.value[key] ?? fallbackValue, end.value[key] ?? fallbackValue, true);
      return acc;
    }, {});
  }

  getDimensions(
    values: KeyframeValueMap[KeyframeType.Dimensions],
    pos: number
  ): KeyframeValueMap[KeyframeType.Dimensions] {
    const keyframes = this.keyframesMap[KeyframeType.Dimensions];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        width: keyframe.value.width,
        height: keyframe.value.height
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.Dimensions>(pos, keyframes);
    return {
      width: rangeMap(pos, start.position, end.position, start.value.width, end.value.width, true),
      height: rangeMap(pos, start.position, end.position, start.value.height, end.value.height, true)
    };
  }

  getPositions(
    values: KeyframeValueMap[KeyframeType.Position],
    pos: number
  ): KeyframeValueMap[KeyframeType.Position] {
    const keyframes = this.keyframesMap[KeyframeType.Position];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        left: keyframe.value.left,
        top: keyframe.value.top
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.Position>(pos, keyframes);
    return {
      left: rangeMap(pos, start.position, end.position, start.value.left, end.value.left, true),
      top: rangeMap(pos, start.position, end.position, start.value.top, end.value.top, true)
    };
  }

  getBorderFill(
    values: KeyframeValueMap[KeyframeType.BorderFill],
    pos: number
  ): FillLayer[] {
    const keyframes = this.keyframesMap[KeyframeType.BorderFill];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return keyframe.value;
    }
    const { start, end } = this.getStartEnd<KeyframeType.BorderFill>(pos, keyframes);
    return this.getRangeGradient(start, end, pos);
  }

  getFill(
    values: KeyframeValueMap[KeyframeType.Fill],
    pos: number
  ): FillLayer[] {
    const keyframes = this.keyframesMap[KeyframeType.Fill];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return keyframe.value;
    }
    const { start, end } = this.getStartEnd<KeyframeType.Fill>(pos, keyframes);
    return this.getRangeGradient(start, end, pos);
  }

  getRadius(
    values: KeyframeValueMap[KeyframeType.BorderRadius],
    pos: number
  ): KeyframeValueMap[KeyframeType.BorderRadius] {
    const keyframes = this.keyframesMap[KeyframeType.BorderRadius];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        radius: keyframe.value.radius
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.BorderRadius>(pos, keyframes);
    return {
      radius: rangeMap(pos, start.position, end.position, start.value.radius, end.value.radius, true)
    };
  }

  getBorderWidth(
    values: KeyframeValueMap[KeyframeType.BorderWidth],
    pos: number
  ): KeyframeValueMap[KeyframeType.BorderWidth] {
    const keyframes = this.keyframesMap[KeyframeType.BorderWidth];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        borderWidth: keyframe.value.borderWidth
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.BorderWidth>(pos, keyframes);
    return {
      borderWidth: rangeMap(pos, start.position, end.position, start.value.borderWidth, end.value.borderWidth, true)
    };
  }

  getRotation(
    values: KeyframeValueMap[KeyframeType.Rotation],
    pos: number
  ): KeyframeValueMap[KeyframeType.Rotation] {
    const keyframes = this.keyframesMap[KeyframeType.Rotation];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        angle: keyframe.value.angle
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.Rotation>(pos, keyframes);
    return {
      angle: rangeMap(pos, start.position, end.position, start.value.angle, end.value.angle, true)
    };
  }

  getOpacity(
    values: KeyframeValueMap[KeyframeType.Opacity],
    pos: number
  ): KeyframeValueMap[KeyframeType.Opacity] {
    const keyframes = this.keyframesMap[KeyframeType.Opacity];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        opacity: keyframe.value.opacity
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.Opacity>(pos, keyframes);
    return {
      opacity: rangeMap(pos, start.position, end.position, start.value.opacity, end.value.opacity, true)
    };
  }

  getScale(
    values: KeyframeValueMap[KeyframeType.Scale],
    pos: number
  ): KeyframeValueMap[KeyframeType.Scale] {
    const keyframes = this.keyframesMap[KeyframeType.Scale];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        scale: keyframe.value.scale
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.Scale>(pos, keyframes);
    return {
      scale: rangeMap(pos, start.position, end.position, start.value.scale, end.value.scale, true)
    };
  }

  getBlur(
    values: KeyframeValueMap[KeyframeType.Blur],
    pos: number
  ): KeyframeValueMap[KeyframeType.Blur] {
    const keyframes = this.keyframesMap[KeyframeType.Blur];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        blur: keyframe.value.blur
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.Blur>(pos, keyframes);
    return {
      blur: rangeMap(pos, start.position, end.position, start.value.blur, end.value.blur, true)
    };
  }

  getBackdropBlur(
    values: KeyframeValueMap[KeyframeType.BackdropBlur],
    pos: number
  ): KeyframeValueMap[KeyframeType.BackdropBlur] {
    const keyframes = this.keyframesMap[KeyframeType.BackdropBlur];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        backdropBlur: keyframe.value.backdropBlur
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.BackdropBlur>(pos, keyframes);
    return {
      backdropBlur: rangeMap(pos, start.position, end.position, start.value.backdropBlur, end.value.backdropBlur, true)
    };
  }

  getTextColor(
    values: KeyframeValueMap[KeyframeType.TextColor],
    pos: number
  ): KeyframeValueMap[KeyframeType.TextColor] {
    const keyframes = this.keyframesMap[KeyframeType.TextColor];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        color: keyframe.value.color
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.TextColor>(pos, keyframes);
    return {
      color: this.getRangeColor(start, end, pos)
    };
  }

  getLetterSpacing(
    values: KeyframeValueMap[KeyframeType.LetterSpacing],
    pos: number
  ): KeyframeValueMap[KeyframeType.LetterSpacing] {
    const keyframes = this.keyframesMap[KeyframeType.LetterSpacing];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        letterSpacing: keyframe.value.letterSpacing
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.LetterSpacing>(pos, keyframes);
    return {
      letterSpacing: rangeMap(
        pos,
        start.position,
        end.position,
        start.value.letterSpacing,
        end.value.letterSpacing,
        true
      )
    };
  }

  getWordSpacing(
    values: KeyframeValueMap[KeyframeType.WordSpacing],
    pos: number
  ): KeyframeValueMap[KeyframeType.WordSpacing] {
    const keyframes = this.keyframesMap[KeyframeType.WordSpacing];
    if (!keyframes || !keyframes.length) return values;
    if (keyframes.length === 1) {
      const [keyframe] = keyframes;
      return {
        wordSpacing: keyframe.value.wordSpacing
      };
    }
    const { start, end } = this.getStartEnd<KeyframeType.WordSpacing>(pos, keyframes);
    return {
      wordSpacing: rangeMap(
        pos,
        start.position,
        end.position,
        start.value.wordSpacing,
        end.value.wordSpacing,
        true
      )
    };
  }

  getStartEnd<T extends KeyframeType>(position: number, keyframes: AnimationData<T>[]): PositionKeyframes<T> {
    const index = binSearchInsertAt(keyframes, { position }, compare);
    const end = index === keyframes.length ? index - 1 : index;
    const start = end === 0 ? end : end - 1;
    return { start: keyframes[start], end: keyframes[end] };
  }

  private fillKeyframesMap() {
    this.keyframesMap = createKeyframesMap();
    for (const keyframe of this.keyframes) {
      Animator.pushKeyframeToMap(keyframe, this.keyframesMap);
    }
  }

  private getRangeColor(
    start: AnimationData<KeyframeType.TextColor>,
    end: AnimationData<KeyframeType.TextColor>,
    position: number
  ): string {
    const rangeAmount = rangeMap(position, start.position, end.position, 0, 1, true);
    const startColor = CntrlColor.parse(start.value.color);
    const endColor = CntrlColor.parse(end.value.color);
    const mixedColor = startColor.mix(endColor, rangeAmount);
    return mixedColor.fmt('oklch');
  }

  private getRangeGradient(
    start: AnimationData<KeyframeType.Fill | KeyframeType.BorderFill>,
    end: AnimationData<KeyframeType.Fill | KeyframeType.BorderFill>,
    position: number
  ): FillLayer[] {
    const rangeAmount = rangeMap(position, start.position, end.position, 0, 1, true);
    const allLayerIds = new Set([
      ...start.value.map(layer => layer.id),
      ...end.value.map(layer => layer.id)
    ]);
    const result: FillLayer[] = [];
    for (const layerId of allLayerIds) {
      const startLayers = start.value.find(layer => layer.id === layerId);
      const endLayers = end.value.find(layer => layer.id === layerId);
      const startLayersArray = Array.isArray(startLayers) ? startLayers : startLayers ? [startLayers] : [];
      const endLayersArray = Array.isArray(endLayers) ? endLayers : endLayers ? [endLayers] : [];
      if (startLayersArray.length > 0 && endLayersArray.length === 0) {
        result.push(...startLayersArray);
        continue;
      }
      if (startLayersArray.length === 0 && endLayersArray.length > 0) {
        result.push(...endLayersArray);
        continue;
      }
      if (startLayersArray.length > 0 && endLayersArray.length > 0) {
        result.push(...this.interpolateFillLayerArray(startLayersArray, endLayersArray, rangeAmount));
      }
    }

    return result;
  }

  private interpolateFillLayerArray(startLayers: FillLayer[], endLayers: FillLayer[], rangeAmount: number): FillLayer[] {
    const startLayerMap = new Map(startLayers.map(layer => [layer.id, layer]));
    const endLayerMap = new Map(endLayers.map(layer => [layer.id, layer]));
    const allLayerIds = new Set([
      ...startLayers.map(layer => layer.id),
      ...endLayers.map(layer => layer.id)
    ]);

    const interpolatedLayers: FillLayer[] = [];

    for (const layerId of allLayerIds) {
      const startLayer = startLayerMap.get(layerId);
      const endLayer = endLayerMap.get(layerId);
      if (startLayer && !endLayer) {
        interpolatedLayers.push(startLayer);
        continue;
      }
      if (!startLayer && endLayer) {
        interpolatedLayers.push(endLayer);
        continue;
      }
      if (startLayer && endLayer) {
        interpolatedLayers.push(this.interpolateFillLayer(startLayer, endLayer, rangeAmount));
      }
    }
    const result: FillLayer[] = [];
    for (const startLayer of startLayers) {
      const interpolatedLayer = interpolatedLayers.find(layer => layer.id === startLayer.id);
      if (interpolatedLayer) {
        result.push(interpolatedLayer);
      }
    }
    for (const endLayer of endLayers) {
      if (!startLayerMap.has(endLayer.id)) {
        const interpolatedLayer = interpolatedLayers.find(layer => layer.id === endLayer.id);
        if (interpolatedLayer) {
          result.push(interpolatedLayer);
        }
      }
    }

    return result;
  }

  private interpolateFillLayer(startLayer: FillLayer, endLayer: FillLayer, rangeAmount: number): FillLayer {
    if (startLayer.type !== endLayer.type) {
      return startLayer;
    }

    switch (startLayer.type) {
      case 'solid': {
        const endSolidLayer = endLayer as typeof startLayer;
        const startColor = CntrlColor.parse(startLayer.value);
        const endColor = CntrlColor.parse(endSolidLayer.value);
        const mixedColor = startColor.mix(endColor, rangeAmount);
        return {
          ...startLayer,
          value: mixedColor.fmt('oklch')
        };
      }

      case 'linear-gradient': {
        const endLinearLayer = endLayer as typeof startLayer;
        const interpolatedColors = this.interpolateColorStops(startLayer.colors, endLinearLayer.colors, rangeAmount);
        const angle = startLayer.angle + (endLinearLayer.angle - startLayer.angle) * rangeAmount;
        const startPoint: [number, number] = [
          startLayer.start[0] + (endLinearLayer.start[0] - startLayer.start[0]) * rangeAmount,
          startLayer.start[1] + (endLinearLayer.start[1] - startLayer.start[1]) * rangeAmount
        ];
        const endPoint: [number, number] = [
          startLayer.end[0] + (endLinearLayer.end[0] - startLayer.end[0]) * rangeAmount,
          startLayer.end[1] + (endLinearLayer.end[1] - startLayer.end[1]) * rangeAmount
        ];
        return {
          ...startLayer,
          colors: interpolatedColors,
          angle,
          start: startPoint,
          end: endPoint
        };
      }

      case 'radial-gradient': {
        const endRadialLayer = endLayer as typeof startLayer;
        const interpolatedColors = this.interpolateColorStops(startLayer.colors, endRadialLayer.colors, rangeAmount);
        const angle = startLayer.angle + (endRadialLayer.angle - startLayer.angle) * rangeAmount;
        const center: [number, number] = [
          startLayer.center[0] + (endRadialLayer.center[0] - startLayer.center[0]) * rangeAmount,
          startLayer.center[1] + (endRadialLayer.center[1] - startLayer.center[1]) * rangeAmount
        ];
        const diameter = startLayer.diameter + (endRadialLayer.diameter - startLayer.diameter) * rangeAmount;
        return {
          ...startLayer,
          colors: interpolatedColors,
          angle,
          center,
          diameter
        };
      }

      case 'conic-gradient': {
        const endConicLayer = endLayer as typeof startLayer;
        const interpolatedColors = this.interpolateColorStops(startLayer.colors, endConicLayer.colors, rangeAmount);
        const angle = startLayer.angle + (endConicLayer.angle - startLayer.angle) * rangeAmount;
        const center: [number, number] = [
          startLayer.center[0] + (endConicLayer.center[0] - startLayer.center[0]) * rangeAmount,
          startLayer.center[1] + (endConicLayer.center[1] - startLayer.center[1]) * rangeAmount
        ];
        return {
          ...startLayer,
          colors: interpolatedColors,
          angle,
          center
        };
      }

      case 'image': {
        const endImageLayer = endLayer as typeof startLayer;
        const opacity = startLayer.opacity + (endImageLayer.opacity - startLayer.opacity) * rangeAmount;
        const backgroundSize = startLayer.backgroundSize + (endImageLayer.backgroundSize - startLayer.backgroundSize) * rangeAmount;
        return {
          ...startLayer,
          opacity,
          backgroundSize
        };
      }

      default:
        return startLayer;
    }
  }

  private interpolateColorStops(startColors: ColorPoint[], endColors: ColorPoint[], rangeAmount: number): ColorPoint[] {
    const startColorMap = new Map(startColors.map(stop => [stop.id, stop]));
    const endColorMap = new Map(endColors.map(stop => [stop.id, stop]));
    const allStopIds = new Set([
      ...startColors.map(stop => stop.id),
      ...endColors.map(stop => stop.id)
    ]);

    const interpolatedStops: ColorPoint[] = [];

    for (const stopId of allStopIds) {
      const startStop = startColorMap.get(stopId);
      const endStop = endColorMap.get(stopId);
      if (startStop && !endStop) {
        interpolatedStops.push(startStop);
        continue;
      }
      if (!startStop && endStop) {
        interpolatedStops.push(endStop);
        continue;
      }
      if (startStop && endStop) {
        const startColor = CntrlColor.parse(startStop.value);
        const endColor = CntrlColor.parse(endStop.value);
        const mixedColor = startColor.mix(endColor, rangeAmount);
        const position = startStop.position + (endStop.position - startStop.position) * rangeAmount;

        interpolatedStops.push({
          id: stopId,
          value: mixedColor.fmt('oklch'),
          position
        });
      }
    }
    return interpolatedStops.sort((a, b) => a.position - b.position);
  }
}

function createKeyframesMap(): KeyframesMap {
  return {
    [KeyframeType.Dimensions]: [],
    [KeyframeType.Position]: [],
    [KeyframeType.BorderWidth]: [],
    [KeyframeType.BorderRadius]: [],
    [KeyframeType.Rotation]: [],
    [KeyframeType.BorderFill]: [],
    [KeyframeType.Opacity]: [],
    [KeyframeType.Scale]: [],
    [KeyframeType.Blur]: [],
    [KeyframeType.BackdropBlur]: [],
    [KeyframeType.LetterSpacing]: [],
    [KeyframeType.WordSpacing]: [],
    [KeyframeType.TextColor]: [],
    [KeyframeType.FXParams]: [],
    [KeyframeType.Fill]: []
  };
}
