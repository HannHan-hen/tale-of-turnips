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
  buildSignpost(scene);
  buildStall(scene);
  buildAnvil(scene);
  buildNpcs(scene);
  buildChicken(scene);
  buildBushes(scene);
  buildStoneFloorTile(scene);
  buildRubble(scene);
  buildEnemies(scene);
  buildSlash(scene);
  buildHearts(scene);
  buildCaches(scene);
  buildArmorIcons(scene);
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

function buildSignpost(scene: Phaser.Scene): void {
  const w = 24;
  const h = 30;
  make(scene, TextureKey.Signpost, w, h, (g) => {
    rect(g, palette.outline, 10, 10, 4, 20); // post
    rect(g, palette.woodDark, 11, 11, 2, 18);
    rect(g, palette.outline, 2, 4, 20, 9); // sign board
    rect(g, palette.wood, 4, 6, 16, 5);
    rect(g, palette.woodDark, 6, 8, 10, 1);
  });
}

function buildStall(scene: Phaser.Scene): void {
  // a little market stall with a striped awning
  const w = 56;
  const h = 44;
  make(scene, TextureKey.Stall, w, h, (g) => {
    rect(g, palette.outline, 4, 24, w - 8, h - 24); // counter
    rect(g, palette.wood, 6, 26, w - 12, h - 28);
    rect(g, palette.outline, 2, 22, w - 4, 4); // counter top
    rect(g, palette.outline, 6, 4, 4, 22); // posts
    rect(g, palette.outline, w - 10, 4, 4, 22);
    // striped awning
    for (let i = 0; i < w - 8; i += 12) {
      rect(g, palette.cloth, 4 + i, 2, 6, 10);
      rect(g, palette.uiInk, 10 + i, 2, 6, 10);
    }
    rect(g, palette.outline, 2, 0, w - 4, 3);
  });
}

function buildAnvil(scene: Phaser.Scene): void {
  const w = 30;
  const h = 26;
  make(scene, TextureKey.Anvil, w, h, (g) => {
    rect(g, palette.stoneDark, 8, 18, 14, 8); // base
    rect(g, palette.stone, 11, 10, 8, 8); // waist
    rect(g, palette.outline, 4, 4, w - 8, 7); // top
    rect(g, palette.steel, 6, 5, w - 12, 4);
    rect(g, palette.steelDark, 2, 5, 5, 3); // horn
  });
}

// One villager body drawn in three color schemes so the cast stays coherent.
function buildNpcs(scene: Phaser.Scene): void {
  buildVillager(scene, TextureKey.NpcSeedSeller, palette.apronGreen, palette.hair);
  buildVillager(scene, TextureKey.NpcBlacksmith, palette.apronRed, palette.outline);
  buildVillager(scene, TextureKey.NpcVillager, palette.wall, palette.steel);
  buildVillager(scene, TextureKey.NpcJay, palette.jayShirt, palette.jayHair);
}

function buildVillager(scene: Phaser.Scene, key: string, cloth: number, hair: number): void {
  const w = 24;
  const h = 30;
  make(scene, key, w, h, (g) => {
    rect(g, palette.clothDark, 7, 23, 4, 6); // legs
    rect(g, palette.clothDark, 13, 23, 4, 6);
    rect(g, palette.outline, 5, 13, 14, 12); // body
    rect(g, cloth, 6, 14, 12, 10);
    rect(g, palette.outline, 6, 2, 12, 12); // head
    rect(g, palette.skin, 7, 3, 10, 10);
    rect(g, hair, 7, 2, 10, 4); // hair
    rect(g, hair, 6, 4, 2, 3);
    rect(g, hair, 16, 4, 2, 3);
    rect(g, palette.outline, 9, 8, 2, 2); // eyes
    rect(g, palette.outline, 14, 8, 2, 2);
  });
}

