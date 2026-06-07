// Owns the enemies on the current map: their sprites, simple chase AI, contact detection,
// and resolving the player's attack. Pure damage/loot math lives in CombatSystem; this is
// the rendering/behavior half. Created only for maps that have enemy spawns, so farming
// maps carry no combat at all.

import Phaser from 'phaser';
import { ENEMIES, type EnemyDef } from '../data/enemies';
import { Balance } from '../data/balance';
import { tileCenter, type EnemySpawn } from '../data/maps';
import { applyDamage, isDefeated } from '../systems/CombatSystem';
import type { EnemyId } from '../types/ids';
import type { Bounds } from '../systems/PlayerController';

interface Enemy {
  def: EnemyDef;
  sprite: Phaser.GameObjects.Image;
  hp: number;
  x: number;
  y: number;
}

export class CombatController {
  private enemies: Enemy[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bounds: Bounds,
  ) {}

  spawn(spawns: EnemySpawn[]): void {
    for (const s of spawns) this.spawnAt(s.enemyId, tileCenter(s.tile).x, tileCenter(s.tile).y);
  }

  spawnAt(enemyId: EnemyId, x: number, y: number): void {
    const def = ENEMIES[enemyId];
    const sprite = this.scene.add.image(x, y, def.textureKey).setOrigin(0.5, 0.9).setDepth(y);
    this.enemies.push({ def, sprite, hp: def.maxHp, x, y });
  }

  // Moves enemies (chase when the player is near) and returns the largest contact damage
  // the player is touching this frame (0 if untouched).
  update(dt: number, px: number, py: number): number {
    let contactDamage = 0;
    for (const e of this.enemies) {
      const dx = px - e.x;
      const dy = py - e.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0 && dist < Balance.enemyAggroRange) {
        const step = e.def.speed * dt;
        e.x = clamp(e.x + (dx / dist) * step, this.bounds.minX, this.bounds.maxX);
        e.y = clamp(e.y + (dy / dist) * step, this.bounds.minY, this.bounds.maxY);
        e.sprite.setPosition(e.x, e.y).setDepth(e.y);
        e.sprite.setFlipX(dx < 0);
      }

      if (dist < Balance.enemyContactRange) {
        contactDamage = Math.max(contactDamage, e.def.contactDamage);
      }
    }
    return contactDamage;
  }

  // Farm-raid behavior: raiders make for the nearest crop point (or the player if none).
  // Returns contact damage and the indices of crop points reached (to be devoured).
  updateRaid(
    dt: number,
    cropPoints: { x: number; y: number }[],
    px: number,
    py: number,
  ): { contactDamage: number; eatenIndices: number[] } {
    let contactDamage = 0;
    const eatenIndices: number[] = [];
    const survivors: Enemy[] = [];

    for (const e of this.enemies) {
      const targetIndex = nearestIndex(e.x, e.y, cropPoints);
      const target = targetIndex >= 0 ? cropPoints[targetIndex] : { x: px, y: py };

      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0) {
        const step = e.def.speed * dt;
        e.x = clamp(e.x + (dx / dist) * step, this.bounds.minX, this.bounds.maxX);
        e.y = clamp(e.y + (dy / dist) * step, this.bounds.minY, this.bounds.maxY);
        e.sprite.setPosition(e.x, e.y).setDepth(e.y);
        e.sprite.setFlipX(dx < 0);
      }

      if (targetIndex >= 0 && dist < Balance.cropEatRange) {
        eatenIndices.push(targetIndex);
        this.poof(e.x, e.y);
        e.sprite.destroy();
        continue; // raider devours the crop and vanishes
      }

      if (Math.hypot(px - e.x, py - e.y) < Balance.enemyContactRange) {
        contactDamage = Math.max(contactDamage, e.def.contactDamage);
      }
      survivors.push(e);
    }

    this.enemies = survivors;
    return { contactDamage, eatenIndices };
  }

  // Damages enemies within `radius` of (x, y). Returns the defs of those defeated (for loot).
  attackAt(x: number, y: number, radius: number, damage: number): EnemyDef[] {
    const defeated: EnemyDef[] = [];
    const survivors: Enemy[] = [];
    for (const e of this.enemies) {
      if (Math.hypot(e.x - x, e.y - y) <= radius) {
        e.hp = applyDamage(e.hp, damage);
        if (isDefeated(e.hp)) {
          this.poof(e.x, e.y);
          e.sprite.destroy();
          defeated.push(e.def);
          continue;
        }
        this.flash(e.sprite);
      }
      survivors.push(e);
    }
    this.enemies = survivors;
    return defeated;
  }

  remaining(): number {
    return this.enemies.length;
  }

  destroy(): void {
    for (const e of this.enemies) e.sprite.destroy();
    this.enemies = [];
  }

  private flash(sprite: Phaser.GameObjects.Image): void {
    sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(90, () => sprite.clearTint());
  }

  private poof(x: number, y: number): void {
    const puff = this.scene.add.circle(x, y - 8, 8, 0xfdf6e3, 0.85).setDepth(y + 1);
    this.scene.tweens.add({ targets: puff, alpha: 0, scale: 1.8, duration: 220, onComplete: () => puff.destroy() });
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function nearestIndex(x: number, y: number, points: { x: number; y: number }[]): number {
  let best = -1;
  let bestDist = Infinity;
  for (let i = 0; i < points.length; i++) {
    const d = Math.hypot(points[i].x - x, points[i].y - y);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}
