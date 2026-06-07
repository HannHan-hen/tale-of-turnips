// The world gameplay scene. A thin, data-driven coordinator: it renders whatever map the
// player is currently on (from the map registry) and, each frame, asks the systems to move
// the player, grow crops, resolve interactions, and persist. Game rules live in the
// systems and data — not here. Switching maps is a scene restart after a state transition.

import Phaser from 'phaser';
import { cropTextureKey, TextureKey } from '../data/assetKeys';
import { Balance } from '../data/balance';
import { CROPS } from '../data/crops';
import { MAPS, TILE, tileCenter, type MapDef } from '../data/maps';
import { GameStateStore } from '../state/GameStateStore';
import { saveGame } from '../save/SaveSystem';
import { cropAt, growthStage, isMature, plant, removeCrop } from '../systems/FarmingSystem';
import { sellAll } from '../systems/EconomySystem';
import { findNearestTarget } from '../systems/InteractionSystem';
import { InputSystem } from '../systems/InputSystem';
import { add, has, remove } from '../systems/InventorySystem';
import { movePlayer, type Bounds } from '../systems/PlayerController';
import { transitionTo } from '../systems/MapTransitionSystem';
import { advanceTick } from '../systems/TimeSystem';
import { InteractionKind, ItemId, SceneKey } from '../types/ids';
import type { CropInstance, InteractionTarget } from '../types/models';
import { UiEvent } from '../ui/uiEvents';
import { STORE_KEY } from './BootScene';

export class WorldScene extends Phaser.Scene {
  private store!: GameStateStore;
  private def!: MapDef;
  private controls!: InputSystem;
  private playerSprite!: Phaser.GameObjects.Image;
  private cropSprites!: Map<CropInstance, Phaser.GameObjects.Image>;
  private bounds!: Bounds;
  private targets: InteractionTarget[] = [];

  private tickAccum = 0;
  private saveAccum = 0;
  private lastPrompt: string | null = null;

  constructor() {
    super(SceneKey.World);
  }

