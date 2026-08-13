import React, { useCallback, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { RichTextRenderer } from '../helpers/RichTextRenderer/RichTextRenderer';
import { scalingValue } from '../utils/scalingValue';
import { SvgImage } from '../helpers/SvgImage/SvgImage';
import { CommonComponentProps } from '../props';
import { textStylesToCss, type TextStyles } from '../utils/textStylesToCss';
import { useScopedStyles } from '../utils/useScopedStyles';

type Slider20Item = {
  image: {
    url: string;
    name?: string;
    objectFit?: 'cover' | 'contain';
  };
  imageCaption: any[];
};

type Slider20TriggerType = 'click' | 'drag' | 'auto';
type Slider20Trigger = {
  sizeType: Slider20TriggerType;
  value: number;
  min: number;
  max: number;
};
type Slider20Direction = 'horizontal' | 'vertical';
type Slider20Transition = 'slide' | 'fade in' | 'reveal';
type Slider20Nav = 'classic' | 'no';
type Slider20NavSize = 's' | 'm' | 'l';
type Slider20ControlsShow = 'always' | 'on hover' | 'never';

type Slider20Settings = {
  trigger?: Slider20Trigger;
  direction?: Slider20Direction;
  transition?: Slider20Transition;
  nav?: Slider20Nav;
  navSize?: Slider20NavSize;
  navUnit?: number;
  controls?: string | null;
  controlsMaxWidth?: number;
  show?: Slider20ControlsShow;
  paddingX?: number;
  paddingY?: number;
  controlsColor?: string;
  controlsHoverColor?: string;
  navColor?: string;
  navPaginationColor?: string;
  navBackgroundColor?: string;
  linkColor?: string;
  titleColor?: string;
  titleFontFamily?: string;
  titleFontSettings?: {
    fontWeight?: number;
    fontStyle?: string;
  };
  titleFontSize?: number;
  titleLineHeight?: number;
  titleLetterSpacing?: number;
  titleWordSpacing?: number;
  titleTextAppearance?: {
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textDecoration?: 'none' | 'underline';
    fontVariant?: 'normal' | 'small-caps';
  };
};

type Slider20Props = {
  settings?: Slider20Settings;
  content: Slider20Item[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
} & CommonComponentProps;

type Offset = { x: number; y: number };
type Point = { x: number; y: number };
type LocalAxes = { ex: Point; ey: Point; det: number };

type DragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  axes: LocalAxes | null;
  size: number;
  isActive: boolean;
  baseOffset: number;
  offset: number;
  lastTime: number;
  velocity: number;
};

const TRANSITION_DURATION_MS = 500;
const TRANSITION_EASING = 'cubic-bezier(0.25, 1, 0.5, 1)';
const TRANSITION_BACKGROUND_COLOR: string | null = null;
const DOT_ANIMATION_MS = 300;
const DRAG_START_THRESHOLD_PX = 5;
const DRAG_DISTANCE_RATIO = 0.15;
const DRAG_FLICK_VELOCITY = 0.4;
const DRAG_FLICK_MAX_IDLE_MS = 100;
const AXIS_PROBE_LENGTH_PX = 100;

const CONTROLS = {
  color: '#000000',
  hover: '#cccccc',
};

const PAGINATION = {
  offset: { x: 0, y: 0 } as Offset,
  colors: {
    pagination: '#cccccc',
    inactive: '#cccccc',
    background: '#000000',
  },
};

const NAV_SIZES: Record<Slider20NavSize, {
  paddingY: number;
  paddingActive: number;
  borderRadius: number;
  dot: number;
  activeDot: number;
  gapInactive: number;
  inset: number;
}> = {
  s: {
    paddingY: 5,
    paddingActive: 5,
    borderRadius: 9,
    dot: 4,
    activeDot: 8,
    gapInactive: 9,
    inset: 5,
  },
  m: {
    paddingY: 7,
    paddingActive: 7,
    borderRadius: 17,
    dot: 8,
    activeDot: 20,
    gapInactive: 22,
    inset: 7,
  },
  l: {
    paddingY: 10,
    paddingActive: 10,
    borderRadius: 29,
    dot: 20,
    activeDot: 38,
    gapInactive: 26,
    inset: 10,
  },
};

const IMAGE_CAPTION = {
  offset: { x: 0, y: 0 } as Offset,
  isActive: true,
  linkColor: '#cccccc',
};

const DEFAULT_TRIGGER: Slider20Trigger = {
  sizeType: 'drag',
  value: 3,
  min: 1,
  max: 5,
};

const TITLE_WIDTH_SETTINGS = { width: 0.13, sizing: 'auto' as const };
const TITLE_TEXT_ALIGN = 'left' as const;

function resolveTitleStyle(settings: Slider20Settings | undefined, isEditor?: boolean): React.CSSProperties {
  const textStyles: TextStyles = {
    fontSettings: {
      fontFamily: settings?.titleFontFamily ?? 'Arial',
      fontWeight: settings?.titleFontSettings?.fontWeight ?? 400,
      fontStyle: settings?.titleFontSettings?.fontStyle ?? 'normal',
    },
    fontSize: settings?.titleFontSize ?? 0.02,
    lineHeight: settings?.titleLineHeight ?? 0.02,
    letterSpacing: settings?.titleLetterSpacing ?? 0,
    wordSpacing: settings?.titleWordSpacing ?? 0,
    textAppearance: settings?.titleTextAppearance,
    textAlign: TITLE_TEXT_ALIGN,
    color: settings?.titleColor ?? '#000000',
  };
  return textStylesToCss(textStyles, isEditor);
}

function sizeCss(property: string, value: number, isEditor?: boolean): string {
  return `${property}: ${scalingValue(value / 1440, isEditor)};`;
}

function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

function advanceTrackPosition(
  prev: number,
  step: 1 | -1,
  count: number,
  hasClones: boolean,
): { position: number; skipTransition: boolean } {
  if (!hasClones) {
    return { position: wrapIndex(prev + step, count), skipTransition: false };
  }
  const next = prev + step;
  if (next >= 0 && next <= count + 1) {
    return { position: next, skipTransition: false };
  }
  return {
    position: wrapIndex(prev - 1 + step, count) + 1,
    skipTransition: true,
  };
}

function readTrackTranslatePx(element: HTMLElement, isHorizontal: boolean): number {
  const matrix = new DOMMatrixReadOnly(window.getComputedStyle(element).transform);
  return isHorizontal ? matrix.m41 : matrix.m42;
}

function measureLocalAxes(element: HTMLElement, probeClassName: string): LocalAxes | null {
  const probe = document.createElement('div');
  probe.className = probeClassName;
  probe.setAttribute('aria-hidden', 'true');
  element.appendChild(probe);
  const readPoint = (x: number, y: number): Point => {
    probe.style.transform = `translate(${x}px, ${y}px)`;
    const rect = probe.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  };
  const origin = readPoint(0, 0);
  const alongX = readPoint(AXIS_PROBE_LENGTH_PX, 0);
  const alongY = readPoint(0, AXIS_PROBE_LENGTH_PX);
  element.removeChild(probe);
  const ex = {
    x: (alongX.x - origin.x) / AXIS_PROBE_LENGTH_PX,
    y: (alongX.y - origin.y) / AXIS_PROBE_LENGTH_PX,
  };
  const ey = {
    x: (alongY.x - origin.x) / AXIS_PROBE_LENGTH_PX,
    y: (alongY.y - origin.y) / AXIS_PROBE_LENGTH_PX,
  };
  const det = ex.x * ey.y - ey.x * ex.y;
  return { ex, ey, det };
}

function toLocalDelta(axes: LocalAxes, dx: number, dy: number): Point {
  const { ex, ey, det } = axes;
  return {
    x: (dx * ey.y - dy * ey.x) / det,
    y: (ex.x * dy - ex.y * dx) / det,
  };
}

function getCSS(P: string, isEditor?: boolean): string {
  return `
.${P}-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.${P}-wrapper:hover .${P}-hover-arrow {
  opacity: 1 !important;
}
.${P}-slider-inner {
  position: relative;
  width: 100%;
  height: 100%;
}
.${P}-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.${P}-axis-probe {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  visibility: hidden;
}
.${P}-track-draggable {
  touch-action: pan-y;
}
.${P}-track-draggable-vertical {
  touch-action: pan-x;
}
.${P}-track-draggable .${P}-list {
  user-select: none;
  -webkit-user-select: none;
}
.${P}-track-draggable .${P}-slider-image {
  -webkit-user-drag: none;
}
.${P}-list {
  position: relative;
  width: 100%;
  height: 100%;
}
.${P}-list-slide {
  display: flex;
  flex-direction: row;
  will-change: transform;
}
.${P}-list-slide-vertical {
  flex-direction: column;
}
.${P}-list-fade {
  display: block;
}
.${P}-slide {
  position: relative;
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
}
.${P}-list-fade .${P}-slide {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity ${TRANSITION_DURATION_MS}ms ${TRANSITION_EASING};
}
.${P}-list-fade .${P}-slide.${P}-is-active {
  opacity: 1;
  z-index: 1;
}
.${P}-slider-item {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
}
.${P}-slider-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.${P}-arrow {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  top: 50%;
  z-index: 1;
  padding: 0;
  ${sizeCss('width', 30, isEditor)}
  ${sizeCss('height', 30, isEditor)}
  transition: opacity 0.15s ease-in-out;
}
.${P}-arrow-prev {
  ${sizeCss('left', -20, isEditor)}
  transform: translate3d(-50%, -50%, 0);
}
.${P}-arrow-next {
  left: unset;
  ${sizeCss('right', -20, isEditor)}
  transform: translate3d(50%, -50%, 0);
}
.${P}-arrow-prev-vertical {
  left: 50%;
  ${sizeCss('top', -20, isEditor)}
  transform: translate3d(-50%, -50%, 0);
}
.${P}-arrow-next-vertical {
  left: 50%;
  right: unset;
  top: unset;
  ${sizeCss('bottom', -20, isEditor)}
  transform: translate3d(-50%, 50%, 0);
}
.${P}-arrow-hidden {
  opacity: 0;
  pointer-events: none;
}
.${P}-hover-arrow {
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
}
.${P}-hover-arrow:hover {
  opacity: 1;
}
.${P}-arrow-inner {
  all: unset;
  cursor: pointer;
  width: 100%;
  height: 100%;
}
.${P}-arrow-inner:hover .${P}-arrow-icon path {
  fill: var(--arrow-hover-color) !important;
}
.${P}-arrow-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.${P}-arrow-icon {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.${P}-arrow-icon path {
  transition: fill 0.15s ease-in-out;
}
.${P}-mirror {
  transform: translate(-50%, -50%) scaleX(-1) !important;
}
.${P}-pagination {
  position: absolute;
  z-index: 1;
  border-radius: 50%;
}
.${P}-pagination-inner {
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.${P}-pagination-vertical {
  flex-direction: column;
}
.${P}-pagination-item {
  all: unset;
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  aspect-ratio: 1;
  height: auto;
}
.${P}-dot {
  border-radius: 50%;
  aspect-ratio: 1;
  height: auto;
  transition: background-color 0.3s ease-in-out;
}
.${P}-animate-dots .${P}-dot {
  transition: background-color 0.3s ease-in-out, width 0.3s ease-in-out;
}
.${P}-pagination-inside-bottom {
  left: 50%;
  transform: translate3d(-50%, 0, 0);
}
.${P}-pagination-inside-left {
  top: 50%;
  transform: translate3d(0, -50%, 0);
}
.${P}-img-wrapper {
  width: 100%;
  height: 100%;
}
.${P}-caption-block {
  pointer-events: none;
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  z-index: 1;
}
.${P}-caption-text-wrapper {
  position: relative;
  width: 100%;
}
.${P}-caption-text {
  pointer-events: none;
  max-width: 100%;
  transition-property: opacity;
  transition-timing-function: ease-in-out;
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  opacity: 0;
}
.${P}-caption-text.${P}-active {
  opacity: 1;
}
.${P}-with-pointer-events {
  pointer-events: auto;
}
.${P}-click-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.${P}-contain {
  object-fit: contain;
}
.${P}-cover {
  object-fit: cover;
}
.${P}-transition-reveal .${P}-slide.${P}-is-active .${P}-slider-image {
  animation: ${P}-reveal-horizontal ${TRANSITION_DURATION_MS}ms ease;
}
.${P}-transition-reveal-vertical .${P}-slide.${P}-is-active .${P}-slider-image {
  animation: ${P}-reveal-vertical ${TRANSITION_DURATION_MS}ms ease;
}
@keyframes ${P}-reveal-horizontal {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
}
@keyframes ${P}-reveal-vertical {
  from { clip-path: inset(100% 0 0 0); }
  to { clip-path: inset(0 0 0 0); }
}
`;
}

export function Slider20({ settings, content, isEditor, isPreviewMode }: Slider20Props) {
  const { prefix: P } = useScopedStyles();
  const titleStyle = resolveTitleStyle(settings, isEditor);
  const items = content ?? [];
  const count = items.length;
  const trigger: Slider20Trigger = settings?.trigger ?? DEFAULT_TRIGGER;
  const triggerType: Slider20TriggerType = trigger.sizeType ?? 'drag';
  const autoPlayIntervalS = trigger.value ?? DEFAULT_TRIGGER.value;
  const direction: Slider20Direction = settings?.direction ?? 'horizontal';
  const transition: Slider20Transition = settings?.transition ?? 'slide';
  const nav: Slider20Nav = settings?.nav ?? 'classic';
  const navSize: Slider20NavSize = settings?.navSize ?? 'm';
  const navSizeValues = NAV_SIZES[navSize];
  const navUnit = typeof settings?.navUnit === 'number' ? settings.navUnit : 1 / 1440;
  const scaleNav = (px: number) => scalingValue(px * navUnit, isEditor);
  const controlsShow: Slider20ControlsShow = settings?.show ?? 'always';
  const controlsImgUrl = settings?.controls ?? null;
  const controlsMaxWidth = typeof settings?.controlsMaxWidth === 'number' ? settings.controlsMaxWidth : 65 / 1440;
  const controlsOffsetX = typeof settings?.paddingX === 'number' ? settings.paddingX : 0;
  const controlsOffsetY = typeof settings?.paddingY === 'number' ? settings.paddingY : 0;
  const controlsColor = settings?.controlsColor ?? CONTROLS.color;
  const controlsHoverColor = settings?.controlsHoverColor ?? CONTROLS.hover;
  const navColor = settings?.navColor ?? PAGINATION.colors.inactive;
  const navPaginationColor = settings?.navPaginationColor ?? PAGINATION.colors.pagination;
  const navBackgroundColor = settings?.navBackgroundColor ?? PAGINATION.colors.background;
  const linkColor = settings?.linkColor ?? IMAGE_CAPTION.linkColor;
  const isHorizontal = direction === 'horizontal';
  const isClickTrigger = triggerType === 'click';
  const isDragTrigger = triggerType === 'drag';
  const isAutoPlaying = triggerType === 'auto' && (!isEditor || Boolean(isPreviewMode));
  const pauseAutoOnHover = !isEditor;
  const isSlideTransition = transition === 'slide';
  const showClassicNav = nav === 'classic';
  const showControls = controlsShow !== 'never';
  const isControlsOnHover = controlsShow === 'on hover';
  const controlsMaxWidthScaled = scalingValue(controlsMaxWidth, isEditor);
  const controlsSizeStyle = {
    width: controlsMaxWidthScaled,
    height: controlsMaxWidthScaled,
    maxWidth: controlsMaxWidthScaled,
  } as React.CSSProperties;

  const hasClones = isSlideTransition && count > 1;
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackPosition, setTrackPosition] = useState(hasClones ? 1 : 0);
  const [isMoving, setIsMoving] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [animateDots, setAnimateDots] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isMovingRef = useRef(false);
  const trackPositionRef = useRef(trackPosition);
  trackPositionRef.current = trackPosition;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const activePointerIdRef = useRef<number | null>(null);

  const setMoving = useCallback((value: boolean) => {
    isMovingRef.current = value;
    setIsMoving(value);
  }, []);

  const goBySteps = useCallback((steps: number) => {
    if (count < 2 || steps === 0) return;
    const direction = steps > 0 ? 1 : -1;
    const total = Math.abs(steps);
    setAnimateDots(true);
    setMoving(true);
    setActiveIndex((prev) => wrapIndex(prev + steps, count));
    if (!isSlideTransition) return;

    let position = trackPositionRef.current;
    let shouldSkipTransition = false;
    for (let i = 0; i < total; i++) {
      const result = advanceTrackPosition(position, direction, count, hasClones);
      position = result.position;
      shouldSkipTransition ||= result.skipTransition;
    }
    trackPositionRef.current = position;
    if (shouldSkipTransition) setSkipTransition(true);
    setTrackPosition(position);
  }, [count, hasClones, isSlideTransition, setMoving]);

  const goBy = useCallback((step: 1 | -1) => {
    goBySteps(step);
  }, [goBySteps]);

  const goTo = useCallback((index: number) => {
    if (count < 2) return;
    const target = wrapIndex(index, count);
    if (target === activeIndex && !isMovingRef.current) return;
    setAnimateDots(true);
    setMoving(true);
    setActiveIndex(target);
    if (isSlideTransition) {
      const position = target + (hasClones ? 1 : 0);
      trackPositionRef.current = position;
      setTrackPosition(position);
    }
  }, [activeIndex, count, hasClones, isSlideTransition, setMoving]);

  useEffect(() => {
    if (!isMoving) return;
    const timeoutId = window.setTimeout(() => {
      if (hasClones && (trackPosition === 0 || trackPosition === count + 1)) {
        setSkipTransition(true);
        setTrackPosition(activeIndex + 1);
        return;
      }
      setMoving(false);
    }, TRANSITION_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [activeIndex, count, hasClones, isMoving, setMoving, trackPosition]);

  useEffect(() => {
    if (!skipTransition) return;
    let innerId = 0;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => {
        setSkipTransition(false);
        setMoving(false);
      });
    });
    return () => {
      cancelAnimationFrame(outerId);
      cancelAnimationFrame(innerId);
    };
  }, [setMoving, skipTransition]);

  const structureKey = `${hasClones}:${count}`;
  const prevStructureKeyRef = useRef(structureKey);
  useEffect(() => {
    if (prevStructureKeyRef.current === structureKey) return;
    prevStructureKeyRef.current = structureKey;
    const nextIndex = count > 0 ? Math.min(activeIndex, count - 1) : 0;
    dragRef.current = null;
    activePointerIdRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
    setActiveIndex(nextIndex);
    setSkipTransition(true);
    setTrackPosition(nextIndex + (hasClones ? 1 : 0));
  }, [activeIndex, count, hasClones, structureKey]);

  useEffect(() => {
    if (!animateDots) return;
    const timeoutId = window.setTimeout(() => setAnimateDots(false), DOT_ANIMATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [animateDots, activeIndex]);

  useEffect(() => {
    if (!isAutoPlaying || count < 2) return;

    const intervalMs = Math.max(autoPlayIntervalS, 0.1) * 1000;
    const intervalId = window.setInterval(() => {
      if (pauseAutoOnHover && isHovered) return;
      goBy(1);
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [autoPlayIntervalS, count, goBy, isAutoPlaying, isHovered, pauseAutoOnHover]);

  const finishDrag = useCallback((event: { pointerId: number; timeStamp: number }) => {
    const state = dragRef.current;
    if (!state || state.pointerId !== event.pointerId) return;

    dragRef.current = null;
    activePointerIdRef.current = null;

    const track = trackRef.current;
    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }

    if (!state.isActive) {
      if (isSlideTransition) setDragOffset(0);
      return;
    }

    setIsDragging(false);
    setDragOffset(0);

    const isIdle = event.timeStamp - state.lastTime > DRAG_FLICK_MAX_IDLE_MS;
    const hasFlicked = !isIdle && Math.abs(state.velocity) > DRAG_FLICK_VELOCITY;
    const hasPassedDistance = state.size > 0
      && Math.abs(state.offset - state.baseOffset) > state.size * DRAG_DISTANCE_RATIO;

    if (!hasFlicked && !hasPassedDistance) return;

    const reference = hasPassedDistance ? state.offset - state.baseOffset : state.velocity;
    let steps = 1;
    if (hasPassedDistance && state.size > 0) {
      steps = Math.max(1, Math.round(Math.abs(reference) / state.size));
    }
    goBySteps(reference < 0 ? steps : -steps);
  }, [goBySteps, isSlideTransition]);

  useEffect(() => {
    const handleWindowPointerEnd = (event: PointerEvent) => {
      if (activePointerIdRef.current === null || event.pointerId !== activePointerIdRef.current) return;
      finishDrag(event);
    };

    window.addEventListener('pointerup', handleWindowPointerEnd);
    window.addEventListener('pointercancel', handleWindowPointerEnd);
    return () => {
      window.removeEventListener('pointerup', handleWindowPointerEnd);
      window.removeEventListener('pointercancel', handleWindowPointerEnd);
    };
  }, [finishDrag]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!isDragTrigger || count < 2 || !track) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    if (isMovingRef.current) {
      setMoving(false);
    }

    let baseOffset = 0;
    const list = listRef.current;
    if (isSlideTransition && list) {
      const size = isHorizontal ? list.offsetWidth : list.offsetHeight;
      if (size > 0) {
        const currentPx = readTrackTranslatePx(list, isHorizontal);
        baseOffset = currentPx + trackPositionRef.current * size;
        setDragOffset(baseOffset);
      }
    }

    track.setPointerCapture(event.pointerId);
    activePointerIdRef.current = event.pointerId;
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      axes: measureLocalAxes(track, `${P}-axis-probe`),
      size: isHorizontal ? track.offsetWidth : track.offsetHeight,
      isActive: false,
      baseOffset,
      offset: baseOffset,
      lastTime: event.timeStamp,
      velocity: 0,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    if (event.pointerType === 'mouse' && event.buttons === 0) {
      finishDrag(event);
      return;
    }
    const screenDeltaX = event.clientX - state.startClientX;
    const screenDeltaY = event.clientY - state.startClientY;
    const local = state.axes
      ? toLocalDelta(state.axes, screenDeltaX, screenDeltaY)
      : { x: screenDeltaX, y: screenDeltaY };
    const delta = isHorizontal ? local.x : local.y;
    const crossOffset = isHorizontal ? local.y : local.x;
    const offset = state.baseOffset + delta;
    if (!state.isActive) {
      if (Math.max(Math.abs(delta), Math.abs(crossOffset)) < DRAG_START_THRESHOLD_PX) return;
      if (Math.abs(crossOffset) > Math.abs(delta)) {
        const track = trackRef.current;
        if (track?.hasPointerCapture(state.pointerId)) {
          track.releasePointerCapture(state.pointerId);
        }
        dragRef.current = null;
        activePointerIdRef.current = null;
        if (isSlideTransition) setDragOffset(0);
        return;
      }
      state.isActive = true;
      setIsDragging(true);
    }
    const elapsed = event.timeStamp - state.lastTime;
    if (elapsed > 0) {
      state.velocity = (offset - state.offset) / elapsed;
      state.lastTime = event.timeStamp;
    }
    state.offset = offset;
    if (isSlideTransition) {
      setDragOffset(offset);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(event);
  };

  const trackTranslate = isHorizontal
    ? `translate3d(calc(${-trackPosition * 100}% + ${dragOffset}px), 0, 0)`
    : `translate3d(0, calc(${-trackPosition * 100}% + ${dragOffset}px), 0)`;
  const slides = hasClones ? [items[count - 1], ...items, items[0]] : items;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getCSS(P, isEditor) }} />
      <div
        className={cn(`${P}-wrapper`, {
          [`${P}-transition-reveal`]: transition === 'reveal',
          [`${P}-transition-reveal-vertical`]: transition === 'reveal' && !isHorizontal,
        })}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`${P}-slider-inner`}
          style={{
            backgroundColor: TRANSITION_BACKGROUND_COLOR && transition === 'fade in' ? TRANSITION_BACKGROUND_COLOR : 'transparent'
          }}
        >
        <div
          ref={trackRef}
          className={cn(`${P}-track`, {
            [`${P}-track-draggable`]: isDragTrigger,
            [`${P}-track-draggable-vertical`]: isDragTrigger && !isHorizontal,
          })}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={(event) => {
            if (activePointerIdRef.current === event.pointerId) {
              finishDrag(event);
            }
          }}
        >
          <div
            ref={listRef}
            className={cn(`${P}-list`, {
              [`${P}-list-slide`]: isSlideTransition,
              [`${P}-list-slide-vertical`]: isSlideTransition && !isHorizontal,
              [`${P}-list-fade`]: !isSlideTransition,
            })}
            style={isSlideTransition
              ? {
                  transform: trackTranslate,
                  transition: isDragging || skipTransition
                    ? 'none'
                    : `transform ${TRANSITION_DURATION_MS}ms ${TRANSITION_EASING}`,
                }
              : undefined}
          >
            {slides.map((item, slideIndex) => {
              const itemIndex = hasClones ? wrapIndex(slideIndex - 1, count) : slideIndex;
              const isClone = hasClones && (slideIndex === 0 || slideIndex === count + 1);
              const key = isClone
                ? `clone-${slideIndex === 0 ? 'start' : 'end'}`
                : `slide-${itemIndex}`;
              return (
                <div
                  key={key}
                  className={cn(`${P}-slide`, {
                    [`${P}-is-active`]: !isSlideTransition && itemIndex === activeIndex,
                  })}
                >
                  <div className={`${P}-slider-item`}>
                    <div className={`${P}-img-wrapper`}>
                      <img
                        className={cn(`${P}-slider-image`, {
                          [`${P}-contain`]: item.image.objectFit === 'contain',
                          [`${P}-cover`]: item.image.objectFit === 'cover'
                        })}
                        src={item.image.url} alt={item.image.name ?? ''}
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {showControls && (
          <>
            <div
              className={cn(`${P}-arrow`, {
                [`${P}-arrow-prev`]: isHorizontal,
                [`${P}-arrow-prev-vertical`]: !isHorizontal,
                [`${P}-hover-arrow`]: isControlsOnHover,
              })}
              style={{
                color: controlsColor,
                ['--arrow-hover-color' as string]: controlsHoverColor,
                ...controlsSizeStyle,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goBy(-1);
                }}
                className={`${P}-arrow-inner`}
                style={{
                  transform: `translate(${scalingValue(controlsOffsetX, isEditor)}, ${scalingValue(controlsOffsetY * (isHorizontal ? 1 : -1), isEditor)}) rotate(${isHorizontal ? '0deg' : '90deg'})`,
                }}
              >
                {controlsImgUrl && (
                  <SvgImage
                    url={controlsImgUrl}
                    fill={controlsColor}
                    hoverFill={controlsHoverColor}
                    className={cn(`${P}-arrow-img`, `${P}-mirror`)}
                    style={controlsSizeStyle}
                  />
                )}
                {!controlsImgUrl && (
                  <ArrowIcon
                    color={controlsColor}
                    className={cn(`${P}-arrow-icon`, `${P}-arrow-img`, `${P}-mirror`)}
                  />
                )}
              </button>
            </div>
            <div
              className={cn(`${P}-arrow`, {
                [`${P}-arrow-next`]: isHorizontal,
                [`${P}-arrow-next-vertical`]: !isHorizontal,
                [`${P}-hover-arrow`]: isControlsOnHover,
              })}
              style={{
                color: controlsColor,
                ['--arrow-hover-color' as string]: controlsHoverColor,
                ...controlsSizeStyle,
              }}
            >
              <button
                className={`${P}-arrow-inner`}
                onClick={(e) => {
                  e.stopPropagation();
                  goBy(1);
                }}
                style={{
                  transform: `translate(${scalingValue(controlsOffsetX * (isHorizontal ? -1 : 1), isEditor)}, ${scalingValue(controlsOffsetY, isEditor)}) rotate(${isHorizontal ? '0deg' : '90deg'})`,
                }}
              >
                {controlsImgUrl && (
                  <SvgImage
                    url={controlsImgUrl}
                    fill={controlsColor}
                    hoverFill={controlsHoverColor}
                    className={`${P}-arrow-img`}
                    style={controlsSizeStyle}
                  />
                )}
                {!controlsImgUrl && (
                  <ArrowIcon color={controlsColor} className={cn(`${P}-arrow-icon`, `${P}-arrow-img`)} />
                )}
              </button>
            </div>
          </>
        )}
        {isClickTrigger && (
          <div
            className={`${P}-click-overlay`}
            onClick={() => goBy(1)}
          />
        )}
        {showClassicNav && (
          <div
            className={cn(`${P}-pagination`, {
              [`${P}-pagination-inside-bottom`]: isHorizontal,
              [`${P}-pagination-inside-left`]: !isHorizontal,
            })}
            style={isHorizontal
              ? { bottom: scaleNav(navSizeValues.inset) }
              : { left: scaleNav(navSizeValues.inset) }}
          >
            <div
              key={`${navSize}-${direction}`}
              className={cn(`${P}-pagination-inner`, {
                [`${P}-pagination-vertical`]: !isHorizontal,
                [`${P}-animate-dots`]: animateDots,
              })}
              style={{
                backgroundColor: navBackgroundColor,
                gap: scaleNav(navSizeValues.gapInactive - navSizeValues.activeDot + navSizeValues.dot),
                ...(isHorizontal
                  ? {
                      height: scaleNav(navSizeValues.activeDot + navSizeValues.paddingY * 2),
                      paddingTop: scaleNav(navSizeValues.paddingY),
                      paddingBottom: scaleNav(navSizeValues.paddingY),
                      paddingLeft: scaleNav(navSizeValues.paddingActive),
                      paddingRight: scaleNav(navSizeValues.paddingActive),
                    }
                  : {
                      width: scaleNav(navSizeValues.activeDot + navSizeValues.paddingY * 2),
                      paddingLeft: scaleNav(navSizeValues.paddingY),
                      paddingRight: scaleNav(navSizeValues.paddingY),
                      paddingTop: scaleNav(navSizeValues.paddingActive),
                      paddingBottom: scaleNav(navSizeValues.paddingActive),
                    }),
                borderRadius: scaleNav(navSizeValues.borderRadius),
                transform: `translate(${scalingValue(PAGINATION.offset.x, isEditor)}, ${scalingValue(PAGINATION.offset.y, isEditor)})`,
              }}
            >
              {items.map((_, index) => {
                const isActive = index === activeIndex;
                const dotSize = isActive ? navSizeValues.activeDot : navSizeValues.dot;
                return (
                  <button
                    key={index}
                    onClick={() => goTo(index)}
                    className={`${P}-pagination-item`}
                    style={{
                      width: scaleNav(navSizeValues.activeDot),
                    }}
                  >
                    <div
                      className={`${P}-dot`}
                      style={{
                        backgroundColor: isActive ? navPaginationColor : navColor,
                        width: scaleNav(dotSize),
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
        </div>
        {IMAGE_CAPTION.isActive && (
          <div className={`${P}-caption-block`}>
            <div className={`${P}-caption-text-wrapper`}>
              {items.map((item, index) => (
                <div
                  key={index}
                  className={cn(`${P}-caption-text`, {
                    [`${P}-with-pointer-events`]: index === activeIndex && isEditor,
                    [`${P}-active`]: index === activeIndex,
                  })}
                  style={{
                    ...titleStyle,
                    width: TITLE_WIDTH_SETTINGS.sizing === 'auto' ? 'max-content' : scalingValue(TITLE_WIDTH_SETTINGS.width, isEditor),
                    transitionDuration: `${Math.round(TRANSITION_DURATION_MS / 2)}ms`,
                  }}
                >
                  <div
                    className={`${P}-caption-text-inner`}
                    style={{
                      '--link-color': linkColor,
                      '--link-hover-color': linkColor,
                      position: 'relative',
                      top: scalingValue(IMAGE_CAPTION.offset.y, isEditor),
                      left: scalingValue(IMAGE_CAPTION.offset.x, isEditor)
                    } as React.CSSProperties}
                  >
                    <RichTextRenderer content={item.imageCaption} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ArrowIcon({ color, className }: { color: string, className: string }) {
  return (
    <svg viewBox="0 0 10 18" className={className}>
      <g id="Symbols" stroke="none" strokeWidth="1" fillRule="evenodd">
          <path d="M-3.70710678,4.29289322 C-3.34662282,3.93240926 -2.77939176,3.90467972 -2.38710056,4.20970461 L-2.29289322,4.29289322 L5,11.585 L12.2928932,4.29289322 C12.6533772,3.93240926 13.2206082,3.90467972 13.6128994,4.20970461 L13.7071068,4.29289322 C14.0675907,4.65337718 14.0953203,5.22060824 13.7902954,5.61289944 L13.7071068,5.70710678 L5.70710678,13.7071068 C5.34662282,14.0675907 4.77939176,14.0953203 4.38710056,13.7902954 L4.29289322,13.7071068 L-3.70710678,5.70710678 C-4.09763107,5.31658249 -4.09763107,4.68341751 -3.70710678,4.29289322 Z" id="Shape-Copy" fill={color} transform="translate(5, 9) rotate(-90) translate(-5, -9)"></path>
      </g>
    </svg>
  );
}
