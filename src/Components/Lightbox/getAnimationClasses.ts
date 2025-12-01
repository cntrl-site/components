import styles from './Lightbox.module.scss';
type AppearType = 'slide in' | 'fade in' | 'mix';
type Direction = 'top' | 'bottom' | 'left' | 'right';

export function getAnimationClasses(type: AppearType, direction: Direction) {
  const appearClass = (() => {
    if (type === 'fade in') return styles.fadeIn;
    if (type === 'slide in' || type === 'mix') {
      switch (direction) {
        case 'left':
          return styles.slideInLeft;
        case 'right':
          return styles.slideInRight;
        case 'top':
          return styles.slideInTop;
        case 'bottom':
          return styles.slideInBottom;
        default:
          return styles.slideInRight;
      }
    }
    return styles.fadeIn;
  })();

  const backdropAppearClass = (() => {
    if (type === 'fade in' || type === 'mix') return styles.fadeIn;
    if (type === 'slide in') {
      switch (direction) {
        case 'left':
          return styles.slideInLeft;
        case 'right':
          return styles.slideInRight;
        case 'top':
          return styles.slideInTop;
        case 'bottom':
          return styles.slideInBottom;
        default:
          return styles.slideInRight;
      }
    }
    return styles.fadeIn;
  })();

  const backdropDisappearClass = (() => {
    if (type === 'fade in' || type === 'mix') return styles.fadeOut;
    if (type === 'slide in') {
      switch (direction) {
        case 'left':
          return styles.slideOutLeft;
        case 'right':
          return styles.slideOutRight;
        case 'top':
          return styles.slideOutTop;
        case 'bottom':
          return styles.slideOutBottom;
        default:
          return styles.slideOutRight;
      }
    }
    return styles.fadeOut;
  })();

  const disappearClass = (() => {
    if (type === 'fade in') return styles.fadeOut;
    if (type === 'slide in' || type === 'mix') {
      switch (direction) {
        case 'left':
          return styles.slideOutLeft;
        case 'right':
          return styles.slideOutRight;
        case 'top':
          return styles.slideOutTop;
        case 'bottom':
          return styles.slideOutBottom;
        default:
          return styles.slideOutRight;
      }
    }
    return styles.fadeOut;
  })();
  return { appearClass, backdropAppearClass, backdropDisappearClass, disappearClass };
};
