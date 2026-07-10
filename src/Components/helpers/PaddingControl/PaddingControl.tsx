import { type CSSProperties, type ComponentPropsWithoutRef } from 'react';

export type PaddingControlHitPlacement = 'left-y' | 'center-x' | 'center';

const PADDING_CONTROL_HIT_SIZE = 12;

function getPaddingControlHitStyle(
  placement: PaddingControlHitPlacement,
  centerXTop = '50%',
): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
    width: PADDING_CONTROL_HIT_SIZE,
    height: PADDING_CONTROL_HIT_SIZE,
    pointerEvents: 'none',
  };

  if (placement === 'left-y') {
    return { ...base, left: 20, top: '50%', transform: 'translateY(-50%)' };
  }

  if (placement === 'center-x') {
    return {
      ...base,
      left: '50%',
      top: centerXTop,
      transform: 'translate(-50%, -50%)',
    };
  }

  return { ...base, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
}

export type PaddingControlProps = {
  className: string;
  areaStyle: CSSProperties;
  hitPlacement: PaddingControlHitPlacement;
  centerXHitTop?: string;
} & ComponentPropsWithoutRef<'div'>;

export function PaddingControl({
  className,
  areaStyle,
  hitPlacement,
  centerXHitTop,
  ...rest
}: PaddingControlProps) {
  return (
    <div
      className={className}
      style={{ ...areaStyle, pointerEvents: 'none' }}
      data-controls-center-only-drag=""
      {...rest}
    >
      <div style={getPaddingControlHitStyle(hitPlacement, centerXHitTop)} />
    </div>
  );
}
