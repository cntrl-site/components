import React, { useState, useEffect, FC } from 'react';
import cn from 'classnames';
import styles from './SvgImage.module.scss';

interface SvgImageProps {
  url: string;
  fill?: string;
  hoverFill?: string;
  className?: string;
  style?: React.CSSProperties;
}

const isSvgMaskableUrl = (url: string): boolean => {
  const lower = url.trim().toLowerCase();
  if (lower.startsWith('data:image/svg+xml')) return true;
  if (lower.includes('image/svg+xml')) return true;
  if (lower.includes('.svg')) return true;
  if (lower.startsWith('blob:')) return true;
  return false;
};

const maskImageUrlCss = (href: string): string => {
  const escaped = href.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `url("${escaped}")`;
};

export const SvgImage: FC<SvgImageProps> = ({ url, fill = '#000000', hoverFill = '#CCCCCC', className = '', style }) => {
  const [supportsMask, setSupportsMask] = useState(() => {
    if (typeof window === 'undefined') return true;
    return CSS.supports('mask-image', 'url("")') || CSS.supports('-webkit-mask-image', 'url("")');
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.CSS) {
      const supported = CSS.supports('mask-image', 'url("")') || CSS.supports('-webkit-mask-image', 'url("")');
      setSupportsMask(supported);
    }
  }, []);

  if (!isSvgMaskableUrl(url) || !supportsMask) {
    return <img src={url} alt="" className={cn(styles.img, className)} style={style} />;
  }

  return (
    <span
      data-supports-mask={supportsMask}
      className={cn(styles.svg, className)}
      style={{
        '--svg': maskImageUrlCss(url),
        '--fill': fill,
        '--hover-fill': hoverFill,
        ...(style ?? {}),
      } as React.CSSProperties}
    />
  );
};
