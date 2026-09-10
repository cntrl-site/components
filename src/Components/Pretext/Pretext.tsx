import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { CommonComponentProps } from '../props';
import { scalingValue, useScopedStyles } from '../utils/index';
import { TextStyles, normalizeFontFamilyCssValue } from '../utils/textStylesToCss';
import { EDIT_VIEW_BOX } from './vecContours';
import { PretextColumn } from './PretextColumn';
import {
  parsePathNodes,
  pathExceedsEditViewBox,
  serializeContours,
} from './vecContours';

export const SHAPE_IDS = [
  'diamond',
  'parallelogram',
  'vase',
  'circle',
  'shield',
  'bobbin',
  'custom',
] as const;

export type ShapeId = typeof SHAPE_IDS[number];

export type Align = 'left' | 'center' | 'right' | 'justify';

export type PathFit = 'stretch' | 'viewbox';

export type RichLeaf = {
  text?: string;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: string;
  textDecoration?: string;
  textTransform?: string;
  fontVariant?: string;
  verticalAlign?: string;
};

export type RichLink = {
  type: 'link';
  value?: string;
  target?: string;
  children?: RichNode[];
};

export type RichNode = RichLeaf | RichLink;

export type RichBlock = {
  type?: string;
  children?: RichNode[];
};

export type PretextContentItem = {
  text?: RichBlock[];
};

export type PretextSettings = {
  shape?: ShapeId;
  customPath?: string;
  pathFit?: PathFit;
  pathViewBox?: string;
  pathSnap?: number;
  shapeMode?: 'A' | 'B';
  overflowMode?: 'clip' | 'visible';
  fitText?: 'on' | 'off';
  dropCapLines?: number;
  dropCapSize?: number;
  image?: string | null;
  imageFocalX?: number;
  imageFocalY?: number;
  imageScale?: number;
  backgroundColor?: string;
  textColor?: string;
  linkColor?: string;
  textFontFamily?: string;
  textFontSettings?: { fontWeight: number; fontStyle: string };
  textFontSize?: number;
  textLineHeight?: number;
  textLetterSpacing?: number;
  textWordSpacing?: number;
  textAlign?: Align;
  textTextAppearance?: TextStyles['textAppearance'];
};

export type PretextProps = {
  settings?: PretextSettings;
  content?: PretextContentItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
  isSelected?: boolean;
  onUpdateSettings?: (settings: PretextSettings) => void;
} & CommonComponentProps;

export type Pt = { x: number; y: number };
export type Ring = Pt[];
export type Span = { x0: number; x1: number };

export type ViewBox = { x: number; y: number; width: number; height: number };

const DEFAULT_VIEW_BOX: ViewBox = { x: 0, y: 0, width: 100, height: 100 };

const parseViewBox = (value?: string): ViewBox => {
  const numbers = (value ?? '').trim().split(/[\s,]+/).map(Number).filter(entry => !Number.isNaN(entry));
  if (numbers.length < 4 || numbers[2] <= 0 || numbers[3] <= 0) return DEFAULT_VIEW_BOX;
  return { x: numbers[0], y: numbers[1], width: numbers[2], height: numbers[3] };
};

export type VecNode = {
  p: Pt;
  in?: Pt | null;
  out?: Pt | null;
};

export type VecContour = {
  nodes: VecNode[];
  closed: boolean;
};

export type EditStage = 'none' | 'shape' | 'image';

export type ImageTransform = { focalX: number; focalY: number; scale: number };

export type PathChangeOptions = {
  carryImage?: boolean;
};

export type PathCommitOptions = {
  preserveShape?: boolean;
};

export type ScaleCorner = 'nw' | 'ne' | 'se' | 'sw';

export type PathSelection = { contour: number; node: number };

export type PathDrag = {
  kind: 'anchor' | 'in' | 'out';
  contour: number;
  node: number;
  pointerId: number;
  origin: Pt;
  clientOrigin: Pt;
  anchor: Pt;
  center: Pt | null;
  mirror: boolean;
  toggleOnRelease: boolean;
  moved: boolean;
};

