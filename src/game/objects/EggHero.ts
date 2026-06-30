import Phaser from 'phaser';

export class EggHero extends Phaser.GameObjects.Container {
  private readonly bodyGraphics: Phaser.GameObjects.Graphics;
  private readonly face: Phaser.GameObjects.Graphics;
  private readonly costumeLayer: Phaser.GameObjects.Graphics;
  private costumeId: string | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, costumeId: string | null = null) {
    super(scene, x, y);
    this.bodyGraphics = scene.add.graphics();
    this.costumeLayer = scene.add.graphics();
    this.face = scene.add.graphics();
    this.add([this.bodyGraphics, this.costumeLayer, this.face]);
    scene.add.existing(this);
    this.setCostume(costumeId);
  }

  setCostume(costumeId: string | null): void {
    this.costumeId = costumeId;
    this.draw();
  }

  happyJump(): void {
    this.scene.tweens.add({
      targets: this,
      y: this.y - 54,
      duration: 160,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  sadShake(): void {
    this.scene.tweens.add({
      targets: this,
      x: this.x + 18,
      duration: 70,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
    });
  }

  celebrate(): void {
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 640,
      ease: 'Back.easeOut',
      onComplete: () => this.setAngle(0),
    });

    for (let i = 0; i < 12; i += 1) {
      const star = this.scene.add.text(this.x, this.y - 80, '★', {
        fontSize: '32px',
        color: '#fff06a',
      });
      const angle = Phaser.Math.DegToRad(i * 30);
      this.scene.tweens.add({
        targets: star,
        x: this.x + Math.cos(angle) * Phaser.Math.Between(90, 160),
        y: this.y - 80 + Math.sin(angle) * Phaser.Math.Between(70, 130),
        alpha: 0,
        duration: 760,
        ease: 'Cubic.easeOut',
        onComplete: () => star.destroy(),
      });
    }
  }

  private draw(): void {
    this.bodyGraphics.clear();
    this.costumeLayer.clear();
    this.face.clear();

    this.bodyGraphics.fillStyle(0xffffff, 1);
    this.bodyGraphics.fillEllipse(0, 0, 152, 176);
    this.bodyGraphics.lineStyle(8, 0xffc768, 1);
    this.bodyGraphics.strokeEllipse(0, 0, 152, 176);

    this.bodyGraphics.fillStyle(0xffd36f, 1);
    this.bodyGraphics.fillCircle(-84, 10, 24);
    this.bodyGraphics.fillCircle(84, 10, 24);
    this.bodyGraphics.fillStyle(0xffa94f, 1);
    this.bodyGraphics.fillEllipse(-44, 91, 54, 30);
    this.bodyGraphics.fillEllipse(44, 91, 54, 30);

    this.face.fillStyle(0x2f2f44, 1);
    this.face.fillCircle(-34, -24, 13);
    this.face.fillCircle(34, -24, 13);
    this.face.fillStyle(0xffffff, 1);
    this.face.fillCircle(-39, -29, 4);
    this.face.fillCircle(29, -29, 4);
    this.face.lineStyle(6, 0x2f2f44, 1);
    this.face.beginPath();
    this.face.arc(0, 10, 24, 0.08 * Math.PI, 0.92 * Math.PI);
    this.face.strokePath();
    this.face.fillStyle(0xff9db5, 1);
    this.face.fillCircle(-54, 2, 10);
    this.face.fillCircle(54, 2, 10);

    this.drawCostume();
  }

  private drawCostume(): void {
    if (!this.costumeId) {
      return;
    }

    switch (this.costumeId) {
      case 'dino_hat':
        this.costumeLayer.fillStyle(0x62d26f, 1);
        this.costumeLayer.fillRoundedRect(-66, -106, 132, 44, 18);
        this.costumeLayer.fillTriangle(-38, -106, -18, -145, 2, -106);
        this.costumeLayer.fillTriangle(18, -106, 38, -145, 58, -106);
        break;
      case 'rainbow_hat':
        this.costumeLayer.lineStyle(12, 0xff5878, 1);
        this.costumeLayer.strokeCircle(0, -84, 58);
        this.costumeLayer.lineStyle(12, 0xffd84f, 1);
        this.costumeLayer.strokeCircle(0, -84, 42);
        this.costumeLayer.lineStyle(12, 0x5ad1ff, 1);
        this.costumeLayer.strokeCircle(0, -84, 26);
        this.costumeLayer.fillStyle(0xffffff, 1);
        this.costumeLayer.fillRoundedRect(-66, -84, 132, 32, 16);
        break;
      case 'star_bag':
        this.costumeLayer.fillStyle(0xffd84f, 1);
        this.costumeLayer.fillPoints(
          [
            new Phaser.Geom.Point(88, -24),
            new Phaser.Geom.Point(103, 5),
            new Phaser.Geom.Point(134, 10),
            new Phaser.Geom.Point(111, 32),
            new Phaser.Geom.Point(116, 64),
            new Phaser.Geom.Point(88, 49),
            new Phaser.Geom.Point(60, 64),
            new Phaser.Geom.Point(65, 32),
            new Phaser.Geom.Point(42, 10),
            new Phaser.Geom.Point(73, 5),
          ],
          true,
        );
        break;
      case 'bunny_ears':
        this.costumeLayer.fillStyle(0xffc7e8, 1);
        this.costumeLayer.fillEllipse(-36, -130, 32, 86);
        this.costumeLayer.fillEllipse(36, -130, 32, 86);
        this.costumeLayer.fillStyle(0xff8fc4, 1);
        this.costumeLayer.fillEllipse(-36, -128, 14, 56);
        this.costumeLayer.fillEllipse(36, -128, 14, 56);
        break;
      case 'space_helmet':
        this.costumeLayer.lineStyle(12, 0xa7d7ff, 0.95);
        this.costumeLayer.strokeEllipse(0, -8, 178, 196);
        this.costumeLayer.fillStyle(0xd9f3ff, 0.28);
        this.costumeLayer.fillEllipse(0, -8, 178, 196);
        this.costumeLayer.fillStyle(0x8dc8ff, 1);
        this.costumeLayer.fillRoundedRect(-56, 84, 112, 24, 12);
        break;
      case 'scholar_hat':
        this.costumeLayer.fillStyle(0x5f83d6, 1);
        this.costumeLayer.fillRoundedRect(-66, -112, 132, 34, 10);
        this.costumeLayer.fillRect(-22, -146, 44, 40);
        this.costumeLayer.lineStyle(5, 0xffd84f, 1);
        this.costumeLayer.lineBetween(0, -146, 54, -132);
        this.costumeLayer.fillStyle(0xffd84f, 1);
        this.costumeLayer.fillCircle(58, -132, 8);
        break;
      default:
        break;
    }
  }
}
