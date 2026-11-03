import React, { CSSProperties, FC, ReactNode } from 'react';
import { buildValidUrl } from './buildValidUrl';

interface Props {
  /**
   * A content link or a rich text link node: both keep the url in `value` and `blank` or `self`
   * in `target` (`_blank` is taken too).
   */
  link?: { value: string; target?: string };
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const LinkWrapper: FC<Props> = ({ link, className, style, children }) => {
  if (!link?.value) return <>{children}</>;
  const targetProps = link.target === 'blank' || link.target === '_blank' ? { target: '_blank', rel: 'noreferrer' } : {};
  return (
    <a href={buildValidUrl(link.value)} className={className} style={style} {...targetProps}>
      {children}
    </a>
  );
};
