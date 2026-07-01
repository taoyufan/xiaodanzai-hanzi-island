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
      case 'flower_crown':
        this.costumeLayer.lineStyle(8, 0x62d26f, 1);
        this.costumeLayer.beginPath();
        this.costumeLayer.arc(0, -94, 64, 1.08 * Math.PI, 1.92 * Math.PI);
        this.costumeLayer.strokePath();
        [-48, -24, 0, 24, 48].forEach((x, index) => {
          const y = -112 - Math.abs(index - 2) * 6;
          this.drawFlower(x, y, index % 2 === 0 ? 0xff8a9a : 0xffd84f);
        });
        break;
      case 'cloud_cape':
        this.costumeLayer.fillStyle(0xd9f3ff, 0.95);
        this.costumeLayer.fillRoundedRect(-84, 28, 168, 88, 32);
        this.costumeLayer.fillCircle(-56, 24, 32);
        this.costumeLayer.fillCircle(0, 16, 38);
        this.costumeLayer.fillCircle(56, 24, 32);
        this.costumeLayer.lineStyle(5, 0x8fd7ff, 0.9);
        this.costumeLayer.strokeRoundedRect(-84, 28, 168, 88, 32);
        break;
      case 'sun_badge':
        this.drawBadge(-68, -6, 0xffc531, 0xff8f1f);
        this.costumeLayer.fillStyle(0xfff06a, 1);
        this.costumeLayer.fillPoints(this.starPoints(-68, -6, 32, 15, 12), true);
        break;
      case 'moon_pin':
        this.costumeLayer.fillStyle(0xb8b4ff, 1);
        this.costumeLayer.fillCircle(60, -50, 28);
        this.costumeLayer.fillStyle(0xffffff, 1);
        this.costumeLayer.fillCircle(72, -56, 28);
        this.costumeLayer.lineStyle(4, 0x7c6fff, 1);
        this.costumeLayer.strokeCircle(60, -50, 28);
        break;
      case 'berry_hat':
        this.costumeLayer.fillStyle(0xff5f7e, 1);
        this.costumeLayer.fillEllipse(0, -104, 128, 52);
        this.costumeLayer.fillCircle(-38, -112, 28);
        this.costumeLayer.fillCircle(0, -122, 34);
        this.costumeLayer.fillCircle(38, -112, 28);
        this.costumeLayer.fillStyle(0xffffff, 0.86);
        [-40, -16, 10, 36].forEach((x, index) => {
          this.costumeLayer.fillEllipse(x, -112 + (index % 2) * 12, 8, 14);
        });
        this.costumeLayer.fillStyle(0x62d26f, 1);
        this.costumeLayer.fillTriangle(-12, -148, 0, -174, 12, -148);
        break;
      case 'leaf_bag':
        this.costumeLayer.lineStyle(6, 0x3d9655, 1);
        this.costumeLayer.lineBetween(42, -28, 102, 36);
        this.costumeLayer.fillStyle(0x69c779, 1);
        this.costumeLayer.fillEllipse(98, 32, 62, 92);
        this.costumeLayer.lineStyle(4, 0xffffff, 0.8);
        this.costumeLayer.lineBetween(82, 4, 112, 62);
        this.costumeLayer.lineBetween(92, 28, 116, 18);
        break;
      case 'candy_scarf':
        this.costumeLayer.fillStyle(0xffa6e8, 1);
        this.costumeLayer.fillRoundedRect(-64, 44, 128, 28, 14);
        this.costumeLayer.fillRoundedRect(28, 56, 34, 72, 16);
        this.costumeLayer.fillStyle(0xffffff, 0.95);
        this.costumeLayer.fillRoundedRect(-32, 44, 20, 28, 10);
        this.costumeLayer.fillRoundedRect(8, 44, 20, 28, 10);
        this.costumeLayer.fillRoundedRect(35, 84, 20, 16, 8);
        break;
      case 'bubble_hat':
        this.costumeLayer.fillStyle(0x83e8ff, 0.45);
        this.costumeLayer.fillCircle(-48, -106, 30);
        this.costumeLayer.fillCircle(-12, -126, 36);
        this.costumeLayer.fillCircle(34, -112, 28);
        this.costumeLayer.lineStyle(4, 0xffffff, 0.9);
        this.costumeLayer.strokeCircle(-48, -106, 30);
        this.costumeLayer.strokeCircle(-12, -126, 36);
        this.costumeLayer.strokeCircle(34, -112, 28);
        break;
      case 'music_note':
        this.costumeLayer.fillStyle(0x8f7cff, 1);
        this.costumeLayer.fillCircle(70, -38, 18);
        this.costumeLayer.fillRect(82, -104, 8, 68);
        this.costumeLayer.fillRoundedRect(82, -104, 34, 10, 5);
        this.costumeLayer.lineStyle(5, 0xffd84f, 1);
        this.costumeLayer.lineBetween(52, -54, 88, -96);
        break;
      case 'paint_apron':
        this.costumeLayer.fillStyle(0xffb15f, 1);
        this.costumeLayer.fillRoundedRect(-54, 26, 108, 104, 18);
        this.costumeLayer.lineStyle(6, 0xf07a3f, 1);
        this.costumeLayer.lineBetween(-42, 30, -62, -16);
        this.costumeLayer.lineBetween(42, 30, 62, -16);
        [
          [-22, 64, 0x5ad1ff],
          [18, 84, 0xff5f7e],
          [8, 48, 0x62d26f],
        ].forEach(([x, y, color]) => {
          this.costumeLayer.fillStyle(color, 1);
          this.costumeLayer.fillCircle(x, y, 9);
        });
        break;
      case 'peach_hat':
        this.costumeLayer.fillStyle(0xff9dbc, 1);
        this.costumeLayer.fillEllipse(0, -110, 120, 70);
        this.costumeLayer.fillStyle(0xff7aa8, 1);
        this.costumeLayer.fillEllipse(26, -112, 52, 58);
        this.costumeLayer.fillStyle(0x69c779, 1);
        this.costumeLayer.fillEllipse(-22, -152, 42, 20);
        break;
      case 'snow_crown':
        this.costumeLayer.fillStyle(0xbfefff, 1);
        this.costumeLayer.fillPoints(
          [
            new Phaser.Geom.Point(-64, -86),
            new Phaser.Geom.Point(-44, -136),
            new Phaser.Geom.Point(-18, -92),
            new Phaser.Geom.Point(0, -148),
            new Phaser.Geom.Point(18, -92),
            new Phaser.Geom.Point(44, -136),
            new Phaser.Geom.Point(64, -86),
          ],
          true,
        );
        this.costumeLayer.fillRoundedRect(-70, -92, 140, 26, 12);
        this.costumeLayer.fillStyle(0xffffff, 1);
        [-44, 0, 44].forEach((x) => this.costumeLayer.fillCircle(x, -100, 8));
        break;
      case 'book_bag':
        this.costumeLayer.lineStyle(6, 0x4f7fc9, 1);
        this.costumeLayer.lineBetween(42, -30, 104, 36);
        this.costumeLayer.fillStyle(0x7db4ff, 1);
        this.costumeLayer.fillRoundedRect(66, 10, 68, 88, 12);
        this.costumeLayer.fillStyle(0xffffff, 1);
        this.costumeLayer.fillRect(82, 22, 36, 64);
        this.costumeLayer.lineStyle(3, 0x4f7fc9, 1);
        this.costumeLayer.lineBetween(100, 22, 100, 86);
        break;
      case 'heart_pin':
        this.drawBadge(-66, -4, 0xff7aa8, 0xcf3f72);
        this.drawHeart(-66, -4, 30, 0xff4f87);
        break;
      case 'planet_ring':
        this.costumeLayer.lineStyle(6, 0xa97cff, 1);
        this.costumeLayer.strokeEllipse(0, -96, 136, 44);
        this.costumeLayer.fillStyle(0xffd84f, 1);
        this.costumeLayer.fillCircle(0, -96, 34);
        this.costumeLayer.fillStyle(0xff8ad8, 1);
        this.costumeLayer.fillCircle(58, -104, 10);
        break;
      case 'water_drop':
        this.costumeLayer.fillStyle(0x5fd4ff, 1);
        this.costumeLayer.fillPoints(
          [
            new Phaser.Geom.Point(70, -64),
            new Phaser.Geom.Point(98, -22),
            new Phaser.Geom.Point(84, 12),
            new Phaser.Geom.Point(56, 12),
            new Phaser.Geom.Point(42, -22),
          ],
          true,
        );
        this.costumeLayer.fillCircle(70, -12, 29);
        this.costumeLayer.fillStyle(0xffffff, 0.8);
        this.costumeLayer.fillCircle(58, -20, 8);
        break;
      case 'flame_badge':
        this.drawBadge(-66, -4, 0xff7a45, 0xd94522);
        this.costumeLayer.fillStyle(0xffd84f, 1);
        this.costumeLayer.fillPoints(
          [
            new Phaser.Geom.Point(-66, -36),
            new Phaser.Geom.Point(-42, -6),
            new Phaser.Geom.Point(-54, 24),
            new Phaser.Geom.Point(-66, 30),
            new Phaser.Geom.Point(-82, 18),
            new Phaser.Geom.Point(-86, -6),
          ],
          true,
        );
        break;
      case 'forest_hat':
        this.costumeLayer.fillStyle(0x4fb56d, 1);
        this.costumeLayer.fillRoundedRect(-70, -104, 140, 34, 16);
        [-42, 0, 42].forEach((x) => {
          this.costumeLayer.fillTriangle(x - 28, -104, x, -160, x + 28, -104);
          this.costumeLayer.fillRect(x - 8, -112, 16, 24);
        });
        this.costumeLayer.fillStyle(0x8fd36b, 1);
        this.costumeLayer.fillCircle(46, -92, 10);
        break;
      case 'kite_tail':
        this.costumeLayer.lineStyle(5, 0xff9f43, 1);
        this.costumeLayer.lineBetween(78, 46, 130, 114);
        this.costumeLayer.fillStyle(0xffd36e, 1);
        this.costumeLayer.fillPoints(
          [
            new Phaser.Geom.Point(76, 18),
            new Phaser.Geom.Point(114, 46),
            new Phaser.Geom.Point(76, 74),
            new Phaser.Geom.Point(38, 46),
          ],
          true,
        );
        this.costumeLayer.fillStyle(0xff8ad8, 1);
        this.costumeLayer.fillCircle(112, 88, 9);
        this.costumeLayer.fillStyle(0x5ad1ff, 1);
        this.costumeLayer.fillCircle(130, 114, 9);
        break;
      case 'gem_crown':
        this.costumeLayer.fillStyle(0x58d1c9, 1);
        this.costumeLayer.fillRoundedRect(-68, -96, 136, 28, 12);
        [
          [-44, -118, 0x8ff5ef],
          [0, -136, 0xffffff],
          [44, -118, 0x8ff5ef],
        ].forEach(([x, y, color]) => this.drawGem(x, y, color));
        break;
      case 'pencil_hat':
        this.costumeLayer.fillStyle(0xf5c45b, 1);
        this.costumeLayer.fillRoundedRect(-72, -112, 144, 30, 12);
        this.costumeLayer.fillStyle(0xfff1a8, 1);
        this.costumeLayer.fillRect(-18, -154, 36, 48);
        this.costumeLayer.fillStyle(0x2f2f44, 1);
        this.costumeLayer.fillTriangle(-18, -154, 18, -154, 0, -182);
        this.costumeLayer.fillStyle(0xff9dbc, 1);
        this.costumeLayer.fillRect(-18, -106, 36, 14);
        break;
      case 'crayon_bag':
        this.costumeLayer.lineStyle(6, 0xd9559b, 1);
        this.costumeLayer.lineBetween(44, -28, 106, 34);
        this.costumeLayer.fillStyle(0xff86c8, 1);
        this.costumeLayer.fillRoundedRect(64, 10, 76, 88, 14);
        [0x5ad1ff, 0xffd84f, 0x62d26f].forEach((color, index) => {
          const x = 78 + index * 18;
          this.costumeLayer.fillStyle(color, 1);
          this.costumeLayer.fillRoundedRect(x, -8, 12, 58, 6);
          this.costumeLayer.fillStyle(0xfff1a8, 1);
          this.costumeLayer.fillTriangle(x, -8, x + 12, -8, x + 6, -24);
        });
        break;
      case 'story_cape':
        this.costumeLayer.fillStyle(0x8cc9ff, 0.96);
        this.costumeLayer.fillPoints(
          [
            new Phaser.Geom.Point(-72, 20),
            new Phaser.Geom.Point(72, 20),
            new Phaser.Geom.Point(106, 124),
            new Phaser.Geom.Point(0, 92),
            new Phaser.Geom.Point(-106, 124),
          ],
          true,
        );
        this.costumeLayer.lineStyle(5, 0x4f90d8, 1);
        this.costumeLayer.lineBetween(-72, 20, 72, 20);
        this.costumeLayer.fillStyle(0xffffff, 0.9);
        this.costumeLayer.fillRect(-30, 42, 60, 42);
        this.costumeLayer.lineStyle(3, 0x4f90d8, 1);
        this.costumeLayer.lineBetween(0, 42, 0, 84);
        break;
      case 'golden_star':
        this.costumeLayer.fillStyle(0xffd84f, 1);
        this.costumeLayer.fillPoints(this.starPoints(0, -126, 58, 26, 5), true);
        this.costumeLayer.lineStyle(5, 0xffa51f, 1);
        this.costumeLayer.strokePoints(this.starPoints(0, -126, 58, 26, 5), true);
        this.costumeLayer.fillStyle(0xfff1a8, 1);
        this.costumeLayer.fillRoundedRect(-62, -94, 124, 24, 12);
        break;
      default:
        this.drawGenericCostume(this.costumeId);
        break;
    }
  }

  private drawBadge(x: number, y: number, fillColor: number, strokeColor: number): void {
    this.costumeLayer.fillStyle(fillColor, 1);
    this.costumeLayer.fillCircle(x, y, 36);
    this.costumeLayer.lineStyle(5, strokeColor, 1);
    this.costumeLayer.strokeCircle(x, y, 36);
  }

  private drawFlower(x: number, y: number, color: number): void {
    this.costumeLayer.fillStyle(color, 1);
    this.costumeLayer.fillCircle(x - 10, y, 11);
    this.costumeLayer.fillCircle(x + 10, y, 11);
    this.costumeLayer.fillCircle(x, y - 10, 11);
    this.costumeLayer.fillCircle(x, y + 10, 11);
    this.costumeLayer.fillStyle(0xfff1a8, 1);
    this.costumeLayer.fillCircle(x, y, 8);
  }

  private drawHeart(x: number, y: number, size: number, color: number): void {
    const half = size / 2;
    this.costumeLayer.fillStyle(color, 1);
    this.costumeLayer.fillCircle(x - half * 0.45, y - half * 0.25, half * 0.48);
    this.costumeLayer.fillCircle(x + half * 0.45, y - half * 0.25, half * 0.48);
    this.costumeLayer.fillTriangle(x - half, y - half * 0.06, x + half, y - half * 0.06, x, y + half);
  }

  private drawGem(x: number, y: number, color: number): void {
    this.costumeLayer.fillStyle(color, 1);
    this.costumeLayer.fillPoints(
      [
        new Phaser.Geom.Point(x, y - 24),
        new Phaser.Geom.Point(x + 24, y - 4),
        new Phaser.Geom.Point(x + 14, y + 24),
        new Phaser.Geom.Point(x - 14, y + 24),
        new Phaser.Geom.Point(x - 24, y - 4),
      ],
      true,
    );
    this.costumeLayer.lineStyle(3, 0x2f9f9a, 1);
    this.costumeLayer.strokePoints(
      [
        new Phaser.Geom.Point(x, y - 24),
        new Phaser.Geom.Point(x + 24, y - 4),
        new Phaser.Geom.Point(x + 14, y + 24),
        new Phaser.Geom.Point(x - 14, y + 24),
        new Phaser.Geom.Point(x - 24, y - 4),
      ],
      true,
    );
  }

  private starPoints(x: number, y: number, outerRadius: number, innerRadius: number, pointCount: number): Phaser.Geom.Point[] {
    const points: Phaser.Geom.Point[] = [];
    const total = pointCount * 2;
    for (let i = 0; i < total; i += 1) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = -Math.PI / 2 + (i / total) * Math.PI * 2;
      points.push(new Phaser.Geom.Point(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius));
    }
    return points;
  }

  private drawGenericCostume(costumeId: string): void {
    const color = this.colorFromId(costumeId);
    this.costumeLayer.fillStyle(color, 1);
    this.costumeLayer.fillRoundedRect(-58, -106, 116, 32, 16);
    this.costumeLayer.fillCircle(0, -120, 20);
    this.costumeLayer.fillStyle(0xffffff, 0.95);
    this.costumeLayer.fillCircle(82, 10, 22);
    this.costumeLayer.lineStyle(5, color, 1);
    this.costumeLayer.strokeCircle(82, 10, 22);
    this.costumeLayer.fillStyle(0xffd84f, 1);
    this.costumeLayer.fillPoints(
      [
        new Phaser.Geom.Point(82, -4),
        new Phaser.Geom.Point(87, 6),
        new Phaser.Geom.Point(98, 8),
        new Phaser.Geom.Point(90, 16),
        new Phaser.Geom.Point(92, 28),
        new Phaser.Geom.Point(82, 22),
        new Phaser.Geom.Point(72, 28),
        new Phaser.Geom.Point(74, 16),
        new Phaser.Geom.Point(66, 8),
        new Phaser.Geom.Point(77, 6),
      ],
      true,
    );
  }

  private colorFromId(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    const palette = [0xff8ad8, 0x62d26f, 0xffd84f, 0xa7d7ff, 0x8f7cff, 0xff9dbc, 0x58d1c9, 0xffb15f];
    return palette[hash % palette.length];
  }
}