function buildChicken(scene: Phaser.Scene): void {
  const w = 20;
  const h = 22;
  make(scene, TextureKey.Chicken, w, h, (g) => {
    rect(g, palette.beak, 8, 19, 4, 3); // feet
    rect(g, palette.outline, 4, 6, 12, 13); // body outline
    rect(g, palette.chickenBody, 5, 7, 10, 11);
    rect(g, palette.outline, 5, 2, 8, 7); // head
    rect(g, palette.chickenBody, 6, 3, 6, 6);
    rect(g, palette.chickenComb, 7, 0, 4, 3); // comb
    rect(g, palette.beak, 12, 5, 3, 2); // beak
    rect(g, palette.outline, 8, 4, 2, 2); // eye
    rect(g, palette.beak, 4, 12, 2, 4); // wing hint
  });
}

function buildBushes(scene: Phaser.Scene): void {
  const w = 30;
  const h = 26;
  const leaves = (g: Phaser.GameObjects.Graphics) => {
    rect(g, palette.leafDark, 3, 8, 24, 16);
    rect(g, palette.leaf, 5, 6, 20, 14);
    rect(g, palette.leafDark, 9, 4, 12, 6);
    rect(g, palette.berryLeaf, 6, 16, 18, 4);
  };
  make(scene, TextureKey.BushFull, w, h, (g) => {
    leaves(g);
    // ripe berries
    rect(g, palette.berry, 8, 12, 3, 3);
    rect(g, palette.berry, 16, 10, 3, 3);
    rect(g, palette.berry, 13, 16, 3, 3);
    rect(g, palette.berry, 21, 15, 3, 3);
  });
  make(scene, TextureKey.BushEmpty, w, h, leaves);
}

function buildStoneFloorTile(scene: Phaser.Scene): void {
  make(scene, TextureKey.StoneFloor, TILE, TILE, (g) => {
    rect(g, palette.stoneFloorDark, 0, 0, TILE, TILE);
    rect(g, palette.stoneFloor, 1, 1, TILE - 2, TILE - 2);
    // cracked flagstones
    rect(g, palette.stoneFloorDark, 0, 16, TILE, 1);
    rect(g, palette.stoneFloorDark, 16, 0, 1, 16);
    rect(g, palette.stoneFloorDark, 8, 16, 1, 16);
  });
}

function buildRubble(scene: Phaser.Scene): void {
  const w = 30;
  const h = 22;
  make(scene, TextureKey.Rubble, w, h, (g) => {
    rect(g, palette.stoneDark, 3, 10, 24, 10);
    rect(g, palette.stone, 5, 8, 9, 9);
    rect(g, palette.stone, 16, 11, 8, 8);
    rect(g, palette.stoneFloorDark, 12, 4, 6, 6);
    rect(g, palette.stone, 13, 5, 4, 4);
  });
}

function buildEnemies(scene: Phaser.Scene): void {
  // Ruin Mite: a small mossy blob with big eyes.
  make(scene, TextureKey.EnemyRuinMite, 20, 18, (g) => {
    rect(g, palette.outline, 3, 6, 14, 11);
    rect(g, palette.mite, 4, 7, 12, 9);
    rect(g, palette.miteDark, 4, 13, 12, 3);
    rect(g, palette.uiInk, 6, 9, 3, 3); // eyes
    rect(g, palette.uiInk, 11, 9, 3, 3);
    rect(g, palette.outline, 7, 10, 1, 1);
    rect(g, palette.outline, 12, 10, 1, 1);
    rect(g, palette.miteDark, 2, 16, 3, 2); // little feet
    rect(g, palette.miteDark, 15, 16, 3, 2);
  });
  // Shade Pup: a dark four-legged critter with glowing eyes.
  make(scene, TextureKey.EnemyShadePup, 24, 20, (g) => {
    rect(g, palette.shadeDark, 4, 6, 16, 10);
    rect(g, palette.shade, 5, 7, 14, 8);
    rect(g, palette.shadeDark, 5, 15, 3, 4); // legs
    rect(g, palette.shadeDark, 16, 15, 3, 4);
    rect(g, palette.shade, 17, 4, 6, 7); // head
    rect(g, palette.shadeDark, 17, 3, 6, 2);
    rect(g, palette.glow, 19, 6, 2, 2); // glowing eye
    rect(g, palette.shadeDark, 2, 8, 4, 2); // tail
  });
  // Crop Nibbler: a small round pink critter with buck teeth.
  make(scene, TextureKey.EnemyCropNibbler, 18, 16, (g) => {
    rect(g, palette.outline, 3, 4, 12, 11);
    rect(g, palette.nibbler, 4, 5, 10, 9);
    rect(g, palette.nibblerDark, 4, 11, 10, 3);
    rect(g, palette.uiInk, 5, 7, 3, 3); // eyes
    rect(g, palette.uiInk, 10, 7, 3, 3);
    rect(g, palette.outline, 6, 8, 1, 1);
    rect(g, palette.outline, 11, 8, 1, 1);
    rect(g, palette.uiInk, 7, 12, 4, 2); // teeth
    rect(g, palette.nibblerDark, 1, 6, 3, 3); // ears
    rect(g, palette.nibblerDark, 14, 6, 3, 3);
  });
}

