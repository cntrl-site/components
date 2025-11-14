import { CSSProperties } from 'react';

export type Alignment = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type Offset = {
  x: number;
  y: number;
};

export const getPositionStyles = (position: Alignment, offset: Offset): CSSProperties => {
  const styles: CSSProperties = {};
  const [vertical, horizontal] = position.split('-');
  
  if (vertical === 'top') {
    styles.top = `${offset.y}px`;
    styles.bottom = 'auto';
  } else if (vertical === 'middle') {
    styles.top = '50%';
    styles.bottom = 'auto';
  } else if (vertical === 'bottom') {
    styles.top = 'auto';
    styles.bottom = `${offset.y}px`;
  }
  
  if (horizontal === 'left') {
    styles.left = `${offset.x}px`;
    styles.right = 'auto';
  } else if (horizontal === 'center') {
    styles.left = '50%';
    styles.right = 'auto';
  } else if (horizontal === 'right') {
    styles.left = 'auto';
    styles.right = `${offset.x}px`;
  }

  if (vertical === 'middle' && horizontal === 'center') {
    styles.transform = `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`;
  } else if (vertical === 'middle') {
    styles.transform = `translateY(calc(-50% + ${offset.y}px))`;
  } else if (horizontal === 'center') {
    styles.transform = `translateX(calc(-50% + ${offset.x}px))`;
  }
  
  return styles;
};

