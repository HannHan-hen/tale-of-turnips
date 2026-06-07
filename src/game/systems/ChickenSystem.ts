// Chicken logic. Petting is a once-per-day affair; the caller handles the reward (an egg)
// and feedback. Pure function over ChickenState.

import type { ChickenState } from '../types/models';

// Records a pet for today. Returns true if this is the first pet today (reward-eligible),
// false if the chicken was already petted on this day.
export function petChicken(chicken: ChickenState, day: number): boolean {
  if (chicken.lastPettedDay === day) return false;
  chicken.lastPettedDay = day;
  return true;
}
