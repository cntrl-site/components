import { CommonComponentProps } from '../props';
import { TextStyles } from '../utils/textStylesToCss';

export type FAQContentItem = {
  question?: string;
  answer?: any[];
};

export type FAQSettings = {
  wrapperWidth?: number;
  cellMinHeight?: number;
  dividerWidth?: number;
  dividerStyle?: 'solid' | 'dashed' | 'dotted';
  entryHoverEffect?: 'none' | 'default';
  autoclose?: 'on' | 'off';
  icon?: string | null;
  iconMaxWidth?: number;
  iconPaddingRight?: number;
  iconAnimation?: 'rotate 180' | 'rotate 90' | 'rotate 45';
  questionColor?: string;
  answerColor?: string;
  dividerColor?: string;
  iconColor?: string;
  questionHoverColor?: string;
  iconHoverColor?: string;
  iconActiveColor?: string;
  dividerHoverColor?: string;
  questionFontFamily?: string;
  questionFontSettings?: { fontWeight: number; fontStyle: string };
  questionFontSize?: number;
  questionLineHeight?: number;
  questionLetterSpacing?: number;
  questionWordSpacing?: number;
  questionTextAppearance?: TextStyles['textAppearance'];
  answerFontFamily?: string;
  answerFontSettings?: { fontWeight: number; fontStyle: string };
  answerFontSize?: number;
  answerLineHeight?: number;
  answerLetterSpacing?: number;
  answerWordSpacing?: number;
  answerTextAppearance?: TextStyles['textAppearance'];
  questionPaddingLeft?: number;
  questionPaddingTop?: number;
  questionPaddingBottom?: number;
  answerPaddingLeft?: number;
  answerPaddingRight?: number;
  answerPaddingTop?: number;
  answerPaddingBottom?: number;
};

export type FAQProps = {
  settings: FAQSettings;
  content?: FAQContentItem[];
  isEditor?: boolean;
  isPreviewMode?: boolean;
  isEditMode?: boolean;
  activeEvent: string | undefined;
  onUpdateSettings?: (settings: FAQSettings) => void;
} & CommonComponentProps;

export type ColorKeys =
  | 'questionColor'
  | 'answerColor'
  | 'dividerColor'
  | 'iconColor'
  | 'questionHoverColor'
  | 'iconHoverColor'
  | 'iconActiveColor'
  | 'dividerHoverColor';
