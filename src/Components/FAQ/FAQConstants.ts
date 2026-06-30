import type { ColorKeys } from './FAQTypes';

export const PANEL_ANIM_MS = 300;
export const PADDING_HANDLE_SIZE = 0.004;

export const COLOR_VAR_MAP: Record<ColorKeys, string> = {
  questionColor: 'question-color',
  answerColor: 'answer-color',
  dividerColor: 'divider-color',
  iconColor: 'icon-color',
  questionHoverColor: 'question-hover-color',
  iconHoverColor: 'icon-hover-color',
  iconActiveColor: 'icon-active-color',
  dividerHoverColor: 'divider-hover-color',
};

export const STATE_KEYS = ['hover', 'focus', 'filled', 'success', 'error'] as const;
