// Modal storage screen. Shows the backpack and a chest side by side and moves whole
// stacks between them using the shared inventory transfer logic. Keyboard driven.
// The world scene is paused while this is open and resumed on close.

import Phaser from 'phaser';
import { ITEMS } from '../data/items';
import { palette, toCss } from '../data/palette';
import { GameStateStore } from '../state/GameStateStore';
import { spaceFor, transfer } from '../systems/InventorySystem';
import { saveGame } from '../save/SaveSystem';
import { SceneKey } from '../types/ids';
import type { ChestState, Inventory } from '../types/models';
import { UiEvent } from '../ui/uiEvents';
import { STORE_KEY } from './BootScene';

type ColumnKey = 'backpack' | 'chest';

const ROWS_TOP = 132;
const LINE_H = 24;
const COL_WIDTH = 170;
const COLUMNS: Record<ColumnKey, { icon: number; text: number; left: number; header: number }> = {
  backpack: { icon: 96, text: 116, left: 80, header: 80 },
  chest: { icon: 300, text: 320, left: 284, header: 284 },
};

export class ChestScene extends Phaser.Scene {
  private store!: GameStateStore;
  private chest!: ChestState;
  private focused: ColumnKey = 'backpack';
  private index = 0;
  private rowObjs: Phaser.GameObjects.GameObject[] = [];
  private cursor!: Phaser.GameObjects.Rectangle;
  private lengths: Record<ColumnKey, number> = { backpack: 0, chest: 0 };

  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    confirm: Phaser.Input.Keyboard.Key;
    enter: Phaser.Input.Keyboard.Key;
    esc: Phaser.Input.Keyboard.Key;
    q: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super(SceneKey.Chest);
  }

  init(data: { chestId: string }): void {
    this.store = this.registry.get(STORE_KEY) as GameStateStore;
    this.chest = this.store.state.chests[data.chestId];
    this.focused = 'backpack';
    this.index = 0;
    this.rowObjs = [];
  }

  create(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    // dim backdrop + panel
    this.add.rectangle(0, 0, w, h, palette.skyNight, 0.55).setOrigin(0, 0);
    this.add.rectangle(w / 2, h / 2, 408, 268, palette.uiPanel, 0.98).setStrokeStyle(2, palette.outline);

    const title = { fontFamily: 'monospace', fontSize: '16px', color: toCss(palette.uiInk) };
    this.add.text(w / 2, 84, 'Storage', title).setOrigin(0.5);

    const header = { fontFamily: 'monospace', fontSize: '13px', color: toCss(palette.gold) };
    this.add.text(COLUMNS.backpack.header, 108, 'Backpack', header).setOrigin(0, 0.5);
    this.add.text(COLUMNS.chest.header, 108, 'Chest', header).setOrigin(0, 0.5);

    this.add
      .text(w / 2, h - 40, '↑↓ select   ←→ switch   [Space] move   [Esc] close', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: toCss(palette.uiInk),
      })
      .setOrigin(0.5);

    this.cursor = this.add.rectangle(0, 0, COL_WIDTH, 22, palette.uiHighlight, 1).setOrigin(0, 0.5);

    const kb = this.input.keyboard!;
    this.keys = {
      up: kb.addKey('UP'),
      down: kb.addKey('DOWN'),
      left: kb.addKey('LEFT'),
      right: kb.addKey('RIGHT'),
      w: kb.addKey('W'),
      a: kb.addKey('A'),
      s: kb.addKey('S'),
      d: kb.addKey('D'),
      confirm: kb.addKey('SPACE'),
      enter: kb.addKey('ENTER'),
      esc: kb.addKey('ESC'),
      q: kb.addKey('Q'),
    };

    this.render();
  }

  update(): void {
    const k = this.keys;
    const j = Phaser.Input.Keyboard.JustDown;
    if (j(k.up) || j(k.w)) this.moveCursor(-1);
    if (j(k.down) || j(k.s)) this.moveCursor(1);
    if (j(k.left) || j(k.a)) this.switchColumn('backpack');
    if (j(k.right) || j(k.d)) this.switchColumn('chest');
    if (j(k.confirm) || j(k.enter)) this.transferSelected();
    if (j(k.esc) || j(k.q)) this.close();
  }

  private render(): void {
    for (const obj of this.rowObjs) obj.destroy();
    this.rowObjs = [];
    this.lengths.backpack = this.renderColumn('backpack', this.store.player.inventory);
    this.lengths.chest = this.renderColumn('chest', this.chest.inventory);
    this.positionCursor();
  }

  private renderColumn(colKey: ColumnKey, inv: Inventory): number {
    const col = COLUMNS[colKey];
    const rowStyle = { fontFamily: 'monospace', fontSize: '12px', color: toCss(palette.uiInk) };
    if (inv.slots.length === 0) {
      const empty = this.add
        .text(col.text, ROWS_TOP, '(empty)', { ...rowStyle, color: toCss(palette.wall) })
        .setOrigin(0, 0.5);
      this.rowObjs.push(empty);
      return 0;
    }
    inv.slots.forEach((stack, i) => {
      const y = ROWS_TOP + i * LINE_H;
      const icon = this.add.image(col.icon, y, ITEMS[stack.itemId].iconKey).setScale(0.27);
      const label = this.add
        .text(col.text, y, `${ITEMS[stack.itemId].displayName} x${stack.count}`, rowStyle)
        .setOrigin(0, 0.5);
      this.rowObjs.push(icon, label);
    });
    return inv.slots.length;
  }

  private positionCursor(): void {
    const len = this.lengths[this.focused];
    this.index = Math.max(0, Math.min(this.index, len - 1));
    const col = COLUMNS[this.focused];
    this.cursor.setPosition(col.left, ROWS_TOP + this.index * LINE_H);
    this.cursor.setVisible(len > 0);
  }

  private moveCursor(delta: number): void {
    const len = this.lengths[this.focused];
    if (len === 0) return;
    this.index = Phaser.Math.Clamp(this.index + delta, 0, len - 1);
    this.positionCursor();
  }

  private switchColumn(target: ColumnKey): void {
    if (this.focused === target) return;
    this.focused = target;
    this.positionCursor();
  }

  private transferSelected(): void {
    const fromInv = this.focused === 'backpack' ? this.store.player.inventory : this.chest.inventory;
    const toInv = this.focused === 'backpack' ? this.chest.inventory : this.store.player.inventory;
    const stack = fromInv.slots[this.index];
    if (!stack) return;

    // Move as much of the stack as fits, so a nearly-full destination is never a dead end.
    const amount = Math.min(stack.count, spaceFor(toInv, stack.itemId));
    if (amount <= 0) {
      this.game.events.emit(UiEvent.Toast, 'No room.');
      return;
    }
    transfer(fromInv, toInv, stack.itemId, amount);
    // Persist now: the world scene is paused, so its autosave won't run until we close.
    saveGame(this.store.state);
    this.game.events.emit(UiEvent.Hud);
    this.render();
  }

  private close(): void {
    this.game.events.emit(UiEvent.Hud);
    this.scene.stop();
    this.scene.resume(SceneKey.World);
  }
}
