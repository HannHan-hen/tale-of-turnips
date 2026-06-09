// Boot: build all procedural textures and animations once, then hand off to the title
// screen, which decides whether to continue a save or start a new game. Keeps one-time
// setup out of the gameplay scene. The shared store lives in the registry under STORE_KEY.

import Phaser from 'phaser';
import { buildTextures, buildPlayerAnimations } from '../assets/TextureFactory';
import { TextureKey } from '../data/assetKeys';
import { SceneKey } from '../types/ids';
// Generated raster assets (see src/assets/SOURCES.md). Imported so Vite fingerprints the URL
// and respects the configured base path; loaded under an assetKey like every other texture.
import titleBackdropUrl from '../../assets/title_backdrop.jpg';
// Every icon PNG in src/assets/icons/ is loaded under its filename, which matches its
// TextureKey value (e.g. icon_turnip.png -> TextureKey.IconTurnip). Drop a new icon in and it
// loads automatically; if one is ever missing, TextureFactory's procedural version fills in.
const iconUrls = import.meta.glob('../../assets/icons/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const STORE_KEY = 'store';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Boot);
  }

  preload(): void {
    this.load.image(TextureKey.TitleBackdrop, titleBackdropUrl);
    for (const [path, url] of Object.entries(iconUrls)) {
      const key = path.split('/').pop()!.replace('.png', '');
      this.load.image(key, url);
    }
  }

  create(): void {
    buildTextures(this);
    buildPlayerAnimations(this);
    this.scene.start(SceneKey.Title);
  }
}