function buildSlash(scene: Phaser.Scene): void {
  const s = 30;
  make(scene, TextureKey.Slash, s, s, (g) => {
    rect(g, palette.slash, 20, 4, 4, 6);
    rect(g, palette.slash, 17, 9, 4, 5);
    rect(g, palette.slash, 13, 13, 4, 5);
    rect(g, palette.slash, 9, 17, 4, 5);
    rect(g, palette.slash, 6, 22, 4, 4);
  });
}

function buildHearts(scene: Phaser.Scene): void {
  const s = 14;
  const heart = (g: Phaser.GameObjects.Graphics, color: number) => {
    rect(g, color, 2, 4, 4, 5);
    rect(g, color, 8, 4, 4, 5);
    rect(g, color, 2, 3, 4, 2);
    rect(g, color, 8, 3, 4, 2);
    rect(g, color, 3, 9, 8, 2);
    rect(g, color, 4, 11, 6, 1);
    rect(g, color, 6, 12, 2, 1);
  };
  make(scene, TextureKey.HeartFull, s, s, (g) => heart(g, palette.heartRed));
  make(scene, TextureKey.HeartEmpty, s, s, (g) => heart(g, palette.heartEmpty));
}

function buildCaches(scene: Phaser.Scene): void {
  const w = 28;
  const h = 24;
  // Closed: a dark starlit reliquary with a glowing seam.
  make(scene, TextureKey.CacheClosed, w, h, (g) => {
    rect(g, palette.outline, 2, 4, w - 4, h - 4);
    rect(g, palette.starlessDark, 3, 5, w - 6, h - 6);
    rect(g, palette.starless, 5, 7, w - 10, h - 11);
    rect(g, palette.starlight, 4, 12, w - 8, 1); // glowing seam
    rect(g, palette.cacheGold, w / 2 - 1, 6, 2, h - 9); // clasp
    rect(g, palette.starlessTrim, 8, 9, 2, 2); // little stars
    rect(g, palette.starlessTrim, 17, 10, 2, 2);
  });
  // Open: emptied, lid ajar.
  make(scene, TextureKey.CacheOpen, w, h, (g) => {
    rect(g, palette.outline, 2, 8, w - 4, h - 8);
    rect(g, palette.starlessDark, 3, 9, w - 6, h - 10);
    rect(g, palette.outline, 0, 2, w, 5); // tilted-open lid
    rect(g, palette.starless, 2, 3, w - 4, 3);
  });
}

