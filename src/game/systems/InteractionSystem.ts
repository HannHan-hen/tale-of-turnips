// Interaction logic. One general system: given the player position and the list of
// interactable targets, find the nearest one within reach. Scenes build the target list
// and act on whatever this returns — no per-object input code.

import type { InteractionTarget } from '../types/models';

export function findNearestTarget(
  px: number,
  py: number,
  targets: InteractionTarget[],
  radius: number,
): InteractionTarget | undefined {
  let best: InteractionTarget | undefined;
  let bestDist = radius * radius;
  for (const t of targets) {
    const dx = t.x - px;
    const dy = t.y - py;
    const d = dx * dx + dy * dy;
    if (d <= bestDist) {
      bestDist = d;
      best = t;
    }
  }
  return best;
}
