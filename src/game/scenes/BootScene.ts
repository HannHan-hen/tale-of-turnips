// Boot: build all procedural textures and animations once, then hand off to the title
// screen, which decides whether to continue a save or start a new game. Keeps one-time
// setup out of the gameplay scene. The shared store lives in the registry under STORE_KEY.

import Phaser from 'phaser';
import { buildTextures, buildPlayerAnimations } from '../assets/TextureFactory';
import { SceneKey } from '../types/ids';

export const STORE_KEY = 'store';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Boot);
  }

  create(): void {
    buildTextures(this);
    buildPlayerAnimations(this);
    this.scene.start(SceneKey.Title);
  }
}
