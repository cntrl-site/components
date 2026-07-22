import { useMemo } from 'react';
import { CommonComponentProps } from '../props';
import { scalingValue, useScopedStyles } from '../utils';

type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type SimpleButtonItem = {
  image: {
    url: string;
    name: string;
  };
  text?: string;
};

type SimpleButtonSettings = {
  type?: 'a' | 'b';
  dimensions?: number;
  padding?: Padding;
  minWidth?: number;
  minHeight?: number;
};

type SimpleButtonProps = {
  settings: SimpleButtonSettings;
  content?: SimpleButtonItem[];
  isEditor?: boolean;
} & CommonComponentProps;

function getCSS(P: string): string {
  return `
.${P}-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}
.${P}-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: none;
  background: #000;
  color: #fff;
  cursor: pointer;
  font: inherit;
}
.${P}-icon {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
`;
}

export function SimpleButton({ settings, content, isEditor }: SimpleButtonProps) {
  const { prefix: P } = useScopedStyles();
  const scopedCss = useMemo(() => getCSS(P), [P]);

  const {
    type = 'a',
    dimensions = 100,
    padding = { top: 0, right: 0, bottom: 0, left: 0 },
    minWidth = 0,
    minHeight = 0,
  } = settings;

  const item = content?.[0];
  const isAutoDimensions = dimensions === 0;

  const buttonStyle = {
    paddingTop: scalingValue(padding.top, isEditor),
    paddingRight: scalingValue(padding.right, isEditor),
    paddingBottom: scalingValue(padding.bottom, isEditor),
    paddingLeft: scalingValue(padding.left, isEditor),
    minWidth: scalingValue(minWidth, isEditor),
    minHeight: scalingValue(minHeight, isEditor),
    width: isAutoDimensions ? 'auto' : scalingValue(dimensions, isEditor),
    height: isAutoDimensions ? 'auto' : scalingValue(dimensions, isEditor),
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div className={`${P}-wrapper`}>
        <button type="button" className={`${P}-button`} style={buttonStyle}>
          {type === 'b' && item?.image?.url ? (
            <img
              className={`${P}-icon`}
              src={item.image.url}
              alt={item.image.name}
            />
          ) : (
            item?.text ?? 'Button'
          )}
        </button>
      </div>
    </>
  );
}
