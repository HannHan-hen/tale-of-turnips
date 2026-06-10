// Boot: build all procedural textures and animations once, then hand off to the title
// screen, which decides whether to continue a save or start a new game. Keeps one-time
// setup out of the gameplay scene. The shared store lives in the registry under STORE_KEY.

import Phaser from 'phaser';
import { buildTextures, buildPlayerAnimations, buildChickenAnimations } from '../assets/TextureFactory';
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
// NPC portrait busts, same convention: filename matches the TextureKey value.
const portraitUrls = import.meta.glob('../../assets/portraits/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
// World props (cottage, stall, chest, …), same filename==TextureKey convention. Each PNG is
// pre-sized to its in-world footprint, so it renders at native size like the procedural prop.
const propUrls = import.meta.glob('../../assets/props/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
// Player walk frames (player, player_down_a/b, player_up*, player_side*); filename == the
// PlayerFrame texture key. With these loaded, TextureFactory's buildPlayer falls back out.
const playerUrls = import.meta.glob('../../assets/player/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
// NPC world sprites (npc_seed_seller, npc_blacksmith, npc_villager, npc_jay); filename == key.
const npcUrls = import.meta.glob('../../assets/npcs/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
// Foraging set: chicken (+ tucked bob frame) and the full/empty berry bush; filename == key.
const forageUrls = import.meta.glob('../../assets/forage/*.png', {
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
    const generated = {
      ...iconUrls,
      ...portraitUrls,
      ...propUrls,
      ...playerUrls,
      ...npcUrls,
      ...forageUrls,
    };
    for (const [path, url] of Object.entries(generated)) {
      const key = path.split('/').pop()!.replace('.png', '');
      this.load.image(key, url);
    }
  }

  create(): void {
    buildTextures(this);
    buildPlayerAnimations(this);
    buildChickenAnimations(this);
    this.scene.start(SceneKey.Title);
  }
}
