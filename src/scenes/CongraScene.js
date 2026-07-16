import Phaser from 'phaser';
// CongraScene.js — congratulations on clearing the final stage. First clear
// also unlocks EX mode (the super-scaler 3D version, ex.html) and offers to
// play it right away; the unlock persists either way (see state.js) and adds
// the EX button to the title screen.
import { SCENES, GAME_WIDTH, GAME_HEIGHT, CENTER_X, CENTER_Y } from '../constants.js';
import { gameState, saveExUnlocked } from '../state.js';
import * as Sound from '../sound.js';

export class CongraScene extends Phaser.Scene {
  constructor() { super(SCENES.CONGRA); }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0, 0);
    this.add.image(CENTER_X, CENTER_Y - 40, 'game_ui', 'congraBg0.gif').setOrigin(0.5);
    this.add.image(CENTER_X, CENTER_Y + 60, 'game_ui', 'congraTxt0.gif').setOrigin(0.5);
    Sound.play('voice_congra');

    if (!gameState.exUnlocked) {
      saveExUnlocked();
      // Let the congratulations land first, then present the reward.
      this.time.delayedCall(2600, () => this.showExUnlockPanel());
    } else {
      this.input.once('pointerup', () => this.scene.start(SCENES.ENDING));
      this.time.delayedCall(5000, () => this.scene.start(SCENES.ENDING));
    }
  }

  showExUnlockPanel() {
    Sound.play('se_correct');
    const panel = this.add.container(0, 0).setDepth(100).setAlpha(0);
    panel.add(this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.78).setOrigin(0, 0));

    const style = (size, color) => ({
      fontFamily: '"Courier New", monospace', fontStyle: 'bold',
      fontSize: `${size}px`, color,
    });
    const title = this.add.text(CENTER_X, CENTER_Y - 70, 'EX MODE\nUNLOCKED!', { ...style(22, '#fde047'), align: 'center' })
      .setOrigin(0.5).setResolution(2);
    const sub = this.add.text(CENTER_X, CENTER_Y - 28, 'SUPER SCALER 3D', style(11, '#7dd3fc'))
      .setOrigin(0.5).setResolution(2);
    panel.add([title, sub]);

    // ▶ PLAY NOW — jumps straight into the 3D version
    const playBg = this.add.rectangle(CENTER_X, CENTER_Y + 22, 176, 34, 0xfde047).setOrigin(0.5);
    const playTxt = this.add.text(CENTER_X, CENTER_Y + 22, '▶ PLAY NOW', style(15, '#000000'))
      .setOrigin(0.5).setResolution(2);
    playBg.setInteractive({ useHandCursor: true });
    playBg.once('pointerup', () => this.launchEx());
    panel.add([playBg, playTxt]);
    this.tweens.add({ targets: [playBg, playTxt], scale: 1.06, duration: 500, yoyo: true, repeat: -1 });

    // CONTINUE — keep the unlock, carry on to the ending
    const later = this.add.text(CENTER_X, CENTER_Y + 92, 'CONTINUE', style(11, '#9ca3af'))
      .setOrigin(0.5).setResolution(2);
    later.setInteractive({ useHandCursor: true });
    later.once('pointerup', () => {
      Sound.play('se_cursor');
      this.scene.start(SCENES.ENDING);
    });
    panel.add(later);

    this.tweens.add({ targets: panel, alpha: 1, duration: 300 });
  }

  launchEx() {
    Sound.play('se_decision');
    const fade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000)
      .setOrigin(0, 0).setAlpha(0).setDepth(2000);
    this.tweens.add({
      targets: fade, alpha: 1, duration: 600,
      onComplete: () => { window.location.href = 'ex.html'; },
    });
  }
}
