// Pure combat math: damage application and loot rolls. No Phaser, no entity management —
// the CombatController handles sprites/AI and calls into these. Keeps combat testable and
// fully separate from farming code.

import type { EnemyDef, LootDrop } from '../data/enemies';
import type { ItemStack } from '../types/models';

export function applyDamage(hp: number, amount: number): number {
  return Math.max(0, hp - amount);
}

export function isDefeated(hp: number): boolean {
  return hp <= 0;
}

// Rolls an enemy's loot table. `rng` returns 0..1 (injectable for tests).
export function rollLoot(def: EnemyDef, rng: () => number = Math.random): ItemStack[] {
  const drops: ItemStack[] = [];
  for (const entry of def.loot) {
    if (rng() <= entry.chance) {
      drops.push({ itemId: entry.itemId, count: rollCount(entry, rng) });
    }
  }
  return drops;
}

function rollCount(entry: LootDrop, rng: () => number): number {
  const span = entry.max - entry.min + 1;
  return entry.min + Math.floor(rng() * span);
}
