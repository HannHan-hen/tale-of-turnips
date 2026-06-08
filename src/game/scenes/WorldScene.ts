// The world gameplay scene. A thin, data-driven coordinator: it renders whatever map the
// player is currently on (from the map registry) and, each frame, asks the systems to move
// the player, grow crops, resolve interactions, and persist. Game rules live in the
// systems and data — not here. Switching maps is a scene restart after a state transition.

import Phaser from 'phaser';
import { cropTextureKey, PlayerAnim, TextureKey } from '../data/assetKeys';
import { SET_NAME } from '../data/armor';
import { Balance } from '../data/balance';
import { ENEMIES } from '../data/enemies';
import { CROP_ORDER, CROPS } from '../data/crops';
import { ITEMS } from '../data/items';
import { MAPS, TILE, tileCenter, type MapDef } from '../data/maps';
import { NPCS } from '../data/npcs';
import { CombatController } from '../combat/CombatController';
import { GameStateStore } from '../state/GameStateStore';
import { saveGame } from '../save/SaveSystem';
import { cropAt, growthStage, isMature, removeCrop } from '../systems/FarmingSystem';
import { petChicken } from '../systems/ChickenSystem';
import { applyDamage, rollLoot } from '../systems/CombatSystem';
import { grantMilestone } from '../systems/AffectionSystem';
import { computeLoadout, hasPiece, recalcMaxHp, type Loadout } from '../systems/EquipmentSystem';
import { harvestBush, isBushReady } from '../systems/ForagingSystem';
import { sellAll } from '../systems/EconomySystem';
import { isFarmUnderThreat, raidSize, reduceThreat, threatBand } from '../systems/ThreatSystem';
import { findNearestTarget } from '../systems/InteractionSystem';
import { InputSystem } from '../systems/InputSystem';
import { add, has } from '../systems/InventorySystem';
import { movePlayer, type Bounds } from '../systems/PlayerController';
import { transitionTo } from '../systems/MapTransitionSystem';
import { advanceWorldClock } from '../systems/WorldClockSystem';
import { usePlot as resolvePlotInteraction } from '../systems/CropInteractionSystem';
import { openCache as resolveCacheInteraction } from '../systems/CacheInteractionSystem';
import { buildSolidGrid, isSolidAt, type SolidGrid } from '../systems/CollisionSystem';
import { ArmorPieceId, EnemyId, InteractionKind, ItemId, MapId, NpcId, SceneKey } from '../types/ids';
import type { CropInstance, Facing, InteractionTarget } from '../types/models';
import { UiEvent } from '../ui/uiEvents';
import { STORE_KEY } from './BootScene';

// Map the data-driven art tags to texture keys (keeps the scene free of art branching).
const EXIT_TEXTURE = {
  cottage: TextureKey.Cottage,
  door: TextureKey.Door,
  signpost: TextureKey.Signpost,
  sealed: TextureKey.SealedDoor,
} as const;

const PROP_TEXTURE = {
  stall: TextureKey.Stall,
  anvil: TextureKey.Anvil,
  rubble: TextureKey.Rubble,
} as const;

const FLOOR_TEXTURE = {
  grass: TextureKey.GrassTile,
  wood: TextureKey.WoodFloor,
  stone: TextureKey.StoneFloor,
} as const;

