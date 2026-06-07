// Player movement. Applies a movement vector to the player state, clamped to map bounds,
// and updates facing. Pure data update — the scene syncs the sprite afterwards.

import type { Facing, PlayerState } from '../types/models';

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function movePlayer(
  player: PlayerState,
  move: { x: number; y: number },
  speed: number,
  dt: number,
  bounds: Bounds,
): void {
  player.x = clamp(player.x + move.x * speed * dt, bounds.minX, bounds.maxX);
  player.y = clamp(player.y + move.y * speed * dt, bounds.minY, bounds.maxY);
  const facing = facingFromMove(move);
  if (facing) player.facing = facing;
}

function facingFromMove(move: { x: number; y: number }): Facing | undefined {
  if (move.x === 0 && move.y === 0) return undefined;
  if (Math.abs(move.x) >= Math.abs(move.y)) return move.x < 0 ? 'left' : 'right';
  return move.y < 0 ? 'up' : 'down';
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
