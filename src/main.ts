// Entry point: configure the Phaser game, size it to the farm map, and register scenes.

import Phaser from 'phaser';
import { palette, toCss } from './game/data/palette';
import { MAPS, TILE } from './game/data/maps';
import { MapId } from './game/types/ids';
import { BootScene } from './game/scenes/BootScene';
import { WorldScene } from './game/scenes/WorldScene';
import { ChestScene } from './game/scenes/ChestScene';
import { ShopScene } from './game/scenes/ShopScene';
import { TalkScene } from './game/scenes/TalkScene';
import { EndScene } from './game/scenes/EndScene';
import { UIScene } from './game/scenes/UIScene';

const farm = MAPS[MapId.Farm];

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: farm.widthTiles * TILE,
  height: farm.heightTiles * TILE,
  backgroundColor: toCss(palette.skyNight),
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // UI is listed last so the HUD/toast render on top of the modal overlays.
  scene: [BootScene, WorldScene, ChestScene, ShopScene, TalkScene, EndScene, UIScene],
});
