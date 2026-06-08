// Procedural art. Every texture is drawn here in code at boot using the shared palette,
// then registered under a key from assetKeys. Swap this for loaded image assets later
// without changing any gameplay code (which only ever references the keys).

import Phaser from 'phaser';
import { cropTextureKey, PlayerAnim, PlayerFrame, TextureKey } from '../data/assetKeys';
import { CROPS } from '../data/crops';
import { palette } from '../data/palette';
import { TILE } from '../data/maps';
import { CropId } from '../types/ids';
import { resolvePixels, type PixelSprite } from './sprites/spriteGrid';
import {
  FARMER_DOWN,
  FARMER_DOWN_WALK_A,
  FARMER_DOWN_WALK_B,
  FARMER_UP,
  FARMER_UP_WALK_A,
  FARMER_UP_WALK_B,
  FARMER_SIDE,
  FARMER_SIDE_WALK_A,
  FARMER_SIDE_WALK_B,
} from './sprites/farmer';
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
import {
  ICON_TURNIP,
  ICON_CARROT,
  ICON_PUMPKIN,
  ICON_TURNIP_SEED,
  ICON_CARROT_SEED,
  ICON_PUMPKIN_SEED,
  ICON_EGG,
  ICON_BERRY,
  ICON_SWORD,
  ICON_ARMOR,
  ICON_RUIN_SHARD,
  ICON_SHADOW_WISP,
  ICON_STARLESS_HELM,
  ICON_STARLESS_PLATE,
  ICON_STARLESS_GAUNTLETS,
  ICON_STARLESS_GREAVES,
  ICON_STARLESS_BLADE,
  HEART_FULL,
  HEART_EMPTY,
  SLASH,
} from './sprites/icons';

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
  paintSprite(scene, PlayerFrame.DownStand, FARMER_DOWN);
  paintSprite(scene, PlayerFrame.DownWalkA, FARMER_DOWN_WALK_A);
  paintSprite(scene, PlayerFrame.DownWalkB, FARMER_DOWN_WALK_B);
  paintSprite(scene, PlayerFrame.UpStand, FARMER_UP);
  paintSprite(scene, PlayerFrame.UpWalkA, FARMER_UP_WALK_A);
  paintSprite(scene, PlayerFrame.UpWalkB, FARMER_UP_WALK_B);
  paintSprite(scene, PlayerFrame.SideStand, FARMER_SIDE);
  paintSprite(scene, PlayerFrame.SideWalkA, FARMER_SIDE_WALK_A);
  paintSprite(scene, PlayerFrame.SideWalkB, FARMER_SIDE_WALK_B);
}

// Register the farmer's walk/idle animations. Each frame is its own texture, so the cycles
// reference texture keys directly. Idempotent — safe if called more than once.
export function buildPlayerAnimations(scene: Phaser.Scene): void {
  const anim = (key: string, frames: string[], frameRate: number): void => {
    if (scene.anims.exists(key)) return;
    scene.anims.create({
      key,
      frames: frames.map((f) => ({ key: f })),
      frameRate,
      repeat: -1,
    });
  };
  // Walk cycles step A -> stand -> B -> stand so the contact pose reads between steps.
  anim(PlayerAnim.IdleDown, [PlayerFrame.DownStand], 1);
  anim(
    PlayerAnim.WalkDown,
    [PlayerFrame.DownWalkA, PlayerFrame.DownStand, PlayerFrame.DownWalkB, PlayerFrame.DownStand],
    8,
  );
  anim(PlayerAnim.IdleUp, [PlayerFrame.UpStand], 1);
  anim(
    PlayerAnim.WalkUp,
    [PlayerFrame.UpWalkA, PlayerFrame.UpStand, PlayerFrame.UpWalkB, PlayerFrame.UpStand],
    8,
  );
  anim(PlayerAnim.IdleSide, [PlayerFrame.SideStand], 1);
  anim(
    PlayerAnim.WalkSide,
    [PlayerFrame.SideWalkA, PlayerFrame.SideStand, PlayerFrame.SideWalkB, PlayerFrame.SideStand],
    8,
  );
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
  paintSprite(scene, TextureKey.Slash, SLASH);
}

function buildHearts(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.HeartFull, HEART_FULL);
  paintSprite(scene, TextureKey.HeartEmpty, HEART_EMPTY);
}

function buildCaches(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.CacheClosed, CACHE_CLOSED);
  paintSprite(scene, TextureKey.CacheOpen, CACHE_OPEN);
}

// The five legendary Starless pieces (sprites/icons).
function buildArmorIcons(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.IconStarlessHelm, ICON_STARLESS_HELM);
  paintSprite(scene, TextureKey.IconStarlessPlate, ICON_STARLESS_PLATE);
  paintSprite(scene, TextureKey.IconStarlessGauntlets, ICON_STARLESS_GAUNTLETS);
  paintSprite(scene, TextureKey.IconStarlessGreaves, ICON_STARLESS_GREAVES);
  paintSprite(scene, TextureKey.IconStarlessBlade, ICON_STARLESS_BLADE);
}

// Inventory icons (sprites/icons).
function buildIcons(scene: Phaser.Scene): void {
  paintSprite(scene, TextureKey.IconTurnip, ICON_TURNIP);
  paintSprite(scene, TextureKey.IconCarrot, ICON_CARROT);
  paintSprite(scene, TextureKey.IconPumpkin, ICON_PUMPKIN);
  paintSprite(scene, TextureKey.IconTurnipSeed, ICON_TURNIP_SEED);
  paintSprite(scene, TextureKey.IconCarrotSeed, ICON_CARROT_SEED);
  paintSprite(scene, TextureKey.IconPumpkinSeed, ICON_PUMPKIN_SEED);
  paintSprite(scene, TextureKey.IconEgg, ICON_EGG);
  paintSprite(scene, TextureKey.IconBerry, ICON_BERRY);
  paintSprite(scene, TextureKey.IconSword, ICON_SWORD);
  paintSprite(scene, TextureKey.IconArmor, ICON_ARMOR);
  paintSprite(scene, TextureKey.IconRuinShard, ICON_RUIN_SHARD);
  paintSprite(scene, TextureKey.IconShadowWisp, ICON_SHADOW_WISP);
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
      const sprite = stage >= stages - 1 ? ripe[cropId] : early[Math.min(stage, early.length - 1)];
      const ox = Math.floor((TILE - sprite.width) / 2);
      const oy = TILE - sprite.height - 2; // sit on the soil, a couple px from the bottom
      paintSpriteInto(scene, cropTextureKey(cropId, stage), sprite, TILE, TILE, ox, oy);
    }
  }
}
