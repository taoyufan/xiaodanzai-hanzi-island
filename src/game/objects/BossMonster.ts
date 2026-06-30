import Phaser from 'phaser';

export class BossMonster extends Phaser.GameObjects.Container {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private health = 5;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.graphics = scene.add.graphics();
    this.label = scene.add
      .text(0, 96, '错字怪', {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '30px',
        color: '#5f2c82',
      })
      .setOrigin(0.5);
    this.add([this.graphics, this.label]);
    scene.add.existing(this);
    this.draw();
  }

  setHealth(value: number): void {
    this.health = Math.max(0, value);
    this.draw();
  }

  takeHit(): void {
    this.scene.tweens.add({
      targets: this,
      x: this.x + 18,
      duration: 55,
      yoyo: true,
      repeat: 5,
      ease: 'Sine.easeInOut',
    });
  }

  defeat(): void {
    this.scene.tweens.add({
      targets: this,
      scale: 0.2,
      alpha: 0,
      angle: 180,
      duration: 520,
      ease: 'Back.easeIn',
    });
  }

  private draw(): void {
    this.graphics.clear();
    this.graphics.fillStyle(0x9b6bff, 1);
    this.graphics.fillCircle(0, 0, 92);
    this.graphics.fillStyle(0x7c3aed, 1);
    this.graphics.fillCircle(-52, -54, 25);
    this.graphics.fillCircle(52, -54, 25);
    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.fillCircle(-34, -16, 22);
    this.graphics.fillCircle(34, -16, 22);
    this.graphics.fillStyle(0x402060, 1);
    this.graphics.fillCircle(-34, -16, 10);
    this.graphics.fillCircle(34, -16, 10);
    this.graphics.lineStyle(7, 0x402060, 1);
    this.graphics.beginPath();
    this.graphics.arc(0, 30, 36, 0.1 * Math.PI, 0.9 * Math.PI);
    this.graphics.strokePath();

    for (let i = 0; i < 5; i += 1) {
      this.graphics.fillStyle(i < this.health ? 0xff5c8a : 0xd8c8ff, 1);
      this.graphics.fillCircle(-56 + i * 28, -118, 10);
    }
  }
}
