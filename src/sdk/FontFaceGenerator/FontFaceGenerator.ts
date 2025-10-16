import { CustomFont } from '../types/project/Fonts';

const FILE_TYPES_MAP: Record<string, string> = {
  ttf: 'truetype',
  otf: 'opentype'
};

export class FontFaceGenerator {
  constructor(
    private fonts: CustomFont[]
  ) {}

  generate(): string {
    return this.fonts.map(font => {
      const eotFile = font.files.find(file => file.type === 'eot');
      const otherFiles = font.files
        .filter(file => file.type !== 'eot')
        .map(file => `url('${file.url}') format('${FILE_TYPES_MAP[file.type] || file.type}')`);
      return `
@font-face {
  font-family: "${font.name}";
  font-weight: ${font.weight};
  font-style: ${font.style};
  ${eotFile ? `src: url('${eotFile.url}');\n  ` : ''}src: ${otherFiles.join(', ')};
}`;
    }).join('\n');
  }
}
