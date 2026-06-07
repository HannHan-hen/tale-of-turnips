// Thin holder for the live game state, shared across scenes via the Phaser registry.
// Keeps state separate from rendering and offers a couple of convenience accessors.

import type { GameState, MapState, PlayerState } from '../types/models';

export class GameStateStore {
  constructor(public state: GameState) {}

  get player(): PlayerState {
    return this.state.player;
  }

  currentMap(): MapState {
    return this.state.maps[this.state.player.mapId];
  }
}
