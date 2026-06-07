// Procedural art. Every texture is drawn here in code at boot using the shared palette,
// then registered under a key from assetKeys. Swap this for loaded image assets later
// without changing any gameplay code (which only ever references the keys).

import Phaser from 'phaser';
import { cropTextureKey, TextureKey } from '../data/assetKeys';
import { CROPS } from '../data/crops';
import { palette } from '../data/palette';
import { TILE } from '../data/maps';
import { CropId } from '../types/ids';

// Draw into a Graphics, bake it into a texture of size w x h, then discard the Graphics.
function make(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (g: Phaser.GameObjects.Graphics) => void,
): void {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

function rect(g: Phaser.GameObjects.Graphics, color: number, x: number, y: number, w: number, h: number): void {
  g.fillStyle(color, 1);
  g.fillRect(x, y, w, h);
}

export function buildTextures(scene: Phaser.Scene): void {
  buildGrassTile(scene);
  buildSoilTile(scene);
  buildWoodFloorTile(scene);
  buildWallTile(scene);
  buildPlayer(scene);
  buildShippingBox(scene);
  buildCottage(scene);
  buildDoor(scene);
  buildChest(scene);
  buildIcons(scene);
  buildCropStages(scene);
}

function buildGrassTile(scene: Phaser.Scene): void {
  make(scene, TextureKey.GrassTile, TILE, TILE, (g) => {
    rect(g, palette.grass, 0, 0, TILE, TILE);
    // a few darker and lighter tufts for gentle texture
    rect(g, palette.grassDark, 5, 7, 3, 3);
    rect(g, palette.grassDark, 22, 18, 3, 3);
    rect(g, palette.grassTuft, 13, 24, 3, 3);
    rect(g, palette.grassTuft, 26, 6, 2, 2);
  });
}

function buildSoilTile(scene: Phaser.Scene): void {
  make(scene, TextureKey.SoilTile, TILE, TILE, (g) => {
    rect(g, palette.soilDark, 0, 0, TILE, TILE);
    rect(g, palette.soil, 2, 2, TILE - 4, TILE - 4);
    // furrow lines
    rect(g, palette.soilDark, 6, 4, 2, TILE - 8);
    rect(g, palette.soilDark, 15, 4, 2, TILE - 8);
    rect(g, palette.soilDark, 24, 4, 2, TILE - 8);
  });
}

function buildWoodFloorTile(scene: Phaser.Scene): void {
  make(scene, TextureKey.WoodFloor, TILE, TILE, (g) => {
    rect(g, palette.floorWood, 0, 0, TILE, TILE);
    // plank seams
    rect(g, palette.floorWoodDark, 0, 10, TILE, 1);
    rect(g, palette.floorWoodDark, 0, 21, TILE, 1);
    rect(g, palette.floorWoodDark, 10, 0, 1, 10);
    rect(g, palette.floorWoodDark, 22, 11, 1, 10);
  });
}

function buildWallTile(scene: Phaser.Scene): void {
  make(scene, TextureKey.Wall, TILE, TILE, (g) => {
    rect(g, palette.wallDark, 0, 0, TILE, TILE);
    rect(g, palette.wall, 1, 1, TILE - 2, TILE - 3);
    // brick seams
    rect(g, palette.wallDark, 0, 15, TILE, 1);
    rect(g, palette.wallDark, 15, 0, 1, 15);
  });
}

function buildPlayer(scene: Phaser.Scene): void {
  // 24x30 cute farmer with a clear silhouette, drawn facing down.
  const w = 24;
  const h = 30;
  make(scene, TextureKey.Player, w, h, (g) => {
    // legs
    rect(g, palette.clothDark, 7, 23, 4, 6);
    rect(g, palette.clothDark, 13, 23, 4, 6);
    // body / smock
    rect(g, palette.outline, 5, 13, 14, 12);
    rect(g, palette.cloth, 6, 14, 12, 10);
    rect(g, palette.clothDark, 6, 20, 12, 2);
    // head
    rect(g, palette.outline, 6, 2, 12, 12);
    rect(g, palette.skin, 7, 3, 10, 10);
    // hair
    rect(g, palette.hair, 7, 2, 10, 4);
    rect(g, palette.hair, 6, 4, 2, 4);
    rect(g, palette.hair, 16, 4, 2, 4);
    // eyes
    rect(g, palette.outline, 9, 8, 2, 2);
    rect(g, palette.outline, 14, 8, 2, 2);
  });
}

function buildShippingBox(scene: Phaser.Scene): void {
  const w = 30;
  const h = 26;
  make(scene, TextureKey.ShippingBox, w, h, (g) => {
    rect(g, palette.woodDark, 0, 4, w, h - 4);
    rect(g, palette.wood, 2, 6, w - 4, h - 8);
    // plank seams
    rect(g, palette.woodDark, 2, 14, w - 4, 2);
    rect(g, palette.woodDark, 14, 6, 2, h - 8);
    // open lid lip
    rect(g, palette.woodDark, 0, 0, w, 6);
    rect(g, palette.outline, 4, 2, w - 8, 3);
  });
}

function buildCottage(scene: Phaser.Scene): void {
  // A cute cottage placed on the farm; its doorway sits at the bottom center.
  const w = 60;
  const h = 56;
  make(scene, TextureKey.Cottage, w, h, (g) => {
    // walls
    rect(g, palette.outline, 6, 22, w - 12, h - 24);
    rect(g, palette.floorWood, 8, 24, w - 16, h - 26);
    // roof
    rect(g, palette.roofDark, 2, 12, w - 4, 12);
    rect(g, palette.roof, 4, 8, w - 8, 8);
    rect(g, palette.roof, 10, 4, w - 20, 6);
    // window
    rect(g, palette.outline, 12, 28, 12, 12);
    rect(g, palette.window, 14, 30, 8, 8);
    rect(g, palette.outline, 17, 30, 2, 8);
    // door
    rect(g, palette.outline, w / 2 - 7, h - 18, 14, 18);
    rect(g, palette.woodDark, w / 2 - 5, h - 16, 10, 16);
    rect(g, palette.metal, w / 2 + 1, h - 9, 2, 2);
  });
}

function buildDoor(scene: Phaser.Scene): void {
  const w = 22;
  const h = 28;
  make(scene, TextureKey.Door, w, h, (g) => {
    rect(g, palette.outline, 0, 0, w, h);
    rect(g, palette.woodDark, 2, 2, w - 4, h - 2);
    rect(g, palette.wood, 4, 4, w - 8, h - 6);
    rect(g, palette.woodDark, w / 2 - 1, 4, 2, h - 6);
    rect(g, palette.metal, w - 7, h / 2, 2, 3);
  });
}

function buildChest(scene: Phaser.Scene): void {
  const w = 28;
  const h = 22;
  make(scene, TextureKey.Chest, w, h, (g) => {
    // body
    rect(g, palette.outline, 1, 8, w - 2, h - 8);
    rect(g, palette.wood, 2, 9, w - 4, h - 10);
    // lid
    rect(g, palette.outline, 0, 1, w, 8);
    rect(g, palette.woodDark, 1, 2, w - 2, 6);
    // metal bands + lock
    rect(g, palette.metal, w / 2 - 1, 1, 2, h - 1);
    rect(g, palette.metal, w / 2 - 3, 9, 6, 4);
  });
}

function buildIcons(scene: Phaser.Scene): void {
  const s = 20;
  // seed: a small pip
  make(scene, TextureKey.IconTurnipSeed, s, s, (g) => {
    rect(g, palette.leafDark, 7, 4, 6, 12);
    rect(g, palette.leaf, 8, 5, 4, 9);
    rect(g, palette.bulbTop, 9, 13, 2, 2);
  });
  // turnip: bulb with leafy crown
  make(scene, TextureKey.IconTurnip, s, s, (g) => {
    rect(g, palette.bulb, 5, 8, 10, 9);
    rect(g, palette.bulb, 6, 16, 8, 2);
    rect(g, palette.bulbTop, 5, 6, 10, 3);
    rect(g, palette.leaf, 7, 1, 2, 6);
    rect(g, palette.leaf, 11, 1, 2, 6);
    rect(g, palette.leafDark, 9, 2, 2, 5);
  });
}

// Crop growth stages, drawn within a tile-sized canvas so the bulb sits on the soil.
function buildCropStages(scene: Phaser.Scene): void {
  const cropId = CropId.Turnip;
  const stages = CROPS[cropId].growthStages;
  const w = TILE;
  const h = TILE;
  const cx = Math.floor(w / 2);

  for (let stage = 0; stage < stages; stage++) {
    make(scene, cropTextureKey(cropId, stage), w, h, (g) => {
      if (stage === 0) {
        // freshly planted mound
        rect(g, palette.soilDark, cx - 4, h - 8, 8, 4);
        rect(g, palette.leaf, cx - 1, h - 11, 2, 3);
      } else if (stage === 1) {
        // sprout
        rect(g, palette.leaf, cx - 1, h - 14, 2, 6);
        rect(g, palette.leaf, cx - 4, h - 12, 3, 2);
        rect(g, palette.leaf, cx + 1, h - 12, 3, 2);
      } else if (stage === 2) {
        // leafy, not ready
        rect(g, palette.leafDark, cx - 5, h - 16, 10, 6);
        rect(g, palette.leaf, cx - 4, h - 17, 8, 5);
        rect(g, palette.leaf, cx - 1, h - 20, 2, 4);
      } else {
        // mature turnip
        rect(g, palette.bulb, cx - 5, h - 12, 10, 9);
        rect(g, palette.bulb, cx - 4, h - 4, 8, 2);
        rect(g, palette.bulbTop, cx - 5, h - 14, 10, 3);
        rect(g, palette.leaf, cx - 4, h - 22, 2, 8);
        rect(g, palette.leaf, cx + 2, h - 22, 2, 8);
        rect(g, palette.leafDark, cx - 1, h - 20, 2, 7);
      }
    });
  }
}
