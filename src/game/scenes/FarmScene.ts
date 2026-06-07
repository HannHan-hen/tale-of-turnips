// The farm gameplay scene. Thin coordinator: it renders the map and player, then each
// frame asks the systems to move the player, grow crops, resolve interactions, and persist.
// Game rules live in the systems and data — not here.

import Phaser from 'phaser';
import { cropTextureKey, TextureKey } from '../data/assetKeys';
import { Balance } from '../data/balance';
import { CROPS } from '../data/crops';
import { MAPS, TILE, tileCenter } from '../data/maps';
import { GameStateStore } from '../state/GameStateStore';
import { saveGame } from '../save/SaveSystem';
import { cropAt, growthStage, isMature, plant, removeCrop } from '../systems/FarmingSystem';
import { sellAll } from '../systems/EconomySystem';
import { findNearestTarget } from '../systems/InteractionSystem';
import { InputSystem } from '../systems/InputSystem';
import { add, has, remove } from '../systems/InventorySystem';
import { movePlayer, type Bounds } from '../systems/PlayerController';
import { advanceTick } from '../systems/TimeSystem';
import { InteractionKind, ItemId, MapId, SceneKey } from '../types/ids';
import type { CropInstance, InteractionTarget } from '../types/models';
import { UiEvent } from '../ui/uiEvents';
import { STORE_KEY } from './BootScene';

export class FarmScene extends Phaser.Scene {
  private store!: GameStateStore;
  private controls!: InputSystem;
  private playerSprite!: Phaser.GameObjects.Image;
  private cropSprites = new Map<CropInstance, Phaser.GameObjects.Image>();
  private bounds!: Bounds;
  private targets: InteractionTarget[] = [];

  private tickAccum = 0;
  private saveAccum = 0;
  private lastPrompt: string | null = null;

  constructor() {
    super(SceneKey.Farm);
  }

  create(): void {
    this.store = this.registry.get(STORE_KEY) as GameStateStore;
    const farm = MAPS[MapId.Farm];
    const mapW = farm.widthTiles * TILE;
    const mapH = farm.heightTiles * TILE;

    this.drawGround();

    // shipping box
    const box = tileCenter(farm.shippingBoxTile);
    this.add.image(box.x, box.y, TextureKey.ShippingBox).setOrigin(0.5, 0.8).setDepth(box.y);

    // pre-build the (static) interaction target list
    this.targets = this.buildTargets();

    // crops carried over from a loaded save
    for (const crop of this.store.currentMap().crops) this.addCropSprite(crop);

    // player
    const p = this.store.player;
    this.playerSprite = this.add.image(p.x, p.y, TextureKey.Player).setOrigin(0.5, 0.9);

    this.bounds = { minX: 12, minY: 16, maxX: mapW - 12, maxY: mapH - 6 };
    this.controls = new InputSystem(this);

    // initial UI state
    this.game.events.emit(UiEvent.Hud);
    this.game.events.emit(UiEvent.Prompt, null);

    // persist on the way out
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => saveGame(this.store.state));
  }

  update(_time: number, deltaMs: number): void {
    const dt = deltaMs / 1000;
    const player = this.store.player;

    // movement
    movePlayer(player, this.controls.getMovement(), Balance.playerSpeed, dt, this.bounds);
    this.playerSprite.setPosition(player.x, player.y).setDepth(player.y);
    this.playerSprite.setFlipX(player.facing === 'left');

    // growth
    this.tickAccum += deltaMs;
    let grew = false;
    while (this.tickAccum >= Balance.tickMs) {
      this.tickAccum -= Balance.tickMs;
      advanceTick(this.store.state.time);
      grew = true;
    }
    if (grew) this.refreshCropTextures();

    // interaction
    const target = findNearestTarget(player.x, player.y, this.targets, Balance.interactRadius);
    this.updatePrompt(target);
    if (target && this.controls.interactJustPressed()) this.handleInteract(target);

    // autosave
    this.saveAccum += deltaMs;
    if (this.saveAccum >= Balance.autosaveMs) {
      this.saveAccum = 0;
      saveGame(this.store.state);
    }
  }

  // --- rendering helpers ---

  private drawGround(): void {
    const farm = MAPS[MapId.Farm];
    for (let ty = 0; ty < farm.heightTiles; ty++) {
      for (let tx = 0; tx < farm.widthTiles; tx++) {
        this.add.image(tx * TILE, ty * TILE, TextureKey.GrassTile).setOrigin(0, 0).setDepth(-10);
      }
    }
    for (const plot of farm.plots) {
      this.add.image(plot.x * TILE, plot.y * TILE, TextureKey.SoilTile).setOrigin(0, 0).setDepth(-9);
    }
  }

  private buildTargets(): InteractionTarget[] {
    const farm = MAPS[MapId.Farm];
    const targets: InteractionTarget[] = [];
    farm.plots.forEach((plot, i) => {
      const c = tileCenter(plot);
      targets.push({ kind: InteractionKind.Plot, x: c.x, y: c.y, plotIndex: i });
    });
    const box = tileCenter(farm.shippingBoxTile);
    targets.push({ kind: InteractionKind.ShippingBox, x: box.x, y: box.y });
    return targets;
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

  // --- interaction handling ---

  private updatePrompt(target: InteractionTarget | undefined): void {
    const prompt = target ? this.promptFor(target) : null;
    if (prompt !== this.lastPrompt) {
      this.lastPrompt = prompt;
      this.game.events.emit(UiEvent.Prompt, prompt);
    }
  }

  private promptFor(target: InteractionTarget): string {
    if (target.kind === InteractionKind.ShippingBox) return 'Sell  [E]';
    const crop = this.cropAtTarget(target);
    if (!crop) {
      return has(this.store.player.inventory, ItemId.TurnipSeed) ? 'Plant turnip  [E]' : 'No seeds';
    }
    return isMature(crop, this.store.state.time.tick) ? 'Harvest  [E]' : 'Growing…';
  }

  private handleInteract(target: InteractionTarget): void {
    if (target.kind === InteractionKind.ShippingBox) {
      this.sellAtBox();
    } else {
      this.usePlot(target);
    }
    this.lastPrompt = null; // force a prompt refresh after the action
    saveGame(this.store.state);
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
    const plot = MAPS[MapId.Farm].plots[target.plotIndex!];

    if (!crop) {
      if (remove(inv, ItemId.TurnipSeed, 1)) {
        const planted = plant(map, CROPS.turnip.cropId, MapId.Farm, plot.x, plot.y, this.store.state.time.tick);
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
    const plot = MAPS[MapId.Farm].plots[target.plotIndex!];
    return cropAt(this.store.currentMap(), plot.x, plot.y);
  }

  private toast(message: string): void {
    this.game.events.emit(UiEvent.Toast, message);
  }
}
