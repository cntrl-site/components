import ReactDOM from 'react-dom/client';
import { SpiralList } from '../src/Components/Spiral/List/SpiralList';

const palette = [
  '#E8453C', '#F5C400', '#3D8BFD', '#25A05B', '#C86DD7', '#FF8A3D',
  '#1FB6C1', '#D8DEE9', '#8B5E3C', '#B4E33D', '#FF5C8A', '#5B5BD6',
];

const ratios: Array<[number, number]> = [[2, 3], [3, 4], [1, 1], [4, 5], [3, 2], [4, 3]];

function placeholder(index: number): string {
  const [w, h] = ratios[index % ratios.length];
  const color = palette[index % palette.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w * 100} ${h * 100}">`
    + `<rect width="100%" height="100%" fill="${color}"/>`
    + `<text x="50%" y="52%" font-family="Helvetica" font-size="${Math.min(w, h) * 55}" fill="#111" text-anchor="middle" dominant-baseline="middle">${index}</text>`
    + '</svg>';
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const content = Array.from({ length: 16 }, (_, index) => ({
  image: { url: placeholder(index), name: `${index}` },
}));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <SpiralList
    content={content}
    settings={{
      width: 560 / 720,
      imageWidth: 72 / 720,
      turnHeight: 275 / 720,
      itemsPerTurn: 13,
      turns: 6,
      speed: 2.8,
      direction: 'right',
      playback: 'autoplay',
      cornerRadius: 0,
      imageDisplay: { display: 'fit', ratioValue: '2:3', reversed: false },
    }}
  />,
);
