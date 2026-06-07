// Boot: build all procedural textures, load (or start) the game state, then launch the
// gameplay and UI scenes. Keeps one-time setup out of the gameplay scene.

import Phaser from 'phaser';
import { buildTextures } from '../assets/TextureFactory';
import { GameStateStore } from '../state/GameStateStore';
import { loadGame } from '../save/SaveSystem';
import { SceneKey } from '../types/ids';

export const STORE_KEY = 'store';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Boot);
  }

  create(): void {
    buildTextures(this);

    const store = new GameStateStore(loadGame());
    this.registry.set(STORE_KEY, store);

    this.scene.start(SceneKey.Farm);
    this.scene.launch(SceneKey.UI);
  }
}
