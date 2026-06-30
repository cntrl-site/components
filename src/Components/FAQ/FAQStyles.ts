import { PANEL_ANIM_MS } from './FAQConstants';

function sv(px: number): string {
  return `calc(var(--cntrl-article-width, 100vw) * ${px / 1440})`;
}

export function getCSS(P: string): string {
  return `
.${P}-wrapper {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.${P}-item {
  display: flex;
  flex-direction: column;
  position: relative;
  border-bottom-width: var(--${P}-divider-width);
  border-bottom-style: var(--${P}-divider-style);
  border-bottom-color: var(--${P}-divider-color);
}
.${P}-item:first-child {
  border-top-width: var(--${P}-divider-width);
  border-top-style: var(--${P}-divider-style);
  border-top-color: var(--${P}-divider-color);
}
.${P}-wrapper.${P}-entry-hover-default .${P}-item {
  transition: border-color 250ms;
}
.${P}-wrapper.${P}-entry-hover-default .${P}-question-button {
  transition: color 250ms;
}
.${P}-wrapper.${P}-entry-hover-default .${P}-item:not(.${P}-item-open):hover,
.${P}-wrapper.${P}-entry-hover-default .${P}-item:has(+ .${P}-item:not(.${P}-item-open):hover),
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-item:not(.${P}-item-open) {
  border-bottom-color: var(--${P}-divider-hover-color, var(--${P}-divider-color));
}
.${P}-wrapper.${P}-entry-hover-default .${P}-item:not(.${P}-item-open):hover:first-child,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-item:not(.${P}-item-open):first-child {
  border-top-color: var(--${P}-divider-hover-color, var(--${P}-divider-color));
}
.${P}-wrapper.${P}-entry-hover-default .${P}-item:not(.${P}-item-open):hover .${P}-question-button,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-item:not(.${P}-item-open) .${P}-question-button {
  color: var(--${P}-question-hover-color, var(--${P}-question-color));
}
.${P}-question-button {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  color: var(--${P}-question-color);
  font: inherit;
  padding-left: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.${P}-question-button:focus,
.${P}-question-button:focus-visible {
  outline: none;
}
.${P}-question-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${sv(20)};
  width: 100%;
  min-width: 0;
  min-height: var(--${P}-question-min-height, unset);
}
.${P}-editor .${P}-question-button {
  cursor: default;
}
.${P}-question {
  margin: 0;
  flex: 1;
  min-width: 0;
  color: inherit;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.${P}-text-tight-leading {
  display: block;
  flex-shrink: 0;
  padding-top: var(--${P}-text-leading-gap, 0);
  padding-bottom: var(--${P}-text-leading-gap, 0);
}
.${P}-icon {
  flex-shrink: 0;
  width: var(--${P}-icon-max-width);
  height: var(--${P}-icon-max-width);
  position: relative;
  transition: transform ${PANEL_ANIM_MS}ms ease;
}
.${P}-icon-custom {
  display: flex;
  align-items: center;
  justify-content: center;
}
.${P}-icon-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: background-color 250ms;
}
.${P}-wrapper.${P}-entry-hover-default .${P}-item:not(.${P}-item-open):hover .${P}-icon-image,
.${P}-wrapper.${P}-entry-hover-default.${P}-state-hover .${P}-item:not(.${P}-item-open) .${P}-icon-image {
  --fill: var(--${P}-icon-hover-color, var(--${P}-icon-color)) !important;
  --hover-fill: var(--${P}-icon-hover-color, var(--${P}-icon-color)) !important;
}
.${P}-item-open .${P}-icon-image {
  --fill: var(--${P}-icon-active-color, var(--${P}-icon-color)) !important;
  --hover-fill: var(--${P}-icon-active-color, var(--${P}-icon-color)) !important;
}
.${P}-item-open .${P}-icon-anim-45 {
  transform: rotate(45deg);
}
.${P}-item-open .${P}-icon-anim-90 {
  transform: rotate(90deg);
}
.${P}-item-open .${P}-icon-anim-180 {
  transform: rotate(180deg);
}
.${P}-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows ${PANEL_ANIM_MS}ms ease;
  pointer-events: none;
}
.${P}-item-open .${P}-panel {
  pointer-events: auto;
}
.${P}-item-open .${P}-panel {
  grid-template-rows: 1fr;
}
.${P}-panel-inner {
  overflow: hidden;
  min-height: 0;
}
.${P}-answer {
  color: var(--${P}-answer-color);
}
.${P}-answer-text {
  margin: 0;
  color: inherit;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.${P}-answer-text a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.1em;
}
.${P}-padding-handle {
  width: 100%;
  flex-shrink: 0;
  background: transparent;
}
.${P}-question-controls,
.${P}-answer-controls {
  position: relative;
}
.${P}-padding-control-handle {
  background: transparent;
}
.${P}-padding-control-handle[data-controls-axis="x"][data-controls-variant="column-padding"]::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 12px;
  background: #FF5C02;
  border: 1px solid #FFFFFF;
  border-radius: 5px;
  box-sizing: border-box;
  pointer-events: none;
}
.${P}-padding-control-handle[data-controls-axis="y"]::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 4px;
  background: #FF5C02;
  border: 1px solid #FFFFFF;
  border-radius: 5px;
  box-sizing: border-box;
  pointer-events: none;
}
.${P}-padding-control-handle[data-controls-variant="row-padding"][data-controls-axis="y"]::after {
  left: 20px;
  transform: translateY(-50%);
}
`;
}
