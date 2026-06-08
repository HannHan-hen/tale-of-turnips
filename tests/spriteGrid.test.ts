import { describe, it, expect } from 'vitest';
import { resolvePixels, type PixelSprite } from '../src/game/assets/sprites/spriteGrid';
import { FARMER } from '../src/game/assets/sprites/farmer';
import { JAY, SEED_SELLER, BLACKSMITH, VILLAGER } from '../src/game/assets/sprites/characters';
import { CHICKEN } from '../src/game/assets/sprites/chicken';
import {
  CROP_MOUND,
  CROP_SPROUT,
  CROP_LEAFY,
  TURNIP,
  CARROT,
  PUMPKIN,
} from '../src/game/assets/sprites/crops';
import { BUSH_FULL, BUSH_EMPTY } from '../src/game/assets/sprites/bushes';
import { RUIN_MITE, SHADE_PUP, CROP_NIBBLER, RUIN_HEART } from '../src/game/assets/sprites/enemies';

// Every hand-authored sprite, for the shared validity checks below.
const AUTHORED_SPRITES: Record<string, PixelSprite> = {
  FARMER,
  JAY,
  SEED_SELLER,
  BLACKSMITH,
  VILLAGER,
  CHICKEN,
  CROP_MOUND,
  CROP_SPROUT,
  CROP_LEAFY,
  TURNIP,
  CARROT,
  PUMPKIN,
  BUSH_FULL,
  BUSH_EMPTY,
  RUIN_MITE,
  SHADE_PUP,
  CROP_NIBBLER,
  RUIN_HEART,
};

const legend = { a: 0x112233 };

function sprite(rows: string[], extra: Partial<PixelSprite> = {}): PixelSprite {
  return { width: rows[0]?.length ?? 0, height: rows.length, legend, rows, ...extra };
}

describe('resolvePixels', () => {
  it('paints opaque cells with their legend color and skips transparent ones', () => {
    const pixels = resolvePixels(sprite(['a.', '.a']));
    expect(pixels).toEqual([
      { x: 0, y: 0, color: 0x112233 },
      { x: 1, y: 1, color: 0x112233 },
    ]);
  });

  it('auto-draws a 1px outline in transparent cells touching the shape', () => {
    // A single opaque pixel surrounded by transparency gets 4 orthogonal outline pixels.
    const pixels = resolvePixels(sprite(['...', '.a.', '...'], { outline: 0x000000 }));
    const outline = pixels.filter((p) => p.color === 0x000000);
    expect(outline).toHaveLength(4);
    expect(outline).toContainEqual({ x: 1, y: 0, color: 0x000000 });
    expect(outline).toContainEqual({ x: 0, y: 1, color: 0x000000 });
    expect(outline).toContainEqual({ x: 2, y: 1, color: 0x000000 });
    expect(outline).toContainEqual({ x: 1, y: 2, color: 0x000000 });
  });

  it('adds no outline when none is configured', () => {
    const pixels = resolvePixels(sprite(['.a.']));
    expect(pixels).toHaveLength(1);
  });

  it('throws when a row length does not match the width', () => {
    expect(() => resolvePixels({ width: 3, height: 1, legend, rows: ['aa'] })).toThrow(/length/);
  });

  it('throws when a row uses a char missing from the legend', () => {
    expect(() => resolvePixels({ width: 1, height: 1, legend, rows: ['z'] })).toThrow(/legend/);
  });
});

describe('authored sprites', () => {
  for (const [name, sprite] of Object.entries(AUTHORED_SPRITES)) {
    describe(name, () => {
      it('has a valid, paintable grid (every row matches width, all chars in legend)', () => {
        // resolvePixels validates dimensions and legend coverage; this guards against typos
        // such as a miscounted row when authoring pixel grids.
        expect(() => resolvePixels(sprite)).not.toThrow();
      });

      it('declares height equal to its row count', () => {
        expect(sprite.rows).toHaveLength(sprite.height);
      });

      it('produces pixels within its declared bounds', () => {
        for (const p of resolvePixels(sprite)) {
          expect(p.x).toBeGreaterThanOrEqual(0);
          expect(p.y).toBeGreaterThanOrEqual(0);
          expect(p.x).toBeLessThan(sprite.width);
          expect(p.y).toBeLessThan(sprite.height);
        }
      });
    });
  }
});
