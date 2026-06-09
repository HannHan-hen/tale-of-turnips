// Start screen. Shown once textures are built (and again whenever the player opens the menu
// in-game). Offers "Continue" when a save exists and "New Game", which can restart from the
// beginning — wiping the save after a confirmation so it is never an accidental loss.

import Phaser from 'phaser';
import { TextureKey } from '../data/assetKeys';
import { palette, toCss } from '../data/palette';
import { GameStateStore } from '../state/GameStateStore';
import { createNewGameState } from '../state/newGameState';
import { recalcMaxHp } from '../systems/EquipmentSystem';
import { clearSave, hasSave, loadGame, loadHighScore, saveGame } from '../save/SaveSystem';
import { SceneKey } from '../types/ids';
import type { GameState } from '../types/models';
import { STORE_KEY } from './BootScene';

type MenuOption = { label: string; run: () => void };

export class TitleScene extends Phaser.Scene {
  private options: MenuOption[] = [];
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private hint!: Phaser.GameObjects.Text;
  private index = 0;
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    confirm: Phaser.Input.Keyboard.Key;
    enter: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super(SceneKey.Title);
  }

  create(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    // Generated farm backdrop, scaled to cover the canvas, with a soft scrim so the mascot
    // and gold title text stay readable over the bright sky.
    const bg = this.add.image(w / 2, h / 2, TextureKey.TitleBackdrop).setOrigin(0.5);
    bg.setScale(Math.max(w / bg.width, h / bg.height));
    this.add.rectangle(0, 0, w, h, palette.skyNight, 0.32).setOrigin(0, 0);

    // A friendly turnip mascot crowning the title.
    this.add.image(w / 2, h * 0.3, TextureKey.IconTurnip).setScale(0.94);
    this.add
      .text(w / 2, h * 0.3 + 44, 'Tale of Turnips', {
        fontFamily: 'monospace',
        fontSize: '26px',
        color: toCss(palette.gold),
      })
      .setOrigin(0.5);
    this.add
      .text(w / 2, h * 0.3 + 72, 'A cozy farming adventure', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: toCss(palette.uiInk),
      })
      .setOrigin(0.5);

    const best = loadHighScore();
    if (best > 0) {
      this.add
        .text(w / 2, h * 0.3 + 92, `Best harvest: ${best}g`, {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: toCss(palette.starlessTrim),
        })
        .setOrigin(0.5);
    }

    this.hint = this.add
      .text(w / 2, h - 24, '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: toCss(palette.uiInk),
      })
      .setOrigin(0.5)
      .setAlpha(0.75);

    const kb = this.input.keyboard!;
    this.keys = {
      up: kb.addKey('UP'),
      down: kb.addKey('DOWN'),
      w: kb.addKey('W'),
      s: kb.addKey('S'),
      confirm: kb.addKey('SPACE'),
      enter: kb.addKey('ENTER'),
    };

    this.showMainMenu();
  }

  update(): void {
    const j = Phaser.Input.Keyboard.JustDown;
    if (j(this.keys.up) || j(this.keys.w)) this.move(-1);
    if (j(this.keys.down) || j(this.keys.s)) this.move(1);
    if (j(this.keys.confirm) || j(this.keys.enter)) this.activate();
  }

  // --- menus ---

  private showMainMenu(): void {
    const saved = hasSave();
    const options: MenuOption[] = [];
    if (saved) options.push({ label: 'Continue', run: () => this.beginGame(loadGame()) });
    options.push({
      label: 'New Game',
      run: () => (saved ? this.confirmNewGame() : this.startFresh()),
    });
    this.setOptions(options, '↑↓ choose    [Enter] select');
  }

  // Guard the destructive restart so a saved farm is never lost by a stray keypress.
  private confirmNewGame(): void {
    this.setOptions(
      [
        { label: 'Yes, restart from the beginning', run: () => this.startFresh() },
        { label: 'Cancel', run: () => this.showMainMenu() },
      ],
      'This erases your saved farm. Are you sure?',
    );
  }

  private setOptions(options: MenuOption[], hint: string): void {
    for (const t of this.optionTexts) t.destroy();
    this.optionTexts = [];
    this.options = options;
    this.index = 0;

    const w = this.scale.width;
    const baseY = this.scale.height * 0.62;
    options.forEach((opt, i) => {
      const t = this.add
        .text(w / 2, baseY + i * 30, opt.label, {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: toCss(palette.uiInk),
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      t.on('pointerover', () => {
        this.index = i;
        this.highlight();
      });
      t.on('pointerdown', () => {
        this.index = i;
        this.activate();
      });
      this.optionTexts.push(t);
    });

    this.hint.setText(hint);
    this.highlight();
  }

  private highlight(): void {
    this.optionTexts.forEach((t, i) => {
      const selected = i === this.index;
      t.setColor(toCss(selected ? palette.gold : palette.uiInk));
      t.setAlpha(selected ? 1 : 0.55);
    });
  }

  private move(delta: number): void {
    if (this.options.length === 0) return;
    this.index = Phaser.Math.Wrap(this.index + delta, 0, this.options.length);
    this.highlight();
  }

  private activate(): void {
    this.options[this.index]?.run();
  }

  // --- launching the game ---

  private startFresh(): void {
    clearSave();
    const state = createNewGameState();
    saveGame(state); // bank the fresh start so a later "Continue" resumes from day one
    this.beginGame(state);
  }

  private beginGame(state: GameState): void {
    const store = new GameStateStore(state);
    // Reconcile max hearts with collected armor (a saved set should restore its bonus).
    recalcMaxHp(store.player, store.state.armor);
    this.registry.set(STORE_KEY, store);
    this.scene.start(SceneKey.World);
    this.scene.launch(SceneKey.UI);
  }
}