  create(): void {
    // Reset per-map state (this scene is restarted on every map transition).
    this.store = this.registry.get(STORE_KEY) as GameStateStore;
    this.def = MAPS[this.store.player.mapId];
    this.cropSprites = new Map();
    this.tickAccum = 0;
    this.saveAccum = 0;
    this.lastPrompt = null;

    this.drawGround();
    this.drawObjects();
    this.targets = this.buildTargets();

    for (const crop of this.store.currentMap().crops) this.addCropSprite(crop);

    const p = this.store.player;
    this.playerSprite = this.add.image(p.x, p.y, TextureKey.Player).setOrigin(0.5, 0.9);

    this.bounds = this.computeBounds();
    this.controls = new InputSystem(this);

    this.game.events.emit(UiEvent.Hud);
    this.game.events.emit(UiEvent.Prompt, null);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => saveGame(this.store.state));
  }

  update(_time: number, deltaMs: number): void {
    const dt = deltaMs / 1000;
    const player = this.store.player;

    movePlayer(player, this.controls.getMovement(), Balance.playerSpeed, dt, this.bounds);
    this.playerSprite.setPosition(player.x, player.y).setDepth(player.y);
    this.playerSprite.setFlipX(player.facing === 'left');

    // Growth advances globally; crops keep maturing even while indoors.
    this.tickAccum += deltaMs;
    let grew = false;
    while (this.tickAccum >= Balance.tickMs) {
      this.tickAccum -= Balance.tickMs;
      advanceTick(this.store.state.time);
      grew = true;
    }
    if (grew) this.refreshCropTextures();

    const target = findNearestTarget(player.x, player.y, this.targets, Balance.interactRadius);
    this.updatePrompt(target);
    if (target && this.controls.interactJustPressed()) this.handleInteract(target);

    this.saveAccum += deltaMs;
    if (this.saveAccum >= Balance.autosaveMs) {
      this.saveAccum = 0;
      saveGame(this.store.state);
    }
  }

  // --- rendering ---

  private drawGround(): void {
    const def = this.def;
    const floorKey = def.floor === 'wood' ? TextureKey.WoodFloor : TextureKey.GrassTile;
    const wt = def.wallThickness;
    for (let ty = 0; ty < def.heightTiles; ty++) {
      for (let tx = 0; tx < def.widthTiles; tx++) {
        const isWall = tx < wt || ty < wt || tx >= def.widthTiles - wt || ty >= def.heightTiles - wt;
        this.add
          .image(tx * TILE, ty * TILE, isWall ? TextureKey.Wall : floorKey)
          .setOrigin(0, 0)
          .setDepth(isWall ? -8 : -10);
      }
    }
    for (const plot of def.plots) {
      this.add.image(plot.x * TILE, plot.y * TILE, TextureKey.SoilTile).setOrigin(0, 0).setDepth(-9);
    }
  }

  private drawObjects(): void {
    const def = this.def;
    if (def.shippingBox) {
      const c = tileCenter(def.shippingBox);
      this.add.image(c.x, c.y, TextureKey.ShippingBox).setOrigin(0.5, 0.8).setDepth(c.y);
    }
    for (const chest of def.chests) {
      const c = tileCenter(chest.tile);
      this.add.image(c.x, c.y, TextureKey.Chest).setOrigin(0.5, 0.7).setDepth(c.y);
    }
    for (const exit of def.exits) {
      const c = tileCenter(exit.tile);
      const key = exit.art === 'cottage' ? TextureKey.Cottage : TextureKey.Door;
      this.add.image(c.x, c.y, key).setOrigin(0.5, 0.9).setDepth(c.y - 2);
    }
  }

  private addCropSprite(crop: CropInstance): void {
    const c = tileCenter({ x: crop.tileX, y: crop.tileY });
    const stage = growthStage(crop, this.store.state.time.tick);
    const spr = this.add.image(c.x, c.y, cropTextureKey(crop.cropId, stage)).setOrigin(0.5, 0.85);
    spr.setDepth(c.y - 1);
    this.cropSprites.set(crop, spr);
  }

  private refreshCropTextures(): void {
    const tick = this.store.state.time.tick;
    for (const [crop, spr] of this.cropSprites) {
      spr.setTexture(cropTextureKey(crop.cropId, growthStage(crop, tick)));
    }
  }

  private computeBounds(): Bounds {
    const def = this.def;
    const mapW = def.widthTiles * TILE;
    const mapH = def.heightTiles * TILE;
    if (def.wallThickness > 0) {
      const m = def.wallThickness * TILE + 6;
      return { minX: m, minY: m, maxX: mapW - m, maxY: mapH - m };
    }
    return { minX: 12, minY: 16, maxX: mapW - 12, maxY: mapH - 6 };
  }

  // --- interaction ---

  private buildTargets(): InteractionTarget[] {
    const def = this.def;
    const targets: InteractionTarget[] = [];
    def.plots.forEach((plot, i) => {
      const c = tileCenter(plot);
      targets.push({ kind: InteractionKind.Plot, x: c.x, y: c.y, plotIndex: i });
    });
    if (def.shippingBox) {
      const c = tileCenter(def.shippingBox);
      targets.push({ kind: InteractionKind.ShippingBox, x: c.x, y: c.y });
    }
    def.chests.forEach((chest) => {
      const c = tileCenter(chest.tile);
      targets.push({ kind: InteractionKind.Chest, x: c.x, y: c.y, chestId: chest.chestId });
    });
    def.exits.forEach((exit, i) => {
      const c = tileCenter(exit.tile);
      targets.push({ kind: InteractionKind.Door, x: c.x, y: c.y, exitIndex: i });
    });
    return targets;
  }

  private updatePrompt(target: InteractionTarget | undefined): void {
    const prompt = target ? this.promptFor(target) : null;
    if (prompt !== this.lastPrompt) {
      this.lastPrompt = prompt;
      this.game.events.emit(UiEvent.Prompt, prompt);
    }
  }

  private promptFor(target: InteractionTarget): string {
    switch (target.kind) {
      case InteractionKind.ShippingBox:
        return 'Sell  [E]';
      case InteractionKind.Chest:
        return 'Open chest  [E]';
      case InteractionKind.Door:
        return `${this.def.exits[target.exitIndex!].label}  [E]`;
      case InteractionKind.Plot: {
        const crop = this.cropAtTarget(target);
        if (!crop) {
          return has(this.store.player.inventory, ItemId.TurnipSeed) ? 'Plant turnip  [E]' : 'No seeds';
        }
        return isMature(crop, this.store.state.time.tick) ? 'Harvest  [E]' : 'Growing…';
      }
      default:
        return '';
    }
  }

  private handleInteract(target: InteractionTarget): void {
    switch (target.kind) {
      case InteractionKind.ShippingBox:
        this.sellAtBox();
        break;
      case InteractionKind.Chest:
        this.openChest(target.chestId!);
        return; // chest scene takes over; don't save mid-pause here
      case InteractionKind.Door:
        this.useExit(target.exitIndex!);
        return; // scene restarts
      case InteractionKind.Plot:
        this.usePlot(target);
        break;
    }
    this.lastPrompt = null; // force a prompt refresh after the action
    saveGame(this.store.state);
  }

  private openChest(chestId: string): void {
    this.game.events.emit(UiEvent.Prompt, null);
    saveGame(this.store.state);
    this.scene.pause();
    this.scene.launch(SceneKey.Chest, { chestId });
  }

  private useExit(exitIndex: number): void {
    const exit = this.def.exits[exitIndex];
    transitionTo(this.store.state, exit.toMap, exit.toSpawn);
    saveGame(this.store.state);
    this.scene.restart();
  }

  private sellAtBox(): void {
    const result = sellAll(this.store.player.inventory);
    if (result.itemsSold > 0) {
      this.store.player.gold += result.gold;
      this.toast(`Sold for ${result.gold}g.`);
      this.game.events.emit(UiEvent.Hud);
    } else {
      this.toast('Nothing to sell.');
    }
  }

  private usePlot(target: InteractionTarget): void {
    const map = this.store.currentMap();
    const inv = this.store.player.inventory;
    const crop = this.cropAtTarget(target);
    const plot = this.def.plots[target.plotIndex!];

    if (!crop) {
      if (remove(inv, ItemId.TurnipSeed, 1)) {
        const planted = plant(map, CROPS.turnip.cropId, this.def.mapId, plot.x, plot.y, this.store.state.time.tick);
        if (planted) this.addCropSprite(planted);
        this.toast('Planted turnip.');
        this.game.events.emit(UiEvent.Hud);
      } else {
        this.toast('No seeds left.');
      }
      return;
    }

    if (!isMature(crop, this.store.state.time.tick)) {
      this.toast('Still growing…');
      return;
    }

    const def = CROPS[crop.cropId];
    if (add(inv, def.harvestItem, def.harvestYield)) {
      removeCrop(map, crop);
      const spr = this.cropSprites.get(crop);
      if (spr) {
        spr.destroy();
        this.cropSprites.delete(crop);
      }
      this.store.state.stats.cropsHarvested += def.harvestYield;
      this.toast(`Harvested ${def.displayName}.`);
      this.game.events.emit(UiEvent.Hud);
    } else {
      this.toast('Inventory full.');
    }
  }

  private cropAtTarget(target: InteractionTarget): CropInstance | undefined {
    const plot = this.def.plots[target.plotIndex!];
    return cropAt(this.store.currentMap(), plot.x, plot.y);
  }

  private toast(message: string): void {
    this.game.events.emit(UiEvent.Toast, message);
  }
}