const FACE_DIR: Record<Facing, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export class WorldScene extends Phaser.Scene {
  private store!: GameStateStore;
  private def!: MapDef;
  private controls!: InputSystem;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private cropSprites!: Map<CropInstance, Phaser.GameObjects.Image>;
  private bushSprites!: Map<string, Phaser.GameObjects.Image>;
  private cacheSprites!: Map<string, Phaser.GameObjects.Image>;
  private loadout!: Loadout;
  private combat?: CombatController;
  private isRaid = false;
  private bounds!: Bounds;
  private solids!: SolidGrid;
  private targets: InteractionTarget[] = [];

  private tickAccum = 0;
  private saveAccum = 0;
  private lastPrompt: string | null = null;
  private invulnUntil = 0;
  private attackReadyAt = 0;

  constructor() {
    super(SceneKey.World);
  }

  create(): void {
    // Reset per-map state (this scene is restarted on every map transition).
    this.store = this.registry.get(STORE_KEY) as GameStateStore;
    this.def = MAPS[this.store.player.mapId];
    this.cropSprites = new Map();
    this.bushSprites = new Map();
    this.cacheSprites = new Map();
    recalcMaxHp(this.store.player, this.store.state.armor);
    this.loadout = computeLoadout(this.store.state.armor, this.store.player.inventory);
    this.combat = undefined;
    this.isRaid = false;
    this.tickAccum = 0;
    this.saveAccum = 0;
    this.lastPrompt = null;
    this.invulnUntil = 0;
    this.attackReadyAt = 0;

    this.bounds = this.computeBounds();
    this.solids = buildSolidGrid(this.def);

    this.drawGround();
    this.drawObjects();
    this.drawEntities();
    this.targets = this.buildTargets();

    for (const crop of this.store.currentMap().crops) this.addCropSprite(crop);

    // Ruins-style combat: enemies chase the player. A defeated boss never respawns.
    const spawns = this.def.enemySpawns.filter(
      (s) => !(ENEMIES[s.enemyId].isBoss && this.store.state.bossDefeated),
    );
    if (spawns.length > 0) {
      this.combat = new CombatController(this, this.bounds);
      this.combat.spawn(spawns);
    }

    const p = this.store.player;
    this.playerSprite = this.add.sprite(p.x, p.y, TextureKey.Player).setOrigin(0.5, 0.9);
    this.playerSprite.play(PlayerAnim.IdleDown);

    this.controls = new InputSystem(this);

    // Farm threat: warn on arrival and, if pressure is high, launch a raid on the crops.
    if (this.def.mapId === MapId.Farm) this.handleFarmArrival();

    this.game.events.emit(UiEvent.Hud);
    this.game.events.emit(UiEvent.Prompt, null);

    // Shop/chest scenes pause (not restart) this scene, so create() won't re-run when they
    // close. Carried gear may have changed there, so refresh derived effects on resume —
    // otherwise speed, crop yield, combat damage, and max hearts would read stale values.
    const onResume = (): void => {
      recalcMaxHp(this.store.player, this.store.state.armor);
      this.loadout = computeLoadout(this.store.state.armor, this.store.player.inventory);
      this.game.events.emit(UiEvent.Hud);
    };
    this.events.on(Phaser.Scenes.Events.RESUME, onResume);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.RESUME, onResume);
      this.combat?.destroy();
      saveGame(this.store.state);
    });
  }

  update(_time: number, deltaMs: number): void {
    const dt = deltaMs / 1000;
    const player = this.store.player;

    const move = this.controls.getMovement();
    movePlayer(player, move, Balance.playerSpeed + this.loadout.bonusSpeed, dt, this.bounds, (x, y) =>
      isSolidAt(this.solids, x, y),
    );
    this.playerSprite.setPosition(player.x, player.y).setDepth(player.y);
    this.updatePlayerAnimation(move.x !== 0 || move.y !== 0);

    // Growth advances globally; crops keep maturing and bushes regrow even while indoors.
    const clock = advanceWorldClock(
      this.store.state,
      this.tickAccum,
      deltaMs,
      Balance.tickMs,
      Balance.dayLengthTicks,
    );
    this.tickAccum = clock.tickAccum;
    if (clock.grew) {
      this.refreshCropTextures();
      this.refreshBushTextures();
    }
    if (clock.newDay) this.onNewDay();

    // seed selection via number keys
    const hotkey = this.controls.numberKeyJustPressed();
    if (hotkey !== undefined && hotkey < CROP_ORDER.length) {
      this.store.player.selectedCropId = CROP_ORDER[hotkey];
      this.lastPrompt = null;
      this.game.events.emit(UiEvent.Hud);
    }

    if (this.combat) this.updateCombat(player.x, player.y, dt);

    const target = findNearestTarget(player.x, player.y, this.targets, Balance.interactRadius);
    this.updatePrompt(target);
    if (target && this.controls.interactJustPressed()) this.handleInteract(target);

    this.saveAccum += deltaMs;
    if (this.saveAccum >= Balance.autosaveMs) {
      this.saveAccum = 0;
      saveGame(this.store.state);
    }
  }

  // Play the walk or idle cycle for the current facing; left reuses the side art, flipped.
  private updatePlayerAnimation(moving: boolean): void {
    const facing = this.store.player.facing;
    let anim: PlayerAnim;
    if (facing === 'up') anim = moving ? PlayerAnim.WalkUp : PlayerAnim.IdleUp;
    else if (facing === 'down') anim = moving ? PlayerAnim.WalkDown : PlayerAnim.IdleDown;
    else anim = moving ? PlayerAnim.WalkSide : PlayerAnim.IdleSide;
    this.playerSprite.setFlipX(facing === 'left');
    this.playerSprite.play(anim, true);
  }

  // --- rendering ---

  private drawGround(): void {
    const def = this.def;
    const floorKey = FLOOR_TEXTURE[def.floor];
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
      this.add
        .image(plot.x * TILE, plot.y * TILE, TextureKey.SoilTile)
        .setOrigin(0, 0)
        .setDepth(-9);
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
      // A set-gated door shows sealed until the legendary set is whole.
      const key =
        exit.requiresSet && !this.loadout.opensBoss ? TextureKey.SealedDoor : EXIT_TEXTURE[exit.art];
      this.add
        .image(c.x, c.y, key)
        .setOrigin(0.5, 0.9)
        .setDepth(c.y - 2);
    }
    for (const prop of def.props) {
      const c = tileCenter(prop.tile);
      this.add
        .image(c.x, c.y, PROP_TEXTURE[prop.art])
        .setOrigin(0.5, 0.85)
        .setDepth(c.y - 3);
    }
    for (const npc of def.npcs) {
      const c = tileCenter(npc.tile);
      this.add.image(c.x, c.y, NPCS[npc.npcId].textureKey).setOrigin(0.5, 0.9).setDepth(c.y);
    }
    for (const cache of def.caches) {
      const c = tileCenter(cache.tile);
      const opened = hasPiece(this.store.state.armor, cache.pieceId);
      const spr = this.add
        .image(c.x, c.y, opened ? TextureKey.CacheOpen : TextureKey.CacheClosed)
        .setOrigin(0.5, 0.8)
        .setDepth(c.y);
      this.cacheSprites.set(cache.id, spr);
    }
  }

  // Chickens (with a gentle idle bob) and bushes (texture by readiness).
  private drawEntities(): void {
    const def = this.def;
    const tick = this.store.state.time.tick;
    for (const hen of def.chickens) {
      const c = tileCenter(hen.tile);
      const spr = this.add.image(c.x, c.y, TextureKey.Chicken).setOrigin(0.5, 0.9).setDepth(c.y);
      this.tweens.add({
        targets: spr,
        y: c.y - 3,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
    }
    for (const bush of def.bushes) {
      const c = tileCenter(bush.tile);
      const ready = isBushReady(this.store.state.bushes[bush.id], tick);
      const spr = this.add
        .image(c.x, c.y, ready ? TextureKey.BushFull : TextureKey.BushEmpty)
        .setOrigin(0.5, 0.85)
        .setDepth(c.y - 1);
      this.bushSprites.set(bush.id, spr);
    }
  }

  private refreshBushTextures(): void {
    const tick = this.store.state.time.tick;
    for (const [id, spr] of this.bushSprites) {
      const ready = isBushReady(this.store.state.bushes[id], tick);
      spr.setTexture(ready ? TextureKey.BushFull : TextureKey.BushEmpty);
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
    def.npcs.forEach((npc) => {
      const c = tileCenter(npc.tile);
      targets.push({ kind: InteractionKind.Npc, x: c.x, y: c.y, npcId: npc.npcId });
    });
    def.chickens.forEach((hen) => {
      const c = tileCenter(hen.tile);
      targets.push({ kind: InteractionKind.Chicken, x: c.x, y: c.y, chickenId: hen.id });
    });
    def.bushes.forEach((bush) => {
      const c = tileCenter(bush.tile);
      targets.push({ kind: InteractionKind.Bush, x: c.x, y: c.y, bushId: bush.id });
    });
    def.caches.forEach((cache) => {
      const c = tileCenter(cache.tile);
      targets.push({
        kind: InteractionKind.Cache,
        x: c.x,
        y: c.y,
        cacheId: cache.id,
        pieceId: cache.pieceId,
      });
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
      case InteractionKind.Door: {
        const exit = this.def.exits[target.exitIndex];
        if (exit.requiresSet && !this.loadout.opensBoss) return `Sealed — needs the ${SET_NAME}`;
        return `${exit.label}  [E]`;
      }
      case InteractionKind.Npc: {
        const npc = NPCS[target.npcId];
        return `${npc.shopId ? 'Shop' : 'Talk'}: ${npc.displayName}  [E]`;
      }
      case InteractionKind.Chicken:
        return 'Pet chicken  [E]';
      case InteractionKind.Bush:
        return isBushReady(this.store.state.bushes[target.bushId], this.store.state.time.tick)
          ? 'Gather berries  [E]'
          : 'Bush is bare';
      case InteractionKind.Cache:
        return hasPiece(this.store.state.armor, target.pieceId) ? 'Empty cache' : `Open cache  [E]`;
      case InteractionKind.Plot: {
        const crop = this.cropAtPlot(target.plotIndex);
        if (!crop) {
          const def = CROPS[this.store.player.selectedCropId];
          return has(this.store.player.inventory, def.seedItem)
            ? `Plant ${def.displayName}  [E]`
            : 'No seeds';
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
        this.openChest(target.chestId);
        return; // chest scene takes over; don't save mid-pause here
      case InteractionKind.Door:
        this.useExit(target.exitIndex);
        return; // scene restarts
      case InteractionKind.Npc:
        this.useNpc(target.npcId);
        return; // shop scene takes over, or a dialogue toast shows
      case InteractionKind.Plot:
        this.usePlot(target.plotIndex);
        break;
      case InteractionKind.Chicken:
        this.petChickenAction(target.chickenId);
        break;
      case InteractionKind.Bush:
        this.harvestBushAction(target.bushId);
        break;
      case InteractionKind.Cache:
        this.openCache(target.cacheId, target.pieceId);
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

  private useNpc(npcId: keyof typeof NPCS): void {
    const npc = NPCS[npcId];
    if (npc.romance) {
      this.game.events.emit(UiEvent.Prompt, null);
      saveGame(this.store.state);
      this.scene.pause();
      this.scene.launch(SceneKey.Talk, { npcId });
    } else if (npc.shopId) {
      this.game.events.emit(UiEvent.Prompt, null);
      saveGame(this.store.state);
      this.scene.pause();
      this.scene.launch(SceneKey.Shop, { shopId: npc.shopId });
    } else if (npc.lines && npc.lines.length > 0) {
      this.toast(`${npc.displayName}: ${Phaser.Utils.Array.GetRandom(npc.lines)}`);
    }
  }

  private useExit(exitIndex: number): void {
    const exit = this.def.exits[exitIndex];
    if (exit.requiresSet && !this.loadout.opensBoss) {
      this.toast(`A sealed door. The ${SET_NAME} might open it…`);
      return;
    }
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

  private usePlot(plotIndex: number): void {
    const result = resolvePlotInteraction(
      this.store.state,
      this.def,
      plotIndex,
      this.store.state.time.tick,
      this.loadout.bonusYield,
    );
    switch (result.kind) {
      case 'planted':
        this.addCropSprite(result.crop);
        this.toast(`Planted ${result.cropDef.displayName}.`);
        this.game.events.emit(UiEvent.Hud);
        break;
      case 'harvested':
        this.removeCropSprite(result.crop);
        this.toast(`Harvested ${result.cropDef.displayName}.`);
        this.game.events.emit(UiEvent.Hud);
        break;
      case 'no_seeds':
        this.toast(`No ${result.cropDef.displayName} seeds.`);
        break;
      case 'growing':
        this.toast('Still growing…');
        break;
      case 'inventory_full':
        this.toast('Inventory full.');
        break;
    }
  }

  private removeCropSprite(crop: CropInstance): void {
    const spr = this.cropSprites.get(crop);
    if (spr) {
      spr.destroy();
      this.cropSprites.delete(crop);
    }
  }

  // --- combat (only runs in maps with enemies) ---

  private updateCombat(px: number, py: number, dt: number): void {
    const now = this.time.now;

    // player swing
    if (this.controls.attackJustPressed() && now >= this.attackReadyAt) {
      this.attackReadyAt = now + Balance.attackCooldownMs;
      this.swing(px, py);
    }

    // enemy movement + contact damage (raiders chase crops; ruins enemies chase the player)
    let contactDamage: number;
    if (this.isRaid) {
      const crops = this.store.currentMap().crops;
      const points = crops.map((c) => tileCenter({ x: c.tileX, y: c.tileY }));
      const result = this.combat!.updateRaid(dt, points, px, py);
      contactDamage = result.contactDamage;
      this.devourCrops(result.eatenIndices, crops);
    } else {
      contactDamage = this.combat!.update(dt, px, py);
    }
    if (contactDamage > 0 && now >= this.invulnUntil) this.takeDamage(contactDamage);
  }

  private devourCrops(eatenIndices: number[], crops: CropInstance[]): void {
    const victims = [...new Set(eatenIndices)].map((i) => crops[i]).filter(Boolean);
    if (victims.length === 0) return;
    const map = this.store.currentMap();
    for (const crop of victims) {
      removeCrop(map, crop);
      this.removeCropSprite(crop);
      this.toast(`A nibbler ate your ${CROPS[crop.cropId].displayName}!`);
    }
    this.game.events.emit(UiEvent.Hud);
    saveGame(this.store.state);
  }

  private swing(px: number, py: number): void {
    const dir = FACE_DIR[this.store.player.facing];
    const ax = px + dir.x * Balance.attackOffset;
    const ay = py - 8 + dir.y * Balance.attackOffset;

    const slash = this.add.image(ax, ay, TextureKey.Slash).setDepth(ay + 20);
    slash.setFlipX(dir.x < 0);
    this.tweens.add({ targets: slash, alpha: 0, duration: 160, onComplete: () => slash.destroy() });

    const damage = Balance.attackDamage + this.loadout.bonusDamage;
    const defeated = this.combat!.attackAt(ax, ay, Balance.attackRange, damage);
    if (defeated.some((d) => d.isBoss)) {
      this.onVictory();
      return;
    }
    for (const def of defeated) {
      this.store.state.stats.monstersDefeated += 1;
      reduceThreat(this.store.state.threat); // clearing monsters eases the pressure
      for (const drop of rollLoot(def)) {
        if (add(this.store.player.inventory, drop.itemId, drop.count)) {
          this.toast(`Defeated ${def.displayName}! +${drop.count} ${ITEMS[drop.itemId].displayName}`);
        } else {
          this.toast(`Defeated ${def.displayName}!`);
        }
      }
      if (def.loot.length === 0) this.toast(`Defeated ${def.displayName}!`);
    }
    if (defeated.length > 0) {
      this.game.events.emit(UiEvent.Hud);
      saveGame(this.store.state);
    }
  }

  private onVictory(): void {
    this.store.state.bossDefeated = true;
    this.store.state.stats.monstersDefeated += 1;
    const jay = this.store.state.affection[NpcId.Jay];
    if (jay) grantMilestone(jay, 'boss', Balance.affectionStorySet * 2);
    saveGame(this.store.state);
    this.game.events.emit(UiEvent.Prompt, null);
    this.game.events.emit(UiEvent.Hud);
    this.scene.pause();
    this.scene.launch(SceneKey.End);
  }

  private takeDamage(amount: number): void {
    const player = this.store.player;
    player.hp = applyDamage(player.hp, amount);
    this.invulnUntil = this.time.now + Balance.invulnMs;
    this.game.events.emit(UiEvent.Hud);

    this.tweens.add({
      targets: this.playerSprite,
      alpha: 0.3,
      duration: 110,
      yoyo: true,
      repeat: Math.floor(Balance.invulnMs / 220),
      onComplete: () => this.playerSprite.setAlpha(1),
    });

    if (player.hp <= 0) this.retreat();
  }

  private retreat(): void {
    const player = this.store.player;
    player.hp = player.maxHp;
    const farm = MAPS[MapId.Farm];
    transitionTo(this.store.state, MapId.Farm, farm.spawnTile);
    this.toast('You faint and wake up safe on the farm…');
    saveGame(this.store.state);
    this.scene.restart();
  }

  // --- farm threat ---

  private handleFarmArrival(): void {
    const threat = this.store.state.threat;
    if (isFarmUnderThreat(threat)) {
      this.startFarmRaid();
    } else if (threatBand(threat) === 'rustling') {
      this.toast('Something rustles near the ruins…');
    } else if (this.store.state.time.day > Balance.threatGraceDays) {
      this.toast('The farm is safe for now.');
    }
  }

  private onNewDay(): void {
    this.game.events.emit(UiEvent.Hud);
    // If a fresh day pushes the farm over the edge while you're home, raiders arrive.
    if (this.def.mapId === MapId.Farm && isFarmUnderThreat(this.store.state.threat) && !this.hasRaiders()) {
      this.startFarmRaid();
    }
  }

  private hasRaiders(): boolean {
    return this.isRaid && !!this.combat && this.combat.remaining() > 0;
  }

  // Spawns a small wave of nibblers at the ruins-side edge, heading for the crops.
  private startFarmRaid(): void {
    if (!this.combat) this.combat = new CombatController(this, this.bounds);
    this.isRaid = true;
    const entryTiles = [
      { x: this.def.widthTiles - 2, y: 4 },
      { x: this.def.widthTiles - 2, y: 6 },
      { x: this.def.widthTiles - 2, y: 8 },
    ];
    const count = raidSize(this.store.state.threat);
    for (let i = 0; i < count; i++) {
      const c = tileCenter(entryTiles[i % entryTiles.length]);
      this.combat.spawnAt(EnemyId.CropNibbler, c.x, c.y);
    }
    this.toast('Tiny monsters are eyeing your crops!');
  }

  private petChickenAction(chickenId: string): void {
    const chicken = this.store.state.chickens[chickenId];
    if (!petChicken(chicken, this.store.state.time.day)) {
      this.toast('The chicken is content.');
      return;
    }
    this.store.state.stats.chickensPetted += 1;
    if (add(this.store.player.inventory, ItemId.Egg, 1)) {
      this.toast('Petted chicken! It left an egg.');
    } else {
      this.toast('Petted chicken!');
    }
    this.game.events.emit(UiEvent.Hud);
  }

  private harvestBushAction(bushId: string): void {
    const bush = this.store.state.bushes[bushId];
    const tick = this.store.state.time.tick;
    if (!isBushReady(bush, tick)) {
      this.toast('Nothing to gather yet.');
      return;
    }
    if (add(this.store.player.inventory, ItemId.Berry, Balance.berryYield)) {
      harvestBush(bush, tick, Balance.bushRegrowTicks);
      this.refreshBushTextures();
      this.toast('Gathered berries.');
      this.game.events.emit(UiEvent.Hud);
    } else {
      this.toast('Inventory full.');
    }
  }

  private openCache(cacheId: string, pieceId: ArmorPieceId): void {
    const result = resolveCacheInteraction(this.store.state, pieceId);
    if (result.kind === 'empty') {
      this.toast('The cache is empty.');
      return;
    }
    this.loadout = result.loadout;
    this.cacheSprites.get(cacheId)?.setTexture(TextureKey.CacheOpen);

    this.toast(`Found the ${result.piece.displayName}! (${result.piece.blurb})`);
    if (result.setComplete) {
      this.time.delayedCall(1200, () =>
        this.toast(`The ${SET_NAME} is whole. The ruins' heart can now be reached…`),
      );
    }
    this.game.events.emit(UiEvent.Hud);
  }

  private cropAtPlot(plotIndex: number): CropInstance | undefined {
    const plot = this.def.plots[plotIndex];
    return cropAt(this.store.currentMap(), plot.x, plot.y);
  }

  private toast(message: string): void {
    this.game.events.emit(UiEvent.Toast, message);
  }
}
