// Modal talk/affection screen for the village boy. Talk once a day for a small nudge, or
// give a treasured item (once a day) for a real boost. Keyboard driven; the world scene is
// paused while it is open. Affection rules live in AffectionSystem; this is presentation.

import Phaser from 'phaser';
import { ITEMS } from '../data/items';
import { NPCS, type RomanceConfig } from '../data/npcs';
import { palette, toCss } from '../data/palette';
import { GameStateStore } from '../state/GameStateStore';
import { saveGame } from '../save/SaveSystem';
import { canGift, giveGift, isGiftable, talk, tierIndex, tierName } from '../systems/AffectionSystem';
import { count, remove } from '../systems/InventorySystem';
import { ItemId, SceneKey } from '../types/ids';
import type { NpcAffectionState } from '../types/models';
import { UiEvent } from '../ui/uiEvents';
import { STORE_KEY } from './BootScene';

const ROWS_TOP = 196;
const LINE_H = 26;

export class TalkScene extends Phaser.Scene {
  private store!: GameStateStore;
  private npcId!: string;
  private romance!: RomanceConfig;
  private aff!: NpcAffectionState;

  private mode: 'menu' | 'gift' = 'menu';
  private index = 0;
  private giftItems: ItemId[] = [];

  private lineText!: Phaser.GameObjects.Text;
  private tierText!: Phaser.GameObjects.Text;
  private cursor!: Phaser.GameObjects.Rectangle;
  private rowObjs: Phaser.GameObjects.GameObject[] = [];

  private keys!: Record<
    'up' | 'down' | 'w' | 's' | 'confirm' | 'enter' | 'esc' | 'q',
    Phaser.Input.Keyboard.Key
  >;

  constructor() {
    super(SceneKey.Talk);
  }

  init(data: { npcId: string }): void {
    this.store = this.registry.get(STORE_KEY) as GameStateStore;
    this.npcId = data.npcId;
    this.romance = NPCS[data.npcId as keyof typeof NPCS].romance!;
    this.aff = this.store.state.affection[data.npcId];
    this.mode = 'menu';
    this.index = 0;
  }

