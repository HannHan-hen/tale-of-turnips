// Centralized input. The rest of the game asks this for a movement vector and whether the
// interact key was just pressed — it never reads raw keys. Rebinding later happens here.

import Phaser from 'phaser';

const DIAGONAL = Math.SQRT1_2; // normalize diagonal movement to unit length

export class InputSystem {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private interactKeys: Phaser.Input.Keyboard.Key[];
  private attackKeys: Phaser.Input.Keyboard.Key[];
  private hotkeys: Phaser.Input.Keyboard.Key[];

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    const codes = Phaser.Input.Keyboard.KeyCodes;
    this.interactKeys = [kb.addKey(codes.E)];
    this.attackKeys = [kb.addKey(codes.SPACE), kb.addKey(codes.J)];
    this.hotkeys = [
      kb.addKey(codes.ONE),
      kb.addKey(codes.TWO),
      kb.addKey(codes.THREE),
      kb.addKey(codes.FOUR),
    ];
  }

  // Returns a movement vector with components in [-1, 1], normalized for diagonals.
  getMovement(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) x -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) x += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) y -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) y += 1;
    if (x !== 0 && y !== 0) {
      x *= DIAGONAL;
      y *= DIAGONAL;
    }
    return { x, y };
  }

  interactJustPressed(): boolean {
    return this.interactKeys.some((k) => Phaser.Input.Keyboard.JustDown(k));
  }

  attackJustPressed(): boolean {
    return this.attackKeys.some((k) => Phaser.Input.Keyboard.JustDown(k));
  }

  // Returns the 0-based number-key index pressed this frame (1->0, 2->1, ...), or undefined.
  numberKeyJustPressed(): number | undefined {
    for (let i = 0; i < this.hotkeys.length; i++) {
      if (Phaser.Input.Keyboard.JustDown(this.hotkeys[i])) return i;
    }
    return undefined;
  }
}
