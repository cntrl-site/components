import { CSSProperties } from 'react';
import { Alignment, Offset } from "./Testimonials";
import { scalingValue } from "../utils/scalingValue";

export function getAlignPosition(alignment: Alignment, offset: Offset, isEditor?: boolean): CSSProperties {
  const styles: CSSProperties = {};
  const [vertical, horizontal] = alignment.split('-');

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

  if (vertical === 'middle' && horizontal === 'center') {
    styles.transform = `translate(calc(-50% + ${scalingValue(offset.x, isEditor)}), calc(-50% + ${scalingValue(offset.y, isEditor)}))`;
  } else if (vertical === 'middle') {
    styles.transform = `translate(${scalingValue(offset.x, isEditor)}, calc(-50% + ${scalingValue(offset.y, isEditor)}))`;
  } else if (horizontal === 'center') {
    styles.transform = `translate(calc(-50% + ${scalingValue(offset.x, isEditor)}), ${scalingValue(offset.y, isEditor)})`;
  } else {
    styles.transform = `translate(${scalingValue(offset.x, isEditor)}, ${scalingValue(offset.y, isEditor)})`;
  }
  
  return styles;
}