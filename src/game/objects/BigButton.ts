import Phaser from 'phaser';

type BigButtonOptions = {
  width?: number;
  height?: number;
  fillColor?: number;
  strokeColor?: number;
  textColor?: string;
  fontSize?: number;
  disabled?: boolean;
};

export class BigButton extends Phaser.GameObjects.Container {
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private readonly hitZone: Phaser.GameObjects.Zone;
  private readonly buttonWidth: number;
  private readonly buttonHeight: number;
  private readonly fillColor: number;
  private readonly strokeColor: number;
  private disabled: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    options: BigButtonOptions = {},
  ) {
    super(scene, x, y);
    this.buttonWidth = options.width ?? 360;
    this.buttonHeight = options.height ?? 92;
    this.fillColor = options.fillColor ?? 0xfff1a8;
    this.strokeColor = options.strokeColor ?? 0xff9f43;
    this.disabled = options.disabled ?? false;

    this.bg = scene.add.graphics();
    this.label = scene.add
      .text(0, 0, text, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: `${options.fontSize ?? 34}px`,
        color: options.textColor ?? '#703900',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add([this.bg, this.label]);
    this.setSize(this.buttonWidth, this.buttonHeight);
    scene.add.existing(this);
    this.hitZone = scene.add.zone(x, y, this.buttonWidth + 28, this.buttonHeight + 28).setOrigin(0.5).setInteractive();

    this.hitZone.on('pointerover', () => {
      if (!this.disabled) {
        this.setScale(1.03);
      }
    });
    this.hitZone.on('pointerout', () => {
      this.setScale(1);
    });
    this.hitZone.on('pointerdown', () => {
      if (!this.disabled) {
        this.setScale(0.96);
      }
    });
    this.hitZone.on('pointerup', () => {
      this.setScale(1);
      if (!this.disabled) {
        this.scene.time.delayedCall(0, onClick);
      }
    });

    this.redraw();
  }

  setLabel(text: string): this {
    this.label.setText(text);
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    if (this.hitZone.input) {
      this.hitZone.input.enabled = !disabled;
    }
    this.setAlpha(disabled ? 0.55 : 1);
    this.redraw();
    return this;
  }

  destroy(fromScene?: boolean): void {
    if (this.hitZone.active) {
      this.hitZone.destroy(fromScene);
    }
    super.destroy(fromScene);
  }

  private redraw(): void {
    this.bg.clear();
    const fill = this.disabled ? 0xcbd5e1 : this.fillColor;
    const stroke = this.disabled ? 0x94a3b8 : this.strokeColor;
    this.bg.fillStyle(fill, 1);
    this.bg.fillRoundedRect(-this.buttonWidth / 2, -this.buttonHeight / 2, this.buttonWidth, this.buttonHeight, 28);
    this.bg.lineStyle(6, stroke, 1);
    this.bg.strokeRoundedRect(-this.buttonWidth / 2, -this.buttonHeight / 2, this.buttonWidth, this.buttonHeight, 28);
  }
}
