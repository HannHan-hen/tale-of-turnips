// HUD overlay. Renders gold, inventory counts, the interaction prompt, and transient
// toast feedback. Reads game state on demand; never mutates it. Driven by UiEvent messages.

import Phaser from 'phaser';
import { TextureKey } from '../data/assetKeys';
import { palette, toCss } from '../data/palette';
import { GameStateStore } from '../state/GameStateStore';
import { count } from '../systems/InventorySystem';
import { ItemId, SceneKey } from '../types/ids';
import { UiEvent } from '../ui/uiEvents';
import { STORE_KEY } from './BootScene';

export class UIScene extends Phaser.Scene {
  private store!: GameStateStore;
  private goldText!: Phaser.GameObjects.Text;
  private seedText!: Phaser.GameObjects.Text;
  private turnipText!: Phaser.GameObjects.Text;
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

    // top panel
    this.add.rectangle(0, 0, w, 28, palette.uiPanel, 0.85).setOrigin(0, 0);

    const label = { fontFamily: 'monospace', fontSize: '13px' };
    this.goldText = this.add.text(10, 7, '', { ...label, color: toCss(palette.gold) });

    this.add.image(w - 132, 14, TextureKey.IconTurnipSeed).setScale(0.9);
    this.seedText = this.add.text(w - 118, 7, '', { ...label, color: toCss(palette.uiInk) });

    this.add.image(w - 70, 14, TextureKey.IconTurnip).setScale(0.9);
    this.turnipText = this.add.text(w - 56, 7, '', { ...label, color: toCss(palette.uiInk) });

    // interaction prompt, bottom center
    this.promptText = this.add
      .text(w / 2, h - 16, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: toCss(palette.uiInk),
        backgroundColor: 'rgba(58,48,71,0.85)',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5);

    // toast feedback, above the prompt
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
    this.goldText.setText(`Gold ${this.store.player.gold}`);
    this.seedText.setText(`${count(inv, ItemId.TurnipSeed)}`);
    this.turnipText.setText(`${count(inv, ItemId.Turnip)}`);
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
