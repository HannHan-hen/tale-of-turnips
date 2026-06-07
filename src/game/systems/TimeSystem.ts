// Time logic. A simple tick counter drives crop growth; days exist for future systems
// (threat, daily village-boy chat). Kept minimal on purpose — no calendar.

import type { TimeState } from '../types/models';

export function advanceTick(time: TimeState): void {
  time.tick += 1;
}