export type ShapeDrag = {
  pointerId: number;
  origin: Pt;
  startContours: VecContour[];
  bbox: { minX: number; minY: number; maxX: number; maxY: number };
  moved: boolean;
};

export type GroupDrag = {
  pointerId: number;
  origin: Pt;
  startContours: VecContour[];
  selection: PathSelection[];
  moved: boolean;
};

export type ShapeScale = {
  pointerId: number;
  corner: ScaleCorner;
  origin: Pt;
  startDistance: number;
  startContours: VecContour[];
  moved: boolean;
};

export type SnapGuide = { kind: 'align' | 'angle' | 'center'; a: Pt; b: Pt };

export type ColumnMetrics = {
  widths: number[];
  spaceWidth: number;
  lineHeight: number;
  capWidth: number;
};

export type ColumnProps = {
  P: string;
  item: PretextContentItem;
  shape: ShapeId;
  customPath: string;
  pathFit: PathFit;
  viewBox: ViewBox;
  mode: 'contain' | 'avoid';
  align: Align;
  allowOverflow: boolean;
  fitEnabled: boolean;
  scale: number;
  onFitScale: (scale: number) => void;
  dropCapLines: number;
  dropCapSize: number;
  showGuides: boolean;
  typography: React.CSSProperties;
  imageUrl?: string | null;
  imageFocalX: number;
  imageFocalY: number;
  imageScale: number;
  imageCustomPath: string;
  pathDragActive: boolean;
  pathCarryImage: boolean;
  onCarryImageConsumed?: () => void;
  pathEditor?: PathEditorBinding | null;
  imageEditor?: ImageEditorBinding | null;
};

export type PathEditorBinding = {
  contours: VecContour[] | null;
  snap: number;
  needsConversion: boolean;
  onConvert: (contours: VecContour[]) => void;
  onChange: (contours: VecContour[], options?: PathChangeOptions) => void;
  onCommit: (contours: VecContour[], options?: PathCommitOptions) => void;
};

export type ImageEditorBinding = {
  onChange: (next: ImageTransform) => void;
  onCommit: (next: ImageTransform) => void;
};

export type FrozenShapeImage = {
  rings: Ring[];
  bounds: { x: number; y: number; width: number; height: number };
  focalX: number;
  focalY: number;
  scale: number;
  customPath: string;
  shape: string;
};

export type PathEditorProps = {
  P: string;
  box: { width: number; height: number };
  viewBox: ViewBox;
  contours: VecContour[];
  snap: number;
  stretchToBox: boolean;
  uniformStretch?: boolean;
  stage: EditStage;
  onStageChange: (stage: EditStage) => void;
  onSelectionChange?: (hasSelection: boolean) => void;
  onChange: (contours: VecContour[], options?: PathChangeOptions) => void;
  onCommit: (contours: VecContour[], options?: PathCommitOptions) => void;
};

export type ImageEditorProps = {
  P: string;
  box: { width: number; height: number };
  bounds: { x: number; y: number; width: number; height: number };
  natural: { width: number; height: number } | null;
  imageUrl?: string | null;
  maskPath: string;
  stage: EditStage;
  onStageChange: (stage: EditStage) => void;
  focalX: number;
  focalY: number;
  scale: number;
  onChange: (next: ImageTransform) => void;
  onCommit: (next: ImageTransform) => void;
};

