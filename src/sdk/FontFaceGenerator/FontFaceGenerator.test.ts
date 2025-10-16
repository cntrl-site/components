import { FontFaceGenerator } from './FontFaceGenerator';
import { CustomFont, FontFileTypes } from '../types/project/Fonts';

describe('FontFaceGenerator', () => {
  it('generates font face with eot', () => {
    const fonts: CustomFont[] = [
      {
        name: 'Aeonik',
        weight: 400,
        style: 'normal',
        files: [
          {
            type: FontFileTypes.EOT,
            url: 'link/to/font.eot'
          },
          {
            type: FontFileTypes.WOFF,
            url: 'link/to/font.woff'
          }
        ]
      },
      {
        name: 'Anek Odia',
        weight: 700,
        style: 'italic',
        files: [
          {
            type: FontFileTypes.WOFF,
            url: 'link/to/font.woff'
          },
          {
            type: FontFileTypes.TTF,
            url: 'link/to/font.ttf'
          }
        ]
      }
    ];
    const generator = new FontFaceGenerator(fonts);
    expect(generator.generate()).toEqual(`
@font-face {
  font-family: "Aeonik";
  font-weight: 400;
  font-style: normal;
  src: url('link/to/font.eot');
  src: url('link/to/font.woff') format('woff');
}

@font-face {
  font-family: "Anek Odia";
  font-weight: 700;
  font-style: italic;
  src: url('link/to/font.woff') format('woff'), url('link/to/font.ttf') format('truetype');
}`)
  });
});