// The five Starless pieces share a deep-blue palette with starlight accents.
function buildArmorIcons(scene: Phaser.Scene): void {
  const s = 20;
  make(scene, TextureKey.IconStarlessHelm, s, s, (g) => {
    rect(g, palette.starless, 5, 4, 10, 9);
    rect(g, palette.starlessDark, 5, 11, 10, 4);
    rect(g, palette.starlight, 8, 6, 4, 2);
    rect(g, palette.starlessTrim, 9, 2, 2, 3); // crest
  });
  make(scene, TextureKey.IconStarlessPlate, s, s, (g) => {
    rect(g, palette.starless, 4, 4, 12, 12);
    rect(g, palette.starlessDark, 9, 4, 2, 12);
    rect(g, palette.starlight, 7, 8, 2, 2);
    rect(g, palette.starlight, 11, 8, 2, 2);
    rect(g, palette.starlessTrim, 4, 4, 12, 1);
  });
  make(scene, TextureKey.IconStarlessGauntlets, s, s, (g) => {
    rect(g, palette.starless, 5, 6, 5, 10);
    rect(g, palette.starless, 11, 6, 4, 10);
    rect(g, palette.starlessDark, 5, 12, 10, 2);
    rect(g, palette.starlight, 6, 8, 2, 2);
  });
  make(scene, TextureKey.IconStarlessGreaves, s, s, (g) => {
    rect(g, palette.starless, 5, 4, 4, 12);
    rect(g, palette.starless, 11, 4, 4, 12);
    rect(g, palette.starlessDark, 4, 14, 6, 3);
    rect(g, palette.starlessDark, 10, 14, 6, 3);
    rect(g, palette.starlight, 6, 7, 2, 2);
  });
  make(scene, TextureKey.IconStarlessBlade, s, s, (g) => {
    rect(g, palette.starlight, 9, 2, 2, 11);
    rect(g, palette.starless, 11, 3, 1, 10);
    rect(g, palette.starlessTrim, 6, 13, 8, 2); // guard
    rect(g, palette.starlessDark, 9, 15, 2, 4); // grip
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
  // sword: a simple steel blade
  make(scene, TextureKey.IconSword, s, s, (g) => {
    rect(g, palette.steel, 9, 2, 2, 11);
    rect(g, palette.steelDark, 11, 3, 1, 10);
    rect(g, palette.metal, 6, 13, 8, 2); // guard
    rect(g, palette.woodDark, 9, 15, 2, 4); // grip
  });
  // armor: a padded vest
  make(scene, TextureKey.IconArmor, s, s, (g) => {
    rect(g, palette.outline, 5, 4, 10, 13);
    rect(g, palette.cloth, 6, 5, 8, 11);
    rect(g, palette.clothDark, 9, 5, 2, 11);
    rect(g, palette.skin, 8, 3, 4, 2); // collar gap
  });
  // seed packets: a shared pip shape tinted per crop
  buildSeedIcon(scene, TextureKey.IconCarrotSeed, palette.carrot);
  buildSeedIcon(scene, TextureKey.IconPumpkinSeed, palette.pumpkin);
  // carrot: orange root with green top
  make(scene, TextureKey.IconCarrot, s, s, (g) => {
    rect(g, palette.carrot, 8, 6, 4, 10);
    rect(g, palette.carrot, 9, 16, 2, 2);
    rect(g, palette.carrotDark, 11, 7, 1, 8);
    rect(g, palette.leaf, 7, 2, 2, 4);
    rect(g, palette.leaf, 11, 2, 2, 4);
    rect(g, palette.leafDark, 9, 1, 2, 5);
  });
  // pumpkin: round ribbed gourd
  make(scene, TextureKey.IconPumpkin, s, s, (g) => {
    rect(g, palette.pumpkin, 4, 7, 12, 9);
    rect(g, palette.pumpkin, 5, 6, 10, 11);
    rect(g, palette.pumpkinRib, 9, 6, 2, 11);
    rect(g, palette.pumpkinDark, 6, 7, 1, 9);
    rect(g, palette.pumpkinDark, 13, 7, 1, 9);
    rect(g, palette.leafDark, 9, 3, 2, 4); // stem
  });
  // egg
  make(scene, TextureKey.IconEgg, s, s, (g) => {
    rect(g, palette.outline, 7, 4, 6, 12);
    rect(g, palette.egg, 7, 6, 6, 9);
    rect(g, palette.egg, 8, 4, 4, 2);
    rect(g, palette.egg, 8, 15, 4, 1);
    rect(g, palette.uiInk, 8, 7, 2, 2); // shine
  });
  // berry cluster
  make(scene, TextureKey.IconBerry, s, s, (g) => {
    rect(g, palette.berry, 6, 9, 4, 4);
    rect(g, palette.berry, 11, 8, 4, 4);
    rect(g, palette.berry, 9, 13, 4, 4);
    rect(g, palette.berryLeaf, 8, 4, 2, 4);
    rect(g, palette.berryLeaf, 11, 4, 2, 3);
  });
  // ruin shard: a cyan crystal
  make(scene, TextureKey.IconRuinShard, s, s, (g) => {
    rect(g, palette.outline, 8, 3, 4, 14);
    rect(g, palette.shard, 9, 4, 2, 12);
    rect(g, palette.uiInk, 9, 6, 1, 4);
    rect(g, palette.shard, 6, 8, 2, 5);
    rect(g, palette.shard, 12, 7, 2, 6);
  });
  // shadow wisp: a wispy purple flame
  make(scene, TextureKey.IconShadowWisp, s, s, (g) => {
    rect(g, palette.wisp, 8, 4, 4, 10);
    rect(g, palette.wisp, 6, 7, 2, 6);
    rect(g, palette.wisp, 12, 8, 2, 5);
    rect(g, palette.glow, 9, 6, 2, 3);
    rect(g, palette.shadeDark, 7, 14, 6, 3);
  });
}

function buildSeedIcon(scene: Phaser.Scene, key: string, tint: number): void {
  const s = 20;
  make(scene, key, s, s, (g) => {
    rect(g, palette.woodDark, 6, 4, 8, 12); // packet
    rect(g, palette.wood, 7, 5, 6, 10);
    rect(g, tint, 9, 9, 3, 3); // seed pip
    rect(g, palette.leaf, 9, 6, 2, 2);
  });
}

// Crop growth stages, drawn within a tile-sized canvas so the plant sits on the soil.
// Early stages (mound/sprout/leafy) are shared; each crop has its own mature look.
function buildCropStages(scene: Phaser.Scene): void {
  const w = TILE;
  const h = TILE;
  const cx = Math.floor(w / 2);

  const mature: Record<CropId, (g: Phaser.GameObjects.Graphics) => void> = {
    [CropId.Turnip]: (g) => {
      rect(g, palette.bulb, cx - 5, h - 12, 10, 9);
      rect(g, palette.bulb, cx - 4, h - 4, 8, 2);
      rect(g, palette.bulbTop, cx - 5, h - 14, 10, 3);
      rect(g, palette.leaf, cx - 4, h - 22, 2, 8);
      rect(g, palette.leaf, cx + 2, h - 22, 2, 8);
      rect(g, palette.leafDark, cx - 1, h - 20, 2, 7);
    },
    [CropId.Carrot]: (g) => {
      rect(g, palette.carrot, cx - 4, h - 12, 8, 9);
      rect(g, palette.carrot, cx - 2, h - 4, 4, 3);
      rect(g, palette.carrotDark, cx + 1, h - 11, 2, 8);
      rect(g, palette.leaf, cx - 4, h - 22, 2, 9);
      rect(g, palette.leaf, cx + 2, h - 22, 2, 9);
      rect(g, palette.leafDark, cx - 1, h - 24, 2, 11);
    },
    [CropId.Pumpkin]: (g) => {
      rect(g, palette.pumpkin, cx - 7, h - 13, 14, 11);
      rect(g, palette.pumpkin, cx - 6, h - 15, 12, 13);
      rect(g, palette.pumpkinRib, cx - 1, h - 15, 2, 13);
      rect(g, palette.pumpkinDark, cx - 5, h - 13, 1, 11);
      rect(g, palette.pumpkinDark, cx + 4, h - 13, 1, 11);
      rect(g, palette.leafDark, cx - 1, h - 18, 2, 4); // stem
    },
  };

  for (const cropId of Object.keys(CROPS) as CropId[]) {
    const stages = CROPS[cropId].growthStages;
    for (let stage = 0; stage < stages; stage++) {
      make(scene, cropTextureKey(cropId, stage), w, h, (g) => {
        if (stage >= stages - 1) {
          mature[cropId](g);
        } else if (stage === 0) {
          rect(g, palette.soilDark, cx - 4, h - 8, 8, 4); // mound
          rect(g, palette.leaf, cx - 1, h - 11, 2, 3);
        } else if (stage === 1) {
          rect(g, palette.leaf, cx - 1, h - 14, 2, 6); // sprout
          rect(g, palette.leaf, cx - 4, h - 12, 3, 2);
          rect(g, palette.leaf, cx + 1, h - 12, 3, 2);
        } else {
          rect(g, palette.leafDark, cx - 5, h - 16, 10, 6); // leafy
          rect(g, palette.leaf, cx - 4, h - 17, 8, 5);
          rect(g, palette.leaf, cx - 1, h - 20, 2, 4);
        }
      });
    }
  }
}
