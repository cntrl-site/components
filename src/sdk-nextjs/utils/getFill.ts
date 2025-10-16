import { FillLayer } from '../../sdk/types/article/Item';

export function getFill(fill: FillLayer) {
  if (fill.type === 'linear-gradient' && Array.isArray(fill.colors)) {
    return `linear-gradient(${fill.angle}deg, ${fill.colors
      .map(c => `${c.value} ${c.position}%`)
      .join(', ')})`;
  }

  if (fill.type === 'radial-gradient' && Array.isArray(fill.colors)) {
    const center = fill.center
      ? `${fill.center[0] * 100}% ${fill.center[1] * 100}%`
      : '50% 50%';
    const diameter = fill.diameter;
    return `radial-gradient(circle ${diameter * 100} at ${center}, ${fill.colors
      .map(c => `${c.value} ${c.position}%`)
      .join(', ')})`;
  }

  if (fill.type === 'conic-gradient' && Array.isArray(fill.colors)) {
    const center = fill.center
      ? `${fill.center[0] * 100}% ${fill.center[1] * 100}%`
      : '50% 50%';
    const angle = (fill.angle ?? 0);
    const hasMultipleStops = fill.colors.length > 1;
    const lastStop = fill.colors[fill.colors.length - 1];
    const shouldAppendWrapStop = hasMultipleStops && typeof lastStop.position === 'number' && lastStop.position < 100;
    const colorsWithWrap = shouldAppendWrapStop
      ? [...fill.colors, { value: fill.colors[0].value, position: 100 }]
      : fill.colors;

    return `conic-gradient(from ${angle + 90}deg at ${center}, ${colorsWithWrap
      .map(c => `${c.value} ${c.position}%`)
      .join(', ')})`;
  }

  if (fill.type === 'image' && fill.src) {
    return `url(${fill.src})`;
  }

  if (fill.type === 'solid') {
    return fill.value;
  }

  return 'transparent';
}
