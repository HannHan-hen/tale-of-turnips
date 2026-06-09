// Modal shop screen. Lists a shop's goods (from the shop registry) with prices and lets
// the player buy with gold. Keyboard driven. The world scene is paused while it is open.

import Phaser from 'phaser';
import { ITEMS } from '../data/items';
import { palette, toCss } from '../data/palette';
import { NPCS } from '../data/npcs';
import { availableItems, SHOPS, type ShopItem } from '../data/shops';
import { GameStateStore } from '../state/GameStateStore';
import { buy } from '../systems/EconomySystem';
import { recalcMaxHp } from '../systems/EquipmentSystem';
import { saveGame } from '../save/SaveSystem';
import { SceneKey, ShopId } from '../types/ids';
import { UiEvent } from '../ui/uiEvents';
import { STORE_KEY } from './BootScene';

const ROWS_TOP = 138;
const LINE_H = 28;

export class ShopScene extends Phaser.Scene {
  private store!: GameStateStore;
  private items: ShopItem[] = [];
  private shopTitle = 'Shop';
  private keeperPortrait?: string;
  private index = 0;
  private cursor!: Phaser.GameObjects.Rectangle;
  private goldText!: Phaser.GameObjects.Text;

  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    confirm: Phaser.Input.Keyboard.Key;
    enter: Phaser.Input.Keyboard.Key;
    esc: Phaser.Input.Keyboard.Key;
    q: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super(SceneKey.Shop);
  }

  init(data: { shopId: ShopId }): void {
    this.store = this.registry.get(STORE_KEY) as GameStateStore;
    const shop = SHOPS[data.shopId];
    this.shopTitle = shop.title;
    this.items = availableItems(shop, this.store.state);
    this.keeperPortrait = Object.values(NPCS).find((n) => n.shopId === data.shopId)?.portraitKey;
    this.index = 0;
  }

  create(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.rectangle(0, 0, w, h, palette.skyNight, 0.55).setOrigin(0, 0);
    this.add.rectangle(w / 2, h / 2, 360, 264, palette.uiPanel, 0.98).setStrokeStyle(2, palette.outline);

    // Shopkeeper portrait tucked into the panel's top-left, above the goods list.
    if (this.keeperPortrait) {
      this.add.image(w / 2 - 142, 100, this.keeperPortrait).setScale(0.26);
    }

    this.add
      .text(w / 2, 86, this.shopTitle, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: toCss(palette.uiInk),
      })
      .setOrigin(0.5);
    this.goldText = this.add
      .text(w / 2, 110, '', { fontFamily: 'monospace', fontSize: '13px', color: toCss(palette.gold) })
      .setOrigin(0.5);

    this.cursor = this.add.rectangle(w / 2, ROWS_TOP, 300, 24, palette.uiHighlight, 1).setOrigin(0.5);

    const rowStyle = { fontFamily: 'monospace', fontSize: '13px', color: toCss(palette.uiInk) };
    this.items.forEach((item, i) => {
      const y = ROWS_TOP + i * LINE_H;
      this.add.image(w / 2 - 130, y, ITEMS[item.itemId].iconKey).setScale(0.28);
      this.add.text(w / 2 - 112, y, ITEMS[item.itemId].displayName, rowStyle).setOrigin(0, 0.5);
      this.add
        .text(w / 2 + 130, y, `${item.price}g`, { ...rowStyle, color: toCss(palette.gold) })
        .setOrigin(1, 0.5);
    });

    this.add
      .text(w / 2, h - 40, '↑↓ select   [Space] buy   [Esc] close', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: toCss(palette.uiInk),
      })
      .setOrigin(0.5);

    const kb = this.input.keyboard!;
    this.keys = {
      up: kb.addKey('UP'),
      down: kb.addKey('DOWN'),
      w: kb.addKey('W'),
      s: kb.addKey('S'),
      confirm: kb.addKey('SPACE'),
      enter: kb.addKey('ENTER'),
      esc: kb.addKey('ESC'),
      q: kb.addKey('Q'),
    };

    this.refresh();
  }

  update(): void {
    const k = this.keys;
    const j = Phaser.Input.Keyboard.JustDown;
    if (j(k.up) || j(k.w)) this.moveCursor(-1);
    if (j(k.down) || j(k.s)) this.moveCursor(1);
    if (j(k.confirm) || j(k.enter)) this.buySelected();
    if (j(k.esc) || j(k.q)) this.close();
  }

  private moveCursor(delta: number): void {
    if (this.items.length === 0) return;
    this.index = Phaser.Math.Clamp(this.index + delta, 0, this.items.length - 1);
    this.refresh();
  }

  private refresh(): void {
    this.goldText.setText(`Your gold: ${this.store.player.gold}`);
    this.cursor.setVisible(this.items.length > 0);
    this.cursor.setPosition(this.scale.width / 2, ROWS_TOP + this.index * LINE_H);
  }

  private buySelected(): void {
    const item = this.items[this.index];
    if (!item) return;
    const result = buy(this.store.player, item.itemId, item.price);
    if (result === 'ok') {
      // carried gear can change max hearts (e.g. the Padded Vest) — reconcile right away
      recalcMaxHp(this.store.player, this.store.state.armor);
      // Persist now: the world scene is paused, so its autosave won't run until we close.
      saveGame(this.store.state);
      this.toast(`Bought ${ITEMS[item.itemId].displayName}.`);
      this.game.events.emit(UiEvent.Hud);
      this.refresh();
    } else if (result === 'not_enough_gold') {
      this.toast('Not enough gold.');
    } else {
      this.toast('Inventory full.');
    }
  }

  private toast(message: string): void {
    this.game.events.emit(UiEvent.Toast, message);
  }

  private close(): void {
    this.game.events.emit(UiEvent.Hud);
    this.scene.stop();
    this.scene.resume(SceneKey.World);
  }
}
