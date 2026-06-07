// HUD overlay. Renders day, gold, the seed selector (with counts), the interaction prompt,
// and transient toast feedback. Reads game state on demand; never mutates it.

import Phaser from 'phaser';
import { TextureKey } from '../data/assetKeys';
import { palette, toCss } from '../data/palette';
import { ARMOR_ORDER, ARMOR_PIECES, SET_NAME } from '../data/armor';
import { CROP_ORDER, CROPS } from '../data/crops';
import { ITEMS } from '../data/items';
import { hasPiece } from '../systems/EquipmentSystem';
import { GameStateStore } from '../state/GameStateStore';
import { count } from '../systems/InventorySystem';
import { SceneKey } from '../types/ids';
import { UiEvent } from '../ui/uiEvents';
import { STORE_KEY } from './BootScene';

const SLOT_W = 58;

export class UIScene extends Phaser.Scene {
  private store!: GameStateStore;
  private dayText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private heartImages: Phaser.GameObjects.Image[] = [];
  private threatText!: Phaser.GameObjects.Text;
  private setIcons: Phaser.GameObjects.Image[] = [];
  private seedCountTexts: Phaser.GameObjects.Text[] = [];
  private selectHighlight!: Phaser.GameObjects.Rectangle;
  private slotXs: number[] = [];
  private promptText!: Phaser.GameObjects.Text;
  private toastText!: Phaser.GameObjects.Text;
  private toastTween?: Phaser.Tweens.Tween;

  constructor() {
    super(SceneKey.UI);
  }

  create(): void {
    this.store = this.registry.get(STORE_KEY) as GameStateStore;
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.rectangle(0, 0, w, 28, palette.uiPanel, 0.85).setOrigin(0, 0);

    const label = { fontFamily: 'monospace', fontSize: '13px' };
    this.dayText = this.add.text(10, 7, '', { ...label, color: toCss(palette.uiInk) });
    this.goldText = this.add.text(70, 7, '', { ...label, color: toCss(palette.gold) });

    // hearts
    this.heartImages = [];
    for (let i = 0; i < this.store.player.maxHp; i++) {
      this.heartImages.push(this.add.image(140 + i * 16, 14, TextureKey.HeartFull));
    }

    // threat readout (only shows when pressure is building)
    this.threatText = this.add.text(232, 7, '', { ...label, color: toCss(palette.heartRed) });

    // Seed selector on the right: one slot per crop (icon + count), selected one highlighted.
    const startX = w - CROP_ORDER.length * SLOT_W - 6;
    this.selectHighlight = this.add.rectangle(0, 14, SLOT_W - 4, 24, palette.uiHighlight, 1).setOrigin(0.5);
    this.seedCountTexts = [];
    this.slotXs = [];
    CROP_ORDER.forEach((cropId, i) => {
      const x = startX + i * SLOT_W;
      this.slotXs.push(x);
      this.add.image(x, 14, ITEMS[CROPS[cropId].seedItem].iconKey).setScale(0.85);
      const t = this.add.text(x + 12, 7, '', { ...label, color: toCss(palette.uiInk) });
      this.seedCountTexts.push(t);
    });

    // Starless Set tracker, bottom-left (dim until each piece is found).
    this.add.text(10, h - 32, SET_NAME, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: toCss(palette.starlessTrim),
    });
    this.setIcons = ARMOR_ORDER.map((pieceId, i) =>
      this.add.image(18 + i * 18, h - 14, ARMOR_PIECES[pieceId].iconKey).setScale(0.8),
    );

    this.promptText = this.add
      .text(w / 2, h - 16, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: toCss(palette.uiInk),
        backgroundColor: 'rgba(58,48,71,0.85)',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5);

    this.toastText = this.add
      .text(w / 2, h - 44, '', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: toCss(palette.uiInk),
        align: 'center',
        wordWrap: { width: w - 40 },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const onHud = () => this.refreshHud();
    const onPrompt = (text: string | null) => this.promptText.setText(text ?? '');
    const onToast = (text: string) => this.showToast(text);

    this.game.events.on(UiEvent.Hud, onHud);
    this.game.events.on(UiEvent.Prompt, onPrompt);
    this.game.events.on(UiEvent.Toast, onToast);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(UiEvent.Hud, onHud);
      this.game.events.off(UiEvent.Prompt, onPrompt);
      this.game.events.off(UiEvent.Toast, onToast);
    });

    this.refreshHud();
  }

  private refreshHud(): void {
    const inv = this.store.player.inventory;
    this.dayText.setText(`Day ${this.store.state.time.day}`);
    this.goldText.setText(`${this.store.player.gold}g`);
    for (let i = 0; i < this.heartImages.length; i++) {
      this.heartImages[i].setTexture(i < this.store.player.hp ? TextureKey.HeartFull : TextureKey.HeartEmpty);
    }
    const threat = this.store.state.threat.ruinThreat;
    this.threatText.setText(threat > 0 ? `Threat ${threat}` : '');
    ARMOR_ORDER.forEach((pieceId, i) => {
      const owned = hasPiece(this.store.state.armor, pieceId);
      this.setIcons[i].setAlpha(owned ? 1 : 0.25);
    });
    CROP_ORDER.forEach((cropId, i) => {
      this.seedCountTexts[i].setText(`${count(inv, CROPS[cropId].seedItem)}`);
    });
    const selected = CROP_ORDER.indexOf(this.store.player.selectedCropId);
    if (selected >= 0) this.selectHighlight.setX(this.slotXs[selected]);
  }

  private showToast(message: string): void {
    this.toastText.setText(message).setAlpha(1);
    this.toastTween?.stop();
    this.toastTween = this.tweens.add({
      targets: this.toastText,
      alpha: 0,
      delay: 900,
      duration: 700,
    });
  }
}
