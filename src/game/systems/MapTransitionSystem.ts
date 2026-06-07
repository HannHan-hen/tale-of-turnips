// The single home for moving the player between maps. Updates the player's map and
// position in state; the world scene re-renders the destination afterwards.

import { tileCenter, type TilePos } from '../data/maps';
import type { MapId } from '../types/ids';
import type { GameState } from '../types/models';

export function transitionTo(state: GameState, toMap: MapId, toSpawn: TilePos): void {
  const center = tileCenter(toSpawn);
  state.player.mapId = toMap;
  state.player.x = center.x;
  state.player.y = center.y;
}
