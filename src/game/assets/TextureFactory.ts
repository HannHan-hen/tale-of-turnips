// Procedural art. Every texture is drawn here in code at boot using the shared palette,
// then registered under a key from assetKeys. Swap this for loaded image assets later
// without changing any gameplay code (which only ever references the keys).

import Phaser from 'phaser';
import { cropTextureKey, TextureKey } from '../data/assetKeys';
import { CROPS } from '../data/crops';
import { palette } from '../data/palette';
import { TILE } from '../data/maps';
import { CropId } from '../types/ids';
import { resolvePixels, type PixelSprite } from './sprites/spriteGrid';
import { FARMER } from './sprites/farmer';
import { JAY, SEED_SELLER, BLACKSMITH, VILLAGER } from './sprites/characters';
import { CHICKEN } from './sprites/chicken';
import { CROP_MOUND, CROP_SPROUT, CROP_LEAFY, TURNIP, CARROT, PUMPKIN } from './sprites/crops';
import { BUSH_FULL, BUSH_EMPTY } from './sprites/bushes';
import { RUIN_MITE, SHADE_PUP, CROP_NIBBLER, RUIN_HEART } from './sprites/enemies';
import {
  SHIPPING_BOX,
  DOOR,
  CHEST,
  SIGNPOST,
  ANVIL,
  RUBBLE,
  SEALED_DOOR,
  CACHE_CLOSED,
  CACHE_OPEN,
  COTTAGE,
  STALL,
} from './sprites/props';

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

function rect(
  g: Phaser.GameObjects.Graphics,
  color: number,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  g.fillStyle(color, 1);
  g.fillRect(x, y, w, h);
}

// Paint a pixel-grid sprite (see sprites/spriteGrid) into a texture, one pixel per cell.
// This is the path for hand-authored pixel art; the older rect()-based builders below are
// being migrated onto it sprite by sprite.
function paintSprite(scene: Phaser.Scene, key: string, sprite: PixelSprite): void {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  for (const px of resolvePixels(sprite)) {
    g.fillStyle(px.color, 1);
    g.fillRect(px.x, px.y, 1, 1);
  }
  g.generateTexture(key, sprite.width, sprite.height);
  g.destroy();
}

// Paint a sprite at an offset inside a larger texture (e.g. a crop sitting on the soil at the
// bottom of a tile-sized canvas).
function paintSpriteInto(
  scene: Phaser.Scene,
  key: string,
  sprite: PixelSprite,
  texW: number,
  texH: number,
  ox: number,
  oy: number,
): void {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  for (const px of resolvePixels(sprite)) {
    g.fillStyle(px.color, 1);
    g.fillRect(ox + px.x, oy + px.y, 1, 1);
  }
  g.generateTexture(key, texW, texH);
  g.destroy();
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
  buildRuinHeart(scene);
  buildSealedDoor(scene);
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
  paintSprite(scene, TextureKey.Player, FARMER);
}

function buildShippingBox(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.ShippingBox, SHIPPING_BOX);
}

function buildCottage(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.Cottage, COTTAGE);
}

function buildDoor(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.Door, DOOR);
}

function buildChest(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.Chest, CHEST);
}

function buildSignpost(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.Signpost, SIGNPOST);
}

function buildStall(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.Stall, STALL);
}

function buildAnvil(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.Anvil, ANVIL);
}

// The villager cast, each a hand-authored pixel grid (sprites/characters).
function buildNpcs(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.NpcSeedSeller, SEED_SELLER);
  paintSprite(scene, TextureKey.NpcBlacksmith, BLACKSMITH);
  paintSprite(scene, TextureKey.NpcVillager, VILLAGER);
  paintSprite(scene, TextureKey.NpcJay, JAY);
}

function buildChicken(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.Chicken, CHICKEN);
}

function buildBushes(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.BushFull, BUSH_FULL);
  paintSprite(scene, TextureKey.BushEmpty, BUSH_EMPTY);
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
  paintSprite(scene, TextureKey.Rubble, RUBBLE);
}

function buildEnemies(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.EnemyRuinMite, RUIN_MITE);
  paintSprite(scene, TextureKey.EnemyShadePup, SHADE_PUP);
  paintSprite(scene, TextureKey.EnemyCropNibbler, CROP_NIBBLER);
}

function buildRuinHeart(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.EnemyRuinHeart, RUIN_HEART);
}

function buildSealedDoor(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.SealedDoor, SEALED_DOOR);
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
  paintSprite(scene, TextureKey.CacheClosed, CACHE_CLOSED);
  paintSprite(scene, TextureKey.CacheOpen, CACHE_OPEN);
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

// Crop growth stages, each a pixel-grid sprite (sprites/crops) painted bottom-centered into a
// tile-sized canvas so the plant sits on the soil. The early stages are shared; each crop has
// its own ripe look for the final stage.
function buildCropStages(scene: Phaser.Scene): void {
  const early = [CROP_MOUND, CROP_SPROUT, CROP_LEAFY];
  const ripe: Record<CropId, PixelSprite> = {
    [CropId.Turnip]: TURNIP,
    [CropId.Carrot]: CARROT,
    [CropId.Pumpkin]: PUMPKIN,
  };

  for (const cropId of Object.keys(CROPS) as CropId[]) {
    const stages = CROPS[cropId].growthStages;
    for (let stage = 0; stage < stages; stage++) {
      const sprite =
        stage >= stages - 1 ? ripe[cropId] : early[Math.min(stage, early.length - 1)];
      const ox = Math.floor((TILE - sprite.width) / 2);
      const oy = TILE - sprite.height - 2; // sit on the soil, a couple px from the bottom
      paintSpriteInto(scene, cropTextureKey(cropId, stage), sprite, TILE, TILE, ox, oy);
    }
  }
}
