import React from 'react';
import { CSSProperties, FC } from 'react';
import styles from './RichTextRenderer.module.scss';
import { normalizeFontFamilyCssValue } from '../../utils/textStylesToCss';

interface Props {
  content: any[];
}

function hasVisibleText(children: any[] | undefined): boolean {
  if (!children?.length) return false;
  return children.some((child) => {
    if (child.type === 'link') return hasVisibleText(child.children);
    return Boolean(child.text);
  });
}

export const RichTextRenderer: FC<Props> = ({ content }) => {
  const getChildren = (children: any[]) => {
    return children.map((child, i) => {
      if (child.type === 'link') {
        return <a className={styles.link} key={i} href={child.value} target={child.target}>{getChildren(child.children)}</a>;
      }
      return <span style={getLeafCss(child)} key={i}>{child.text}</span>;
    });
  };
  return (
    <>
      {content.map((block, i) => {
        const children = block.children;
        return (
          <div key={i}>
            {hasVisibleText(children) ? getChildren(children) : '\u00a0'}
          </div>
        );
      })}
    </>
  );
};

function getLeafCss(leaf: any): CSSProperties {
  return {
    ...(leaf.fontFamily && { fontFamily: normalizeFontFamilyCssValue(leaf.fontFamily) }),
    ...(leaf.fontWeight && { fontWeight: leaf.fontWeight }),
    ...(leaf.fontStyle && { fontStyle: leaf.fontStyle }),
    ...(leaf.textDecoration && { textDecoration: leaf.textDecoration }),
    ...(leaf.textTransform && { textTransform: leaf.textTransform }),
    ...(leaf.fontVariant && { fontVariant: leaf.fontVariant }),
    ...(leaf.verticalAlign && {
      verticalAlign: leaf.verticalAlign,
      lineHeight: '0px',
    }),
  };
}