const getCSS = (P: string): string => `
.${P}-wrapper {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  height: 100%;
  min-height: 1px;
  color: var(--${P}-text-color, #000000);
}
.${P}-column {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  height: 100%;
}
.${P}-shape-fill {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}
.${P}-shape-fill-path {
  fill: var(--${P}-background-color, transparent);
}
.${P}-flow {
  position: absolute;
  inset: 0;
}
.${P}-clip {
  overflow: hidden;
}
.${P}-line {
  position: absolute;
  white-space: pre;
  box-sizing: border-box;
}
.${P}-line-justify {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: baseline;
}
.${P}-link {
  color: var(--${P}-link-color, inherit);
  text-decoration: underline;
}
.${P}-drop-cap {
  position: absolute;
  top: 0;
  left: 0;
  white-space: pre;
  pointer-events: none;
}
.${P}-measure {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
  pointer-events: none;
  white-space: pre;
  width: max-content;
  --${P}-fit: 1;
}
.${P}-measure > span {
  display: inline-block;
}
.${P}-guides {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}
.${P}-guides polygon {
  fill: none;
  stroke: #FF5C02;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
.${P}-editor {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  overflow: visible;
  pointer-events: none;
  touch-action: none;
  outline: none;
}
.${P}-editor-armed {
  pointer-events: auto;
}
.${P}-editor-surface {
  fill: transparent;
  cursor: default;
  pointer-events: none;
}
.${P}-editor-armed .${P}-editor-surface {
  pointer-events: auto;
}
.${P}-editor-hit {
  fill: none;
  stroke: transparent;
  stroke-width: 28;
  pointer-events: none;
  cursor: copy;
}
.${P}-editor-armed .${P}-editor-hit {
  pointer-events: stroke;
}
.${P}-editor-grab {
  fill: transparent;
  stroke: none;
  pointer-events: auto;
  cursor: grab;
}
.${P}-editor-grab:active {
  cursor: grabbing;
}
.${P}-editor-outline {
  fill: none;
  stroke: #FF5C02;
  stroke-width: 1;
  pointer-events: none;
}
.${P}-editor-body {
  fill: transparent;
  pointer-events: none;
  cursor: move;
}
.${P}-editor-armed .${P}-editor-body {
  pointer-events: fill;
}
.${P}-editor-body:active {
  cursor: grabbing;
}
.${P}-editor-bbox {
  fill: none;
  stroke: #FF5C02;
  stroke-width: 1;
  stroke-dasharray: 4 3;
  opacity: 0.55;
  pointer-events: none;
}
.${P}-editor-scale {
  fill: #FFFFFF;
  stroke: #FF5C02;
  stroke-width: 1.5;
  pointer-events: none;
}
.${P}-editor-scale-grab {
  fill: transparent;
  stroke: none;
  pointer-events: auto;
  cursor: nwse-resize;
}
.${P}-editor-scale-grab-nesw {
  cursor: nesw-resize;
}
.${P}-editor-snap {
  stroke: #00B2FF;
  stroke-width: 1;
  pointer-events: none;
}
.${P}-editor-snap-angle {
  stroke-dasharray: 4 3;
}
.${P}-editor-snap-center {
  stroke-dasharray: 2 4;
  opacity: 0.8;
}
.${P}-editor-handle-line {
  stroke: #FF5C02;
  stroke-width: 1;
  opacity: 0.5;
  pointer-events: none;
}
.${P}-editor-handle {
  fill: #FF5C02;
  stroke: #FFFFFF;
  stroke-width: 1;
  pointer-events: none;
}
.${P}-editor-anchor {
  fill: #FFFFFF;
  stroke: #FF5C02;
  stroke-width: 1.5;
  pointer-events: none;
}
.${P}-editor-anchor-selected {
  fill: #FF5C02;
}
.${P}-editor-ghost {
  opacity: 0.3;
  pointer-events: none;
}
.${P}-editor-image-bounds {
  fill: none;
  stroke: #FF5C02;
  stroke-width: 1;
  opacity: 0.7;
  pointer-events: none;
}
.${P}-a11y {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}
`;

const DROP_CAP_SIZE_DEFAULT = 1;

export { EDIT_VIEW_BOX } from './vecContours';
export {
  mapContours,
  scaleContours,
  parsePathNodes,
  serializeContours,
  flattenContours,
  ringsToContours,
  settingsForEditablePreset,
  moveNodeTo,
  moveSelectedNodesBy,
  removeContourNodes,
  setNodeHandle,
  clearNodeHandle,
  insertNodeOnSegment,
  removeContourNode,
  toggleNodeSmooth,
  nearestSegmentHit,
} from './vecContours';

