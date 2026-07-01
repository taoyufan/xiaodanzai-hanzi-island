import Phaser from 'phaser';

export class CostumeIcon extends Phaser.GameObjects.Container {
  private readonly graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, costumeId: string) {
    super(scene, x, y);
    this.graphics = scene.add.graphics();
    this.add(this.graphics);
    scene.add.existing(this);
    this.draw(costumeId);
  }

  private draw(costumeId: string): void {
    this.graphics.clear();

    switch (costumeId) {
      case 'dino_hat':
        this.graphics.fillStyle(0x62d26f, 1);
        this.graphics.fillRoundedRect(-34, -8, 68, 30, 13);
        this.graphics.fillTriangle(-24, -8, -12, -34, 0, -8);
        this.graphics.fillTriangle(10, -8, 24, -34, 36, -8);
        break;
      case 'rainbow_hat':
        this.graphics.lineStyle(8, 0xff5878, 1);
        this.graphics.beginPath();
        this.graphics.arc(0, 10, 34, Math.PI, 2 * Math.PI);
        this.graphics.strokePath();
        this.graphics.lineStyle(8, 0xffd84f, 1);
        this.graphics.beginPath();
        this.graphics.arc(0, 10, 24, Math.PI, 2 * Math.PI);
        this.graphics.strokePath();
        this.graphics.lineStyle(8, 0x5ad1ff, 1);
        this.graphics.beginPath();
        this.graphics.arc(0, 10, 14, Math.PI, 2 * Math.PI);
        this.graphics.strokePath();
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRoundedRect(-36, 4, 72, 20, 10);
        break;
      case 'star_bag':
        this.graphics.fillStyle(0xffd84f, 1);
        this.graphics.fillPoints(this.starPoints(0, 0, 36, 17, 5), true);
        this.graphics.lineStyle(4, 0xffb347, 1);
        this.graphics.strokePoints(this.starPoints(0, 0, 36, 17, 5), true);
        break;
      case 'bunny_ears':
        this.graphics.fillStyle(0xffc7e8, 1);
        this.graphics.fillEllipse(-15, -6, 20, 56);
        this.graphics.fillEllipse(15, -6, 20, 56);
        this.graphics.fillStyle(0xff8fc4, 1);
        this.graphics.fillEllipse(-15, -6, 8, 36);
        this.graphics.fillEllipse(15, -6, 8, 36);
        break;
      case 'space_helmet':
        this.graphics.fillStyle(0xd9f3ff, 0.45);
        this.graphics.fillEllipse(0, 0, 70, 72);
        this.graphics.lineStyle(6, 0xa7d7ff, 1);
        this.graphics.strokeEllipse(0, 0, 70, 72);
        this.graphics.fillStyle(0x8dc8ff, 1);
        this.graphics.fillRoundedRect(-28, 22, 56, 14, 7);
        break;
      case 'scholar_hat':
        this.graphics.fillStyle(0x5f83d6, 1);
        this.graphics.fillRoundedRect(-36, 2, 72, 18, 6);
        this.graphics.fillRect(-12, -28, 24, 30);
        this.graphics.lineStyle(4, 0xffd84f, 1);
        this.graphics.lineBetween(0, -28, 31, -20);
        this.graphics.fillStyle(0xffd84f, 1);
        this.graphics.fillCircle(34, -20, 6);
        break;
      case 'flower_crown':
        this.graphics.lineStyle(5, 0x62d26f, 1);
        this.graphics.beginPath();
        this.graphics.arc(0, 10, 35, Math.PI, 2 * Math.PI);
        this.graphics.strokePath();
        [-26, -13, 0, 13, 26].forEach((x, index) => {
          this.drawFlower(x, -8 - Math.abs(index - 2) * 3, index % 2 === 0 ? 0xff8a9a : 0xffd84f);
        });
        break;
      case 'cloud_cape':
        this.graphics.fillStyle(0xd9f3ff, 1);
        this.graphics.fillRoundedRect(-35, -2, 70, 40, 17);
        this.graphics.fillCircle(-24, -6, 17);
        this.graphics.fillCircle(0, -11, 22);
        this.graphics.fillCircle(24, -6, 17);
        this.graphics.lineStyle(4, 0x8fd7ff, 1);
        this.graphics.strokeRoundedRect(-35, -2, 70, 40, 17);
        break;
      case 'sun_badge':
        this.drawBadge(0xffc531, 0xff8f1f);
        this.graphics.fillStyle(0xfff06a, 1);
        this.graphics.fillPoints(this.starPoints(0, 0, 27, 12, 12), true);
        break;
      case 'moon_pin':
        this.graphics.fillStyle(0xb8b4ff, 1);
        this.graphics.fillCircle(-4, 0, 30);
        this.graphics.fillStyle(0xf2eef8, 1);
        this.graphics.fillCircle(9, -6, 30);
        this.graphics.lineStyle(4, 0x7c6fff, 1);
        this.graphics.strokeCircle(-4, 0, 30);
        break;
      case 'berry_hat':
        this.graphics.fillStyle(0xff5f7e, 1);
        this.graphics.fillEllipse(0, 4, 66, 36);
        this.graphics.fillCircle(-20, -2, 16);
        this.graphics.fillCircle(0, -10, 20);
        this.graphics.fillCircle(20, -2, 16);
        this.graphics.fillStyle(0xffffff, 0.88);
        [-20, -6, 10, 22].forEach((x, index) => this.graphics.fillEllipse(x, -3 + (index % 2) * 8, 5, 9));
        this.graphics.fillStyle(0x62d26f, 1);
        this.graphics.fillTriangle(-8, -27, 0, -44, 8, -27);
        break;
      case 'leaf_bag':
        this.graphics.lineStyle(4, 0x3d9655, 1);
        this.graphics.lineBetween(-20, -24, 22, 22);
        this.graphics.fillStyle(0x69c779, 1);
        this.graphics.fillEllipse(8, 7, 44, 62);
        this.graphics.lineStyle(3, 0xffffff, 0.86);
        this.graphics.lineBetween(-4, -14, 20, 31);
        this.graphics.lineBetween(4, 6, 25, -2);
        break;
      case 'candy_scarf':
        this.graphics.fillStyle(0xffa6e8, 1);
        this.graphics.fillRoundedRect(-34, -10, 68, 22, 11);
        this.graphics.fillRoundedRect(8, 0, 22, 42, 10);
        this.graphics.fillStyle(0xffffff, 0.95);
        this.graphics.fillRoundedRect(-18, -10, 12, 22, 6);
        this.graphics.fillRoundedRect(4, -10, 12, 22, 6);
        this.graphics.fillRoundedRect(13, 18, 12, 10, 5);
        break;
      case 'bubble_hat':
        this.graphics.fillStyle(0x83e8ff, 0.55);
        this.graphics.fillCircle(-22, 4, 18);
        this.graphics.fillCircle(0, -11, 23);
        this.graphics.fillCircle(23, 1, 17);
        this.graphics.lineStyle(3, 0xffffff, 0.95);
        this.graphics.strokeCircle(-22, 4, 18);
        this.graphics.strokeCircle(0, -11, 23);
        this.graphics.strokeCircle(23, 1, 17);
        break;
      case 'music_note':
        this.graphics.fillStyle(0x8f7cff, 1);
        this.graphics.fillCircle(-10, 19, 13);
        this.graphics.fillRect(1, -32, 7, 52);
        this.graphics.fillRoundedRect(1, -32, 32, 8, 4);
        this.graphics.fillCircle(30, 25, 11);
        this.graphics.lineStyle(4, 0xffd84f, 1);
        this.graphics.lineBetween(-22, 7, 4, -25);
        break;
      case 'paint_apron':
        this.graphics.fillStyle(0xffb15f, 1);
        this.graphics.fillRoundedRect(-27, -20, 54, 60, 10);
        this.graphics.lineStyle(4, 0xf07a3f, 1);
        this.graphics.lineBetween(-20, -18, -32, -43);
        this.graphics.lineBetween(20, -18, 32, -43);
        this.drawPaintDots();
        break;
      case 'peach_hat':
        this.graphics.fillStyle(0xff9dbc, 1);
        this.graphics.fillEllipse(0, 0, 68, 48);
        this.graphics.fillStyle(0xff7aa8, 1);
        this.graphics.fillEllipse(14, -1, 30, 38);
        this.graphics.fillStyle(0x69c779, 1);
        this.graphics.fillEllipse(-12, -30, 28, 14);
        break;
      case 'snow_crown':
        this.graphics.fillStyle(0xbfefff, 1);
        this.graphics.fillPoints(
          [
            new Phaser.Geom.Point(-34, 12),
            new Phaser.Geom.Point(-22, -30),
            new Phaser.Geom.Point(-9, 6),
            new Phaser.Geom.Point(0, -39),
            new Phaser.Geom.Point(9, 6),
            new Phaser.Geom.Point(22, -30),
            new Phaser.Geom.Point(34, 12),
          ],
          true,
        );
        this.graphics.fillRoundedRect(-38, 8, 76, 18, 9);
        this.graphics.fillStyle(0xffffff, 1);
        [-22, 0, 22].forEach((x) => this.graphics.fillCircle(x, 3, 5));
        break;
      case 'book_bag':
        this.graphics.lineStyle(4, 0x4f7fc9, 1);
        this.graphics.lineBetween(-24, -24, 20, 17);
        this.graphics.fillStyle(0x7db4ff, 1);
        this.graphics.fillRoundedRect(-20, -22, 48, 58, 8);
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(-8, -14, 25, 42);
        this.graphics.lineStyle(3, 0x4f7fc9, 1);
        this.graphics.lineBetween(5, -14, 5, 28);
        break;
      case 'heart_pin':
        this.drawBadge(0xff7aa8, 0xcf3f72);
        this.drawHeart(0, 0, 34, 0xff4f87);
        break;
      case 'planet_ring':
        this.graphics.lineStyle(5, 0xa97cff, 1);
        this.graphics.strokeEllipse(0, 0, 74, 26);
        this.graphics.fillStyle(0xffd84f, 1);
        this.graphics.fillCircle(0, 0, 22);
        this.graphics.fillStyle(0xff8ad8, 1);
        this.graphics.fillCircle(32, -7, 7);
        break;
      case 'water_drop':
        this.graphics.fillStyle(0x5fd4ff, 1);
        this.graphics.fillPoints(
          [
            new Phaser.Geom.Point(0, -38),
            new Phaser.Geom.Point(28, 3),
            new Phaser.Geom.Point(15, 31),
            new Phaser.Geom.Point(-15, 31),
            new Phaser.Geom.Point(-28, 3),
          ],
          true,
        );
        this.graphics.fillCircle(0, 9, 28);
        this.graphics.fillStyle(0xffffff, 0.82);
        this.graphics.fillCircle(-12, -2, 7);
        break;
      case 'flame_badge':
        this.drawBadge(0xff7a45, 0xd94522);
        this.graphics.fillStyle(0xffd84f, 1);
        this.graphics.fillPoints(
          [
            new Phaser.Geom.Point(0, -30),
            new Phaser.Geom.Point(22, -2),
            new Phaser.Geom.Point(10, 26),
            new Phaser.Geom.Point(0, 31),
            new Phaser.Geom.Point(-16, 18),
            new Phaser.Geom.Point(-21, -4),
          ],
          true,
        );
        break;
      case 'forest_hat':
        this.graphics.fillStyle(0x4fb56d, 1);
        this.graphics.fillRoundedRect(-38, 10, 76, 19, 9);
        [-22, 0, 22].forEach((x) => {
          this.graphics.fillTriangle(x - 18, 10, x, -36, x + 18, 10);
          this.graphics.fillRect(x - 5, 4, 10, 15);
        });
        this.graphics.fillStyle(0x8fd36b, 1);
        this.graphics.fillCircle(24, 17, 6);
        break;
      case 'kite_tail':
        this.graphics.lineStyle(4, 0xff9f43, 1);
        this.graphics.lineBetween(16, 12, 35, 38);
        this.graphics.fillStyle(0xffd36e, 1);
        this.graphics.fillPoints(
          [
            new Phaser.Geom.Point(0, -29),
            new Phaser.Geom.Point(30, 0),
            new Phaser.Geom.Point(0, 29),
            new Phaser.Geom.Point(-30, 0),
          ],
          true,
        );
        this.graphics.fillStyle(0xff8ad8, 1);
        this.graphics.fillCircle(28, 25, 6);
        this.graphics.fillStyle(0x5ad1ff, 1);
        this.graphics.fillCircle(40, 42, 6);
        break;
      case 'gem_crown':
        this.graphics.fillStyle(0x58d1c9, 1);
        this.graphics.fillRoundedRect(-37, 12, 74, 18, 9);
        [
          [-24, -9, 0x8ff5ef],
          [0, -24, 0xffffff],
          [24, -9, 0x8ff5ef],
        ].forEach(([x, y, color]) => this.drawGem(x, y, color));
        break;
      case 'pencil_hat':
        this.graphics.fillStyle(0xf5c45b, 1);
        this.graphics.fillRoundedRect(-38, 8, 76, 18, 8);
        this.graphics.fillStyle(0xfff1a8, 1);
        this.graphics.fillRect(-11, -31, 22, 39);
        this.graphics.fillStyle(0x2f2f44, 1);
        this.graphics.fillTriangle(-11, -31, 11, -31, 0, -49);
        this.graphics.fillStyle(0xff9dbc, 1);
        this.graphics.fillRect(-11, 3, 22, 8);
        break;
      case 'crayon_bag':
        this.graphics.lineStyle(4, 0xd9559b, 1);
        this.graphics.lineBetween(-24, -22, 20, 18);
        this.graphics.fillStyle(0xff86c8, 1);
        this.graphics.fillRoundedRect(-24, -18, 54, 54, 9);
        [0x5ad1ff, 0xffd84f, 0x62d26f].forEach((color, index) => {
          const x = -14 + index * 15;
          this.graphics.fillStyle(color, 1);
          this.graphics.fillRoundedRect(x, -33, 9, 40, 4);
          this.graphics.fillStyle(0xfff1a8, 1);
          this.graphics.fillTriangle(x, -33, x + 9, -33, x + 4.5, -44);
        });
        break;
      case 'story_cape':
        this.graphics.fillStyle(0x8cc9ff, 1);
        this.graphics.fillPoints(
          [
            new Phaser.Geom.Point(-34, -23),
            new Phaser.Geom.Point(34, -23),
            new Phaser.Geom.Point(48, 38),
            new Phaser.Geom.Point(0, 23),
            new Phaser.Geom.Point(-48, 38),
          ],
          true,
        );
        this.graphics.lineStyle(4, 0x4f90d8, 1);
        this.graphics.lineBetween(-34, -23, 34, -23);
        this.graphics.fillStyle(0xffffff, 0.92);
        this.graphics.fillRect(-16, -9, 32, 26);
        this.graphics.lineStyle(2, 0x4f90d8, 1);
        this.graphics.lineBetween(0, -9, 0, 17);
        break;
      case 'golden_star':
        this.graphics.fillStyle(0xffd84f, 1);
        this.graphics.fillPoints(this.starPoints(0, -6, 40, 18, 5), true);
        this.graphics.lineStyle(4, 0xffa51f, 1);
        this.graphics.strokePoints(this.starPoints(0, -6, 40, 18, 5), true);
        break;
      default:
        this.graphics.fillStyle(0xffd84f, 1);
        this.graphics.fillPoints(this.starPoints(0, 0, 32, 15, 5), true);
        break;
    }
  }

  private drawBadge(fillColor: number, strokeColor: number): void {
    this.graphics.fillStyle(fillColor, 1);
    this.graphics.fillCircle(0, 0, 31);
    this.graphics.lineStyle(4, strokeColor, 1);
    this.graphics.strokeCircle(0, 0, 31);
  }

  private drawFlower(x: number, y: number, color: number): void {
    this.graphics.fillStyle(color, 1);
    this.graphics.fillCircle(x - 6, y, 7);
    this.graphics.fillCircle(x + 6, y, 7);
    this.graphics.fillCircle(x, y - 6, 7);
    this.graphics.fillCircle(x, y + 6, 7);
    this.graphics.fillStyle(0xfff1a8, 1);
    this.graphics.fillCircle(x, y, 5);
  }

  private drawHeart(x: number, y: number, size: number, color: number): void {
    const half = size / 2;
    this.graphics.fillStyle(color, 1);
    this.graphics.fillCircle(x - half * 0.45, y - half * 0.25, half * 0.48);
    this.graphics.fillCircle(x + half * 0.45, y - half * 0.25, half * 0.48);
    this.graphics.fillTriangle(x - half, y - half * 0.06, x + half, y - half * 0.06, x, y + half);
  }

  private drawGem(x: number, y: number, color: number): void {
    const points = [
      new Phaser.Geom.Point(x, y - 16),
      new Phaser.Geom.Point(x + 16, y - 3),
      new Phaser.Geom.Point(x + 9, y + 16),
      new Phaser.Geom.Point(x - 9, y + 16),
      new Phaser.Geom.Point(x - 16, y - 3),
    ];
    this.graphics.fillStyle(color, 1);
    this.graphics.fillPoints(points, true);
    this.graphics.lineStyle(2, 0x2f9f9a, 1);
    this.graphics.strokePoints(points, true);
  }

  private drawPaintDots(): void {
    [
      [-12, 3, 0x5ad1ff],
      [10, 16, 0xff5f7e],
      [4, -8, 0x62d26f],
    ].forEach(([x, y, color]) => {
      this.graphics.fillStyle(color, 1);
      this.graphics.fillCircle(x, y, 6);
    });
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
}
