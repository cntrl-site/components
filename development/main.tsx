import React from 'react';
import ReactDOM from 'react-dom/client';
import { Grid } from '../src/Components/Grid/Grid';
import { TextElementStyles } from '../src/types/TextElementStyles';

const defaultTextStyle: TextElementStyles = {
  fontSettings: { fontFamily: 'system-ui, sans-serif', fontWeight: 400, fontStyle: 'normal' },
  widthSettings: { width: 0, sizing: 'auto' },
  letterSpacing: 0,
  textAlign: 'left',
  wordSpacing: 0,
  fontSizeLineHeight: { fontSize: 0, lineHeight: 0.02 },
  textAppearance: { textTransform: 'none', textDecoration: 'none', fontVariant: 'normal' },
  color: '#000',
};

const content = [
  {
    image: {
      url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-1.png',
      objectFit: 'cover' as const
    },
    title: [
      {
        type: 'paragraph',
        children: [{ text: 'Connect devices to enhance productivity' }]
      }
    ],
    subtitle: [
      {
        type: 'paragraph',
        children: [{ text: 'Existence unfolds; meaning weaves itself into the fabric of awareness.' }]
      }
    ],
    description: [],
    link: 'https://www.google.com'
  },
  {
    image: {
      url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-2.png',
      objectFit: 'cover' as const
    },
    title: [
      {
        type: 'paragraph',
        children: [{ text: 'Innovative solutions drive digital transformation' }]
      }
    ],
    subtitle: [
      {
        type: 'paragraph',
        children: [{ text: 'Knowing oneself unveils truth, while doubt illuminates paths unexplored.' }]
      }
    ],
    description: [],
    link: 'https://www.google.com'
  },
  {
    image: {
      url: 'https://cdn.cntrl.site/component-assets/Control-slider-default-picture-3.png',
      objectFit: 'cover' as const
    },
    title: [
      {
        type: 'paragraph',
        children: [{ text: 'Data transforms our everyday life' }]
      }
    ],
    subtitle: [
      {
        type: 'paragraph',
        children: [{ text: 'Questions reveal truths that silence conceals. Understanding begins within.' }]
      }
    ],
    description: [],
    link: 'https://www.google.com'
  },
  {
    image: {
      url: 'https://cdn.cntrl.site/projects/01JJKT02AWY2FGN2QJ7A173RNZ/articles-assets/01K7ERQK9211QXBE9W284ZNKB8.png',
      objectFit: 'cover' as const
    },
    title: [
      {
        type: 'paragraph',
        children: [{ text: 'Existence questions the nature itself.' }]
      }
    ],
    subtitle: [
      {
        type: 'paragraph',
        children: [{ text: 'Truth reflects the labyrinth of understanding woven into existence.' }]
      }
    ],
    description: [],
    link: 'https://www.google.com'
  }
];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Grid
      settings={{
        grid: {
          entriesPerRow: 2,
          rowGap: 0.05,
          columnGap: 0.007,
        },
        media: {
          widthType: 'auto',
          maxWidth: 0,
          aspectRatioMode: 'fixed',
          aspectWidth: 16,
          aspectHeight: 9,
        },
      }}
      content={content}
      styles={{
        title: { ...defaultTextStyle, fontSizeLineHeight: { fontSize: 0.025, lineHeight: 0.025 } },
        subtitle: { ...defaultTextStyle, fontSizeLineHeight: { fontSize: 0.025, lineHeight: 0.025 }, color: '#666' },
        description: { ...defaultTextStyle, fontSizeLineHeight: { fontSize: 0.025, lineHeight: 0.025 } },
      }}
    />
  </React.StrictMode>
);
