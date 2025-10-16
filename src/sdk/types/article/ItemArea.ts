export enum AnchorSide {
  Top = 'top',
  Bottom = 'bottom',
  Center = 'center'
}

export enum PositionType {
  SectionBased = 'section-based',
  ScreenBased = 'screen-based'
}

export enum AreaAnchor {
  TopLeft = 'top-left',
  TopCenter = 'top-center',
  TopRight = 'top-right',
  MiddleLeft = 'middle-left',
  MiddleCenter = 'middle-center',
  MiddleRight = 'middle-right',
  BottomLeft = 'bottom-left',
  BottomCenter = 'bottom-center',
  BottomRight = 'bottom-right'
}

export enum DimensionMode {
  ControlUnits = 'control-units',
  Relative = 'relative',
}

export interface ItemArea {
  top: number;
  left: number;
  width: number;
  height: number;
  positionType: PositionType;
  zIndex: number;
  angle: number;
  anchorSide?: AnchorSide;
  scale: number;
  scaleAnchor: AreaAnchor;
}
