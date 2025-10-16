import { areFillsVisible, FillLayer } from './areFillsVisible';

const solidFillVisible: FillLayer = {
  type: 'solid',
  value: 'rgba(0, 0, 0, 1)',
};

const linearFillVisible: FillLayer = {
  type: 'linear-gradient',
  colors: [{ value: 'rgba(0, 0, 0, 1)' }, { value: 'rgba(255, 255, 255, 1)' }],
};

const radialFillVisible: FillLayer = {
  type: 'radial-gradient',
  colors: [{ value: 'rgba(0, 0, 0, 1)' }, { value: 'rgba(255, 255, 255, 1)' }],
};

const conicFillVisible: FillLayer = {
  type: 'conic-gradient',
  colors: [{ value: 'rgba(0, 0, 0, 1)' }, { value: 'rgba(255, 255, 255, 1)' }],
};

const imageFillVisible: FillLayer = {
  type: 'image',
  opacity: 1,
};

const solidFillTransparent: FillLayer = {
  type: 'solid',
  value: 'rgba(0, 0, 0, 0)',
};

const linearFillTransparent: FillLayer = {
  type: 'linear-gradient',
  colors: [{ value: 'rgba(0, 0, 0, 0)' }, { value: 'rgba(255, 255, 255, 0)' }],
};

const radialFillTransparent: FillLayer = {
  type: 'radial-gradient',
  colors: [{ value: 'rgba(0, 0, 0, 0)' }, { value: 'rgba(255, 255, 255, 0)' }],
};

const conicFillTransparent: FillLayer = {
  type: 'conic-gradient',
  colors: [{ value: 'rgba(0, 0, 0, 0)' }, { value: 'rgba(255, 255, 255, 0)' }],
};

const imageFillTransparent: FillLayer = {
  type: 'image',
  opacity: 0,
};

describe('areFillsVisible', () => {
  it('should return true if the fills are visible', () => {
    expect(areFillsVisible([solidFillVisible, linearFillVisible, radialFillVisible, conicFillVisible, imageFillVisible])).toBe(true);
  });
  it('should return false if the fills are transparent', () => {
    expect(areFillsVisible([solidFillTransparent, linearFillTransparent, radialFillTransparent, conicFillTransparent, imageFillTransparent])).toBe(false);
  });
  it('should return true if some fills are visible and some are transparent', () => {
    expect(areFillsVisible([solidFillVisible, solidFillTransparent, linearFillVisible, linearFillTransparent, radialFillVisible, radialFillTransparent, conicFillVisible, conicFillTransparent, imageFillVisible, imageFillTransparent])).toBe(true);
  });
});
