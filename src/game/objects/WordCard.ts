import Phaser from 'phaser';

type WordCardOptions = {
  width?: number;
  height?: number;
  frontText: string;
  backText?: string;
  kind?: 'char' | 'emoji';
  char: string;
};

export class WordCard extends Phaser.GameObjects.Container {
  readonly char: string;
  readonly kind: 'char' | 'emoji';
  private readonly widthValue: number;
  private readonly heightValue: number;
  private readonly frontText: string;
  private readonly backText: string;
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private revealed = false;
  private matched = false;

  constructor(scene: Phaser.Scene, x: number, y: number, options: WordCardOptions) {
    super(scene, x, y);
    this.widthValue = options.width ?? 170;
    this.heightValue = options.height ?? 210;
    this.frontText = options.frontText;
    this.backText = options.backText ?? '字';
    this.kind = options.kind ?? 'char';
    this.char = options.char;
    this.bg = scene.add.graphics();
    this.label = scene.add
      .text(0, 0, this.backText, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '64px',
        color: '#6b3a1f',
        align: 'center',
      })
      .setOrigin(0.5);
    this.add([this.bg, this.label]);
    this.setSize(this.widthValue, this.heightValue);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-this.widthValue / 2, -this.heightValue / 2, this.widthValue, this.heightValue),
      Phaser.Geom.Rectangle.Contains,
    );
    scene.add.existing(this);
    this.draw();
  }

  isRevealed(): boolean {
    return this.revealed;
  }

  isMatched(): boolean {
    return this.matched;
  }

  reveal(): void {
    if (this.matched || this.revealed) {
      return;
    }
    this.revealed = true;
    this.animateFlip(() => this.draw());
  }

  hide(): void {
    if (this.matched) {
      return;
    }
    this.revealed = false;
    this.animateFlip(() => this.draw());
  }

  markMatched(): void {
    this.matched = true;
    this.revealed = true;
    this.draw();
    this.scene.tweens.add({
      targets: this,
      scale: 1.06,
      duration: 130,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  private animateFlip(onMid: () => void): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.05,
      duration: 100,
      ease: 'Sine.easeIn',
      onComplete: () => {
        onMid();
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          duration: 100,
          ease: 'Sine.easeOut',
        });
      },
    });
  }

  private draw(): void {
    this.bg.clear();
    const fill = this.matched ? 0xd5ffc2 : this.revealed ? 0xffffff : 0xffe6a8;
    const stroke = this.matched ? 0x6ed35d : 0xffb347;
    this.bg.fillStyle(fill, 1);
    this.bg.fillRoundedRect(-this.widthValue / 2, -this.heightValue / 2, this.widthValue, this.heightValue, 24);
    this.bg.lineStyle(6, stroke, 1);
    this.bg.strokeRoundedRect(-this.widthValue / 2, -this.heightValue / 2, this.widthValue, this.heightValue, 24);
    this.label.setText(this.revealed || this.matched ? this.frontText : this.backText);
    this.label.setFontSize(this.kind === 'emoji' && (this.revealed || this.matched) ? 72 : 68);
    this.label.setColor(this.revealed || this.matched ? '#30233d' : '#9a5d20');
  }
}
