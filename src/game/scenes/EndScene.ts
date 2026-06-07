// Victory result screen. Shown when the Ruin Heart falls. Records the high score, lists the
// run's tally, and reports the outcome with Jay, then returns the player to the farm to
// keep playing (the high score is already banked).

import Phaser from 'phaser';
import { ARMOR_ORDER } from '../data/armor';
import { MAPS } from '../data/maps';
import { palette, toCss } from '../data/palette';
import { GameStateStore } from '../state/GameStateStore';
import { recordHighScore, saveGame } from '../save/SaveSystem';
import { tierName } from '../systems/AffectionSystem';
import { transitionTo } from '../systems/MapTransitionSystem';
import { MapId, NpcId, SceneKey } from '../types/ids';
import { STORE_KEY } from './BootScene';

export class EndScene extends Phaser.Scene {
  private store!: GameStateStore;

  constructor() {
    super(SceneKey.End);
  }

  create(): void {
    this.store = this.registry.get(STORE_KEY) as GameStateStore;
    const s = this.store.state;
    const w = this.scale.width;
    const h = this.scale.height;

    const highScore = recordHighScore(s.player.gold);
    const jay = s.affection[NpcId.Jay];
    const relationship = jay ? `Jay ${tierName(jay.points)}` : 'You kept to yourself';

    this.add.rectangle(0, 0, w, h, palette.skyNight, 0.82).setOrigin(0, 0);
    this.add.rectangle(w / 2, h / 2, 440, 320, palette.uiPanel, 0.98).setStrokeStyle(2, palette.outline);

    this.add
      .text(w / 2, 44, '✦  The Ruin Heart is stilled  ✦', {
        fontFamily: 'monospace',
        fontSize: '17px',
        color: toCss(palette.gold),
      })
      .setOrigin(0.5);
    this.add
      .text(w / 2, 70, 'The ruins fall quiet. The farm is safe.', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: toCss(palette.uiInk),
      })
      .setOrigin(0.5);

    const rows: [string, string][] = [
      ['Final gold (high score)', `${s.player.gold}g`],
      ['Best ever', `${highScore}g`],
      ['Days survived', `${s.time.day}`],
      ['Crops harvested', `${s.stats.cropsHarvested}`],
      ['Chickens petted', `${s.stats.chickensPetted}`],
      ['Monsters defeated', `${s.stats.monstersDefeated}`],
      ['Starless pieces', `${s.armor.collectedPieces.length}/${ARMOR_ORDER.length}`],
      ['Village romance', relationship],
    ];

    const left = w / 2 - 196;
    const right = w / 2 + 196;
    let y = 104;
    for (const [label, value] of rows) {
      this.add.text(left, y, label, { fontFamily: 'monospace', fontSize: '13px', color: toCss(palette.uiInk) });
      this.add
        .text(right, y, value, { fontFamily: 'monospace', fontSize: '13px', color: toCss(palette.gold) })
        .setOrigin(1, 0);
      y += 24;
    }

    this.add
      .text(w / 2, h - 34, 'Press [Space] to return to your farm', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: toCss(palette.uiInk),
      })
      .setOrigin(0.5);

    const kb = this.input.keyboard!;
    const cont = () => this.continue();
    kb.once('keydown-SPACE', cont);
    kb.once('keydown-ENTER', cont);
  }

  private continue(): void {
    const farm = MAPS[MapId.Farm];
    transitionTo(this.store.state, MapId.Farm, farm.spawnTile);
    saveGame(this.store.state);
    this.scene.start(SceneKey.World); // shuts down this scene and restarts the world on the farm
  }
}
