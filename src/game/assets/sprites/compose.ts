import { palette } from '../../data/palette';
import type { PixelSprite } from './spriteGrid';

// Compose a sprite from filled rectangles into a character grid, then hand it the shared 1px
// auto-outline. Used for the mostly-geometric props and inventory icons, where rect-painting
// is clearer than a hand-typed grid and guarantees every row matches the declared width.
type Draw = (rect: (ch: string, x: number, y: number, w: number, h: number) => void) => void;

export function build(
  width: number,
  height: number,
  legend: Record<string, number>,
  draw: Draw,
  outline: number = palette.outline,
): PixelSprite {
  const g: string[][] = Array.from({ length: height }, () => Array<string>(width).fill('.'));
  const rect = (ch: string, x: number, y: number, w: number, h: number): void => {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        if (yy >= 0 && yy < height && xx >= 0 && xx < width) g[yy][xx] = ch;
      }
    }
  };
  draw(rect);
  return { width, height, outline, legend, rows: g.map((r) => r.join('')) };
}
