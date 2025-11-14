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
    styles.top = '0';
    styles.bottom = 'auto';
  } else if (vertical === 'middle') {
    styles.top = '50%';
    styles.bottom = 'auto';
  } else if (vertical === 'bottom') {
    styles.top = 'auto';
    styles.bottom = '0';
  }
  
  if (horizontal === 'left') {
    styles.left = '0';
    styles.right = 'auto';
  } else if (horizontal === 'center') {
    styles.left = '50%';
    styles.right = 'auto';
  } else if (horizontal === 'right') {
    styles.left = 'auto';
    styles.right = '0';
  }

  // Apply offset only in transform
  if (vertical === 'middle' && horizontal === 'center') {
    styles.transform = `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`;
  } else if (vertical === 'middle') {
    styles.transform = `translate(${offset.x}px, calc(-50% + ${offset.y}px))`;
  } else if (horizontal === 'center') {
    styles.transform = `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`;
  } else {
    // For corner positions (top-left, top-right, bottom-left, bottom-right)
    styles.transform = `translate(${offset.x}px, ${offset.y}px)`;
  }
  
  return styles;
};

