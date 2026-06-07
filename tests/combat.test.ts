import { describe, expect, it } from 'vitest';
import { ENEMIES } from '../src/game/data/enemies';
import { ITEMS } from '../src/game/data/items';
import { applyDamage, isDefeated, rollLoot } from '../src/game/systems/CombatSystem';
import { EnemyId } from '../src/game/types/ids';

describe('CombatSystem', () => {
  it('clamps damage at zero and detects defeat', () => {
    expect(applyDamage(3, 1)).toBe(2);
    expect(applyDamage(1, 5)).toBe(0);
    expect(isDefeated(0)).toBe(true);
    expect(isDefeated(1)).toBe(false);
  });

  it('drops loot when the roll is under the chance, with counts in range', () => {
    const def = ENEMIES[EnemyId.ShadePup];
    // rng always 0 => every drop happens, count = min
    const drops = rollLoot(def, () => 0);
    expect(drops.length).toBe(def.loot.length);
    drops.forEach((d, i) => {
      expect(d.count).toBe(def.loot[i].min);
      expect(ITEMS[d.itemId]).toBeDefined();
    });
  });

  it('drops nothing when every roll misses', () => {
    const def = ENEMIES[EnemyId.RuinMite];
    expect(rollLoot(def, () => 1).length).toBe(0);
  });
});

describe('enemy registry is consistent', () => {
  it('every enemy has positive stats, a sprite, and valid loot items', () => {
    for (const def of Object.values(ENEMIES)) {
      expect(def.maxHp).toBeGreaterThan(0);
      expect(def.speed).toBeGreaterThan(0);
      expect(def.textureKey.length).toBeGreaterThan(0);
      for (const drop of def.loot) {
        expect(ITEMS[drop.itemId]).toBeDefined();
        expect(drop.chance).toBeGreaterThan(0);
        expect(drop.min).toBeLessThanOrEqual(drop.max);
      }
    }
  });
});
