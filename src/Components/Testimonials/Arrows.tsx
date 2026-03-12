import { CSSProperties, FC } from 'react';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import classes from './Testimonials.module.scss';
import cn from 'classnames';
import { Alignment } from '../utils/getPositionStyles';
import { Splide } from '@splidejs/react-splide';
import { scalingValue } from '../utils/scalingValue';
import { TestimonialsControls } from './Testimonials';

type ArrowsProps = {
  isRtl: boolean;
  step: number;
  controls: TestimonialsControls;
  isEditor: boolean;
  sliderRef: React.RefObject<Splide>;
};

export const Arrows: FC<ArrowsProps> = ({ isRtl, step, controls, isEditor, sliderRef }) => {
  const prevGo = isRtl ? `+${step}` : `-${step}`;
  const nextGo = isRtl ? `-${step}` : `+${step}`;
  const handlePrevClick = () => {
    sliderRef.current?.go(prevGo);
  };
  const handleNextClick = () => {
    sliderRef.current?.go(nextGo);
  };

  const getControlsAlignmentStyles = (align?: Alignment) => {
    if (!align) {
      return {};
    }

    const [vertical, horizontal] = align.split('-') as [
      'top' | 'middle' | 'bottom',
      'left' | 'center' | 'right'
    ];

    const styles: CSSProperties = {};

    if (vertical === 'middle') {
      styles.position = 'absolute';
      styles.top = '50%';
      styles.left = 0;
      styles.right = 0;
      styles.transform = 'translateY(-50%)';
      styles.display = 'flex';
    } else {
      if (vertical === 'top') {
        styles.order = 0;
        styles.marginTop = 0;
        styles.marginBottom = 'auto';
      } else {
        styles.order = 2;
        styles.marginTop = 'auto';
        styles.marginBottom = 0;
      }
    }

    if (horizontal === 'left') {
      if (vertical === 'middle') {
        styles.justifyContent = 'flex-start';
      } else {
        styles.alignSelf = 'flex-start';
      }
    } else if (horizontal === 'center') {
      if (vertical === 'middle') {
        styles.justifyContent = 'center';
      } else {
        styles.justifyContent = 'center';
      }
    } else {
      if (vertical === 'middle') {
        styles.justifyContent = 'flex-end';
      } else {
        styles.justifyContent = 'flex-end';
      }
    }

    return styles;
  };
  return (
    <div
      className={classes.controls}
      style={{
        color: controls?.color,
        ['--arrow-hover-color' as string]: controls?.hover,
        gap: scalingValue(controls?.gap ?? 0, isEditor ?? false),
        ...getControlsAlignmentStyles(controls?.align),
      }}
    >
      <div className={classes.arrow}>
        <button
          className={classes.arrowInner}
          onClick={handlePrevClick}
          aria-label='Previous'
          style={{ transform: `scale(${controls?.scale / 100})`}}
        >
          {controls?.arrowsImgUrl && (
            <SvgImage
              url={controls?.arrowsImgUrl}
              fill={controls?.color}
              hoverFill={controls?.hover}
              className={cn(classes.arrowImg, classes.mirror)}
            />
          )}
          {!controls?.arrowsImgUrl && (
            <ArrowIcon
              color={controls?.color}
              className={cn(classes.arrowIcon, classes.arrowImg, classes.mirror)}
            />
          )}
        </button>
      </div>
      <div className={cn(classes.arrow, classes.nextArrow)}>
        <button
          className={classes.arrowInner}
          onClick={handleNextClick}
          aria-label='Next'
          style={{ transform: `scale(${controls?.scale / 100})`}}
        >
          {controls?.arrowsImgUrl && (
            <SvgImage
              url={controls?.arrowsImgUrl}
              fill={controls?.color}
              hoverFill={controls?.hover}
              className={classes.arrowImg}
            />
          )}
          {!controls?.arrowsImgUrl && (
            <ArrowIcon
              color={controls?.color}
              className={cn(classes.arrowIcon, classes.arrowImg)}
            />
          )}
        </button>
      </div>
    </div>
  )
};


function ArrowIcon({ color, className }: { color: string, className: string }) {
  return (
    <svg viewBox="0 0 10 18" className={className}>
      <g id="Symbols" stroke="none" strokeWidth="1" fillRule="evenodd">
          <path d="M-3.70710678,4.29289322 C-3.34662282,3.93240926 -2.77939176,3.90467972 -2.38710056,4.20970461 L-2.29289322,4.29289322 L5,11.585 L12.2928932,4.29289322 C12.6533772,3.93240926 13.2206082,3.90467972 13.6128994,4.20970461 L13.7071068,4.29289322 C14.0675907,4.65337718 14.0953203,5.22060824 13.7902954,5.61289944 L13.7071068,5.70710678 L5.70710678,13.7071068 C5.34662282,14.0675907 4.77939176,14.0953203 4.38710056,13.7902954 L4.29289322,13.7071068 L-3.70710678,5.70710678 C-4.09763107,5.31658249 -4.09763107,4.68341751 -3.70710678,4.29289322 Z" id="Shape-Copy" fill={color} transform="translate(5, 9) rotate(-90) translate(-5, -9)"></path>
      </g>
    </svg>
  );
}