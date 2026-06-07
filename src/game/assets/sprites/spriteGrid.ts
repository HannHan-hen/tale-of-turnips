// Pixel-grid sprite authoring. A sprite is a small grid of single-character cells; each
// char maps (through a legend) to a palette color, or is transparent ('.'). Authoring art
// this way — one deliberate pixel per cell — is what lets us draw cute, readable sprites
// with clean outlines, hand anti-aliasing, and dithering, instead of stacking rectangles.
//
// The same grid data drives both the in-game texture (painted via Phaser in TextureFactory)
// and the offline preview renderer (tools/preview.mjs), so what we review is exactly what
// ships. This module is intentionally Phaser-free and pure so both paths can share it.

export const TRANSPARENT = '.';

export interface PixelSprite {
  width: number;
  height: number;
  /** Single-char -> 0xRRGGBB color. The '.' char is always transparent. */
  legend: Record<string, number>;
  /** One string per row; each must be exactly `width` chars long. */
  rows: string[];
  /**
   * If set, a 1px silhouette outline in this color is auto-drawn in the transparent cells
   * that touch the opaque shape. This gives every sprite a clean, form-hugging edge for
   * free — so the art's roundness comes from the shape, not from hand-placing the outline.
   */
  outline?: number;
}

export interface PlacedPixel {
  x: number;
  y: number;
  color: number;
}

function validate(sprite: PixelSprite): void {
  if (sprite.rows.length !== sprite.height) {
    throw new Error(`sprite height ${sprite.height} != ${sprite.rows.length} rows`);
  }
  sprite.rows.forEach((row, y) => {
    if (row.length !== sprite.width) {
      throw new Error(`row ${y} has length ${row.length}, expected width ${sprite.width}: "${row}"`);
    }
    for (const ch of row) {
      if (ch !== TRANSPARENT && !(ch in sprite.legend)) {
        throw new Error(`row ${y} uses char "${ch}" which is missing from the legend`);
      }
    }
  });
}

function isOpaque(sprite: PixelSprite, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= sprite.width || y >= sprite.height) return false;
  return sprite.rows[y][x] !== TRANSPARENT;
}

// Resolve a sprite into the exact list of colored pixels to paint, including the
// auto-generated silhouette outline. Pure data in, pure data out.
export function resolvePixels(sprite: PixelSprite): PlacedPixel[] {
  validate(sprite);
  const out: PlacedPixel[] = [];
  for (let y = 0; y < sprite.height; y++) {
    for (let x = 0; x < sprite.width; x++) {
      const ch = sprite.rows[y][x];
      if (ch === TRANSPARENT) {
        const touchesShape =
          isOpaque(sprite, x - 1, y) ||
          isOpaque(sprite, x + 1, y) ||
          isOpaque(sprite, x, y - 1) ||
          isOpaque(sprite, x, y + 1);
        if (sprite.outline !== undefined && touchesShape) {
          out.push({ x, y, color: sprite.outline });
        }
        continue;
      }
      out.push({ x, y, color: sprite.legend[ch] });
    }
  }
  return out;
}