  create(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.rectangle(0, 0, w, h, palette.skyNight, 0.6).setOrigin(0, 0);
    this.add.rectangle(w / 2, h / 2, 420, 280, palette.uiPanel, 0.98).setStrokeStyle(2, palette.outline);

    const npc = NPCS[this.npcId as keyof typeof NPCS];
    this.add.image(w / 2 - 168, h / 2 - 40, npc.textureKey).setScale(3);
    this.add
      .text(w / 2 - 140, h / 2 - 110, npc.displayName, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: toCss(palette.uiInk),
      })
      .setOrigin(0.5, 0);
    this.tierText = this.add
      .text(w / 2 - 140, h / 2 - 88, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: toCss(palette.starlessTrim),
      })
      .setOrigin(0.5, 0);

    this.lineText = this.add.text(w / 2 - 96, h / 2 - 96, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: toCss(palette.uiInk),
      wordWrap: { width: 270 },
      lineSpacing: 3,
    });

    this.cursor = this.add
      .rectangle(w / 2 - 100, ROWS_TOP, 290, 22, palette.uiHighlight, 1)
      .setOrigin(0, 0.5);

    this.add
      .text(w / 2, h - 30, '↑↓ select   [Space] choose   [Esc] back/leave', {
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

    this.setLine(this.romance.greetingByTier[tierIndex(this.aff.points)]);
    this.render();
  }

  update(): void {
    const k = this.keys;
    const j = Phaser.Input.Keyboard.JustDown;
    const rows = this.currentRows().length;
    if ((j(k.up) || j(k.w)) && rows > 0) {
      this.index = (this.index - 1 + rows) % rows;
      this.positionCursor();
    }
    if ((j(k.down) || j(k.s)) && rows > 0) {
      this.index = (this.index + 1) % rows;
      this.positionCursor();
    }
    if (j(k.confirm) || j(k.enter)) this.choose();
    if (j(k.esc) || j(k.q)) this.back();
  }

  private currentRows(): string[] {
    if (this.mode === 'menu') return ['Talk', 'Give a gift', 'Leave'];
    return this.giftItems.map(
      (id) => `${ITEMS[id].displayName} (x${count(this.store.player.inventory, id)})`,
    );
  }

  private render(): void {
    for (const o of this.rowObjs) o.destroy();
    this.rowObjs = [];
    this.tierText.setText(`Jay ${tierName(this.aff.points)}`);

    const rows = this.currentRows();
    const x = this.scale.width / 2 - 92;
    const style = { fontFamily: 'monospace', fontSize: '14px', color: toCss(palette.uiInk) };
    if (this.mode === 'gift' && rows.length === 0) {
      this.rowObjs.push(
        this.add
          .text(x, ROWS_TOP, '(nothing to give — Esc to go back)', { ...style, color: toCss(palette.wall) })
          .setOrigin(0, 0.5),
      );
    }
    rows.forEach((label, i) => {
      this.rowObjs.push(this.add.text(x, ROWS_TOP + i * LINE_H, label, style).setOrigin(0, 0.5));
    });
    this.index = Math.max(0, Math.min(this.index, Math.max(0, rows.length - 1)));
    this.positionCursor();
  }

  private positionCursor(): void {
    const rows = this.currentRows().length;
    this.cursor.setVisible(rows > 0);
    this.cursor.setY(ROWS_TOP + this.index * LINE_H);
  }

  private setLine(text: string): void {
    this.lineText.setText(text);
  }

  private choose(): void {
    if (this.mode === 'menu') {
      if (this.index === 0) this.doTalk();
      else if (this.index === 1) this.openGiftList();
      else this.leave();
      return;
    }
    // gift mode
    if (this.giftItems.length === 0) return;
    this.doGift(this.giftItems[this.index]);
  }

  private back(): void {
    if (this.mode === 'gift') {
      this.mode = 'menu';
      this.index = 1;
      this.render();
    } else {
      this.leave();
    }
  }

  private doTalk(): void {
    const day = this.store.state.time.day;
    if (talk(this.aff, day)) {
      this.setLine(this.romance.talkByTier[tierIndex(this.aff.points)]);
    } else {
      this.setLine(this.romance.alreadyTalked);
    }
    this.render();
    saveGame(this.store.state);
  }

  private openGiftList(): void {
    const day = this.store.state.time.day;
    if (!canGift(this.aff, day)) {
      this.setLine(this.romance.alreadyGiftedLine);
      return;
    }
    this.giftItems = this.giftableItems();
    if (this.giftItems.length === 0) {
      this.setLine(this.romance.noGiftLine);
      return;
    }
    this.mode = 'gift';
    this.index = 0;
    this.render();
  }

  private doGift(itemId: ItemId): void {
    const day = this.store.state.time.day;
    remove(this.store.player.inventory, itemId, 1);
    const reaction = giveGift(this.aff, this.romance, itemId, day);
    this.setLine(
      reaction === 'loved'
        ? this.romance.giftLovedLine
        : reaction === 'repeat'
          ? this.romance.giftRepeatLine
          : this.romance.giftLikedLine,
    );
    this.mode = 'menu';
    this.index = 1;
    this.render();
    this.game.events.emit(UiEvent.Hud);
    saveGame(this.store.state);
  }

  private giftableItems(): ItemId[] {
    const inv = this.store.player.inventory;
    const ids = [...this.romance.lovedGiftItemIds, ...this.romance.likedGiftItemIds];
    return ids.filter((id, i) => ids.indexOf(id) === i && count(inv, id) > 0 && isGiftable(this.romance, id));
  }

  private leave(): void {
    this.scene.stop();
    this.scene.resume(SceneKey.World);
  }
}
