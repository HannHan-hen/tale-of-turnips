// Foraging logic. Bushes bear fruit, are harvested, then regrow after a fixed number of
// ticks. Pure functions over BushState — the scene picks the texture from readiness.

import type { BushState } from '../types/models';

export function isBushReady(bush: BushState, currentTick: number): boolean {
  return currentTick >= bush.readyTick;
}

// Marks a bush as harvested; it becomes ready again after `regrowTicks`.
export function harvestBush(bush: BushState, currentTick: number, regrowTicks: number): void {
  bush.readyTick = currentTick + regrowTicks;
}