export function Pretext({ settings, content, isEditor, isPreviewMode, isEditMode, isSelected, onUpdateSettings }: PretextProps) {
  const { prefix: P } = useScopedStyles();
  const scopedCss = useMemo(() => getCSS(P), [P]);
  const editor = isEditor ?? false;
  const selected = Boolean(isSelected) || Boolean(isEditMode);

  const item = useMemo<PretextContentItem>(
    () => (Array.isArray(content) ? content[0] ?? {} : {}),
    [content],
  );

  const shape = settings?.shape ?? 'custom';
  const customPath = settings?.customPath ?? '';
  const pathFit = settings?.pathFit ?? 'stretch';
  const viewBox = useMemo(() => parseViewBox(settings?.pathViewBox), [settings?.pathViewBox]);
  const mode = settings?.shapeMode === 'B' ? 'avoid' : 'contain';
  const align = settings?.textAlign ?? 'left';
  const allowOverflow = (settings?.overflowMode ?? 'clip') === 'visible';
  const fitEnabled = (settings?.fitText ?? 'off') === 'on';
  const dropCapSize = settings?.dropCapSize ?? DROP_CAP_SIZE_DEFAULT;
  const dropCapLines = Math.max(1, Math.round(settings?.dropCapLines ?? dropCapSize));
  const showGuides = editor && selected && !isPreviewMode;

  const [isItemTransforming, setIsItemTransforming] = useState(false);
  useEffect(() => {
    if (!editor || !selected) {
      setIsItemTransforming(false);
      return;
    }
    const start = () => setIsItemTransforming(true);
    const end = () => setIsItemTransforming(false);
    const startEvents = [
      'ArticleEditor.Item:drag-start',
      'ArticleEditor.Selection:resize-start',
      'ArticleEditor.Selection:move-start',
    ] as const;
    const endEvents = [
      'ArticleEditor.Item:drag-end',
      'ArticleEditor.Selection:resize-end',
      'ArticleEditor.Selection:move-end',
    ] as const;
    for (const name of startEvents) window.addEventListener(name, start);
    for (const name of endEvents) window.addEventListener(name, end);
    return () => {
      for (const name of startEvents) window.removeEventListener(name, start);
      for (const name of endEvents) window.removeEventListener(name, end);
    };
  }, [editor, selected]);

  const pathEditing = editor && selected && !isPreviewMode
    && typeof onUpdateSettings === 'function';
  const shapeOverlayVisible = !isItemTransforming;
  const pathSnap = Math.max(0, settings?.pathSnap ?? 0);
  const settingsRef = useRef(settings ?? {});
  const settingsPropsKeyRef = useRef('');
  const settingsPropsKey = [
    settings?.customPath,
    settings?.shape,
    settings?.pathFit,
    settings?.pathViewBox,
    settings?.imageScale,
    settings?.imageFocalX,
    settings?.imageFocalY,
    settings?.image,
  ].join('\0');
  if (settingsPropsKey !== settingsPropsKeyRef.current) {
    settingsPropsKeyRef.current = settingsPropsKey;
    settingsRef.current = settings ?? {};
  } else if (settings) {
    const {
      customPath: _customPath,
      shape: _shape,
      pathFit: _pathFit,
      pathViewBox: _pathViewBox,
      imageScale: _imageScale,
      imageFocalX: _imageFocalX,
      imageFocalY: _imageFocalY,
      image: _image,
      ...ungated
    } = settings;
    const prev = settingsRef.current;
    for (const key of Object.keys(ungated) as Array<keyof typeof ungated>) {
      if (prev[key] === ungated[key]) continue;
      settingsRef.current = { ...prev, ...ungated };
      break;
    }
  }
  const [draft, setDraft] = useState<{ base: string; serialized: string; contours: VecContour[] } | null>(null);
  const [pathDragActive, setPathDragActive] = useState(false);
  const [pathCarryImage, setPathCarryImage] = useState(false);
  const onCarryImageConsumed = useCallback(() => setPathCarryImage(false), []);

  const liveShape = settingsRef.current.shape ?? shape;
  const imageCustomPath = useMemo(() => {
    if (!draft || draft.serialized === customPath) return customPath;
    return draft.serialized;
  }, [draft, customPath]);

  useEffect(() => {
    if (!pathEditing) {
      setPathDragActive(false);
      setPathCarryImage(false);
    }
  }, [pathEditing]);

  useEffect(() => {
    if (!draft || pathDragActive) return;
    if (draft.serialized === customPath) setDraft(null);
  }, [draft, customPath, pathDragActive]);

  const editContours = useMemo(() => {
    if (!pathEditing) return null;
    if (draft && (draft.base === customPath || draft.serialized === customPath)) return draft.contours;
    const parsed = parsePathNodes(customPath);
    return parsed.length ? parsed : null;
  }, [pathEditing, draft, customPath]);

  const isEditablePath = Boolean(
    pathFit === 'viewbox'
    && (settings?.pathViewBox ?? '') === EDIT_VIEW_BOX
    && editContours
    && (shape === 'circle' || !pathExceedsEditViewBox(editContours, viewBox)),
  );

  const writePath = useCallback((next: VecContour[], commit: boolean, options?: PathCommitOptions) => {
    const serialized = serializeContours(next);
    setDraft(previous => ({
      base: previous && (previous.base === customPath || previous.serialized === customPath)
        ? previous.base
        : customPath,
      serialized,
      contours: next,
    }));
    if (commit) {
      const latest = settingsRef.current;
      const nextShape = options?.preserveShape ? latest.shape : 'custom';
      const nextSettings = { ...latest, shape: nextShape, customPath: serialized };
      settingsRef.current = nextSettings;
      onUpdateSettings?.(nextSettings);
    }
  }, [customPath, onUpdateSettings]);

  const pathEditor = useMemo<PathEditorBinding | null>(() => {
    if (!pathEditing) return null;
    return {
      contours: isEditablePath ? editContours : null,
      snap: pathSnap,
      needsConversion: !isEditablePath,
      onConvert: (next: VecContour[]) => {
        const serialized = serializeContours(next);
        setDraft({ base: serialized, serialized, contours: next });
        const nextSettings = {
          ...settingsRef.current,
          pathFit: 'viewbox' as const,
          pathViewBox: EDIT_VIEW_BOX,
          customPath: serialized,
        };
        settingsRef.current = nextSettings;
        onUpdateSettings?.(nextSettings);
      },
      onChange: (next: VecContour[], options?: PathChangeOptions) => {
        setPathDragActive(true);
        setPathCarryImage(Boolean(options?.carryImage));
        writePath(next, false);
      },
      onCommit: (next: VecContour[], options?: PathCommitOptions) => {
        writePath(next, true, options);
        setPathDragActive(false);
      },
    };
  }, [pathEditing, isEditablePath, editContours, pathSnap, onUpdateSettings, writePath]);

  const hasShapeImage = mode === 'avoid' && Boolean(settings?.image);
  const committedImageTransform = useMemo<ImageTransform>(() => ({
    focalX: settings?.imageFocalX ?? 0.5,
    focalY: settings?.imageFocalY ?? 0.5,
    scale: settings?.imageScale ?? 1,
  }), [settings?.imageFocalX, settings?.imageFocalY, settings?.imageScale]);
  const [imageDraft, setImageDraft] = useState<ImageTransform | null>(null);
  const liveImageTransform = imageDraft ?? committedImageTransform;

  const handleImageChange = useCallback((next: ImageTransform) => setImageDraft(next), []);
  const handleImageCommit = useCallback((next: ImageTransform) => {
    setImageDraft(next);
    const nextSettings = {
      ...settingsRef.current,
      imageFocalX: next.focalX,
      imageFocalY: next.focalY,
      imageScale: next.scale,
    };
    settingsRef.current = nextSettings;
    onUpdateSettings?.(nextSettings);
  }, [onUpdateSettings]);

  useEffect(() => {
    if (!imageDraft) return;
    if (
      Math.abs(imageDraft.focalX - committedImageTransform.focalX) < 1e-9
      && Math.abs(imageDraft.focalY - committedImageTransform.focalY) < 1e-9
      && Math.abs(imageDraft.scale - committedImageTransform.scale) < 1e-9
    ) {
      setImageDraft(null);
    }
  }, [imageDraft, committedImageTransform]);

  const imageEditor = useMemo<ImageEditorBinding | null>(() => {
    if (!pathEditing || !hasShapeImage) return null;
    return { onChange: handleImageChange, onCommit: handleImageCommit };
  }, [pathEditing, hasShapeImage, handleImageChange, handleImageCommit]);

  const [fitScale, setFitScale] = useState<number | undefined>(undefined);
  const fitScaleRef = useRef<number | undefined>(undefined);

  const handleFitScale = useCallback((value: number) => {
    const current = fitScaleRef.current;
    if (current !== undefined && Math.abs(current - value) < 0.005) return;
    fitScaleRef.current = value;
    setFitScale(value);
  }, []);

  const sharedScale = useMemo(() => (
    fitEnabled && typeof fitScale === 'number' ? fitScale : 1
  ), [fitScale, fitEnabled]);

  const fitVar = (value: string) => `calc(${value} * var(--${P}-fit, 1))`;

  const typography = useMemo<React.CSSProperties>(() => {
    const textFontSize = settings?.textFontSize ?? 0.012;
    const textLineHeight = Math.max(settings?.textLineHeight ?? textFontSize, textFontSize);
    return {
    fontFamily: normalizeFontFamilyCssValue(settings?.textFontFamily),
    fontWeight: settings?.textFontSettings?.fontWeight,
    fontStyle: settings?.textFontSettings?.fontStyle,
    fontSize: fitVar(scalingValue(textFontSize, editor)),
    lineHeight: fitVar(scalingValue(textLineHeight, editor)),
    letterSpacing: fitVar(scalingValue(settings?.textLetterSpacing ?? 0, editor)),
    wordSpacing: fitVar(scalingValue(settings?.textWordSpacing ?? 0, editor)),
    textTransform: settings?.textTextAppearance?.textTransform as React.CSSProperties['textTransform'],
    textDecoration: settings?.textTextAppearance?.textDecoration,
    fontVariant: settings?.textTextAppearance?.fontVariant,
  };
  }, [settings, editor, P]);

  const colorVars = {
    [`--${P}-text-color`]: settings?.textColor ?? '#000000',
    [`--${P}-link-color`]: settings?.linkColor ?? settings?.textColor ?? '#000000',
    [`--${P}-background-color`]: settings?.backgroundColor ?? 'transparent',
  } as React.CSSProperties;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      <div
        className={`${P}-wrapper`}
        style={{
          ...colorVars,
        }}
      >
        <PretextColumn
          P={P}
          item={item}
          shape={liveShape}
          customPath={customPath}
          pathFit={pathFit}
          viewBox={viewBox}
          mode={mode}
          align={align}
          allowOverflow={allowOverflow}
          fitEnabled={fitEnabled}
          scale={sharedScale}
          onFitScale={handleFitScale}
          dropCapLines={dropCapLines}
          dropCapSize={dropCapSize}
          showGuides={(showGuides || pathEditing) && shapeOverlayVisible}
          typography={typography}
          imageUrl={mode === 'avoid' ? settings?.image : null}
          imageFocalX={liveImageTransform.focalX}
          imageFocalY={liveImageTransform.focalY}
          imageScale={liveImageTransform.scale}
          imageCustomPath={imageCustomPath}
          pathDragActive={pathDragActive}
          pathCarryImage={pathCarryImage}
          onCarryImageConsumed={onCarryImageConsumed}
          pathEditor={shapeOverlayVisible ? pathEditor : null}
          imageEditor={shapeOverlayVisible ? imageEditor : null}
        />
      </div>
    </>
  );
}
