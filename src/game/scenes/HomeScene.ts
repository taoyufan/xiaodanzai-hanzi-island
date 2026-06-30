import Phaser from 'phaser';
import { playerProfile } from '../data/player';
import { BigButton } from '../objects/BigButton';
import { EggHero } from '../objects/EggHero';
import { loadSave } from '../systems/storage';
import { speak } from '../systems/speech';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('HomeScene');
  }

  create(): void {
    const save = loadSave();
    this.drawBackground();

    this.add
      .text(375, 120, playerProfile.islandName, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '58px',
        color: '#ffffff',
        stroke: '#ef7b45',
        strokeThickness: 10,
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(375, 198, playerProfile.homeQuestion, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '30px',
        color: '#5d4267',
      })
      .setOrigin(0.5);

    const hero = new EggHero(this, 375, 440, save.equippedCostumeId);
    this.tweens.add({
      targets: hero,
      y: 420,
      duration: 1150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add
      .text(375, 592, playerProfile.missionLine, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '28px',
        color: '#6b3a1f',
        backgroundColor: '#fff1a8cc',
        padding: { x: 18, y: 9 },
      })
      .setOrigin(0.5);

    new BigButton(this, 375, 720, `${playerProfile.childName}开始冒险`, () => {
      speak(`${playerProfile.heroName}陪${playerProfile.childName}出发啦`);
      this.scene.start('MapScene');
    });
    new BigButton(this, 375, 842, `${playerProfile.shortName}的装扮间`, () => this.scene.start('AvatarScene'), {
      fillColor: 0xb8f7ff,
      strokeColor: 0x36b9d6,
      textColor: '#125d72',
    });
    new BigButton(this, 375, 964, playerProfile.parentCenterName, () => this.showParentConfirm(), {
      fillColor: 0xe9ddff,
      strokeColor: 0x9b6bff,
      textColor: '#4d2c7c',
    });

    this.add
      .text(375, 1246, playerProfile.islandPromise, {
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '22px',
        color: '#6a5b73',
      })
      .setOrigin(0.5);
  }

  private drawBackground(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0x8ad7ff, 0x8ad7ff, 0xffd5ec, 0xffd5ec, 1);
    g.fillRect(0, 0, 750, 1334);
    g.fillStyle(0xffffff, 0.42);
    g.fillCircle(96, 180, 54);
    g.fillCircle(650, 292, 72);
    g.fillCircle(120, 1050, 86);
    g.fillCircle(640, 1120, 58);
    g.fillStyle(0xfff1a8, 0.82);
    g.fillRoundedRect(70, 1110, 610, 76, 38);
    g.fillStyle(0x8de2a9, 0.9);
    g.fillEllipse(375, 1244, 720, 190);
  }

  private showParentConfirm(): void {
    const shade = this.add.rectangle(375, 667, 750, 1334, 0x000000, 0.35).setInteractive();
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 1);
    panel.fillRoundedRect(85, 470, 580, 360, 30);
    panel.lineStyle(6, 0x9b6bff, 1);
    panel.strokeRoundedRect(85, 470, 580, 360, 30);
    const title = this.add
      .text(375, 548, `进入${playerProfile.parentCenterName}？`, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '40px',
        color: '#4d2c7c',
      })
      .setOrigin(0.5);
    const body = this.add
      .text(375, 622, `${playerProfile.parentNote}\n确认后进入${playerProfile.parentCenterName}。`, {
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '28px',
        color: '#5d4267',
        align: 'center',
        lineSpacing: 10,
      })
      .setOrigin(0.5);
    const cancel = new BigButton(this, 235, 746, '返回', () => cleanup(), {
      width: 220,
      height: 76,
      fontSize: 30,
      fillColor: 0xf0f7ff,
      strokeColor: 0x8dbde8,
      textColor: '#2e5e86',
    });
    const enter = new BigButton(this, 515, 746, '确认', () => {
      cleanup();
      this.scene.start('ParentScene');
    }, {
      width: 220,
      height: 76,
      fontSize: 30,
      fillColor: 0xe9ddff,
      strokeColor: 0x9b6bff,
      textColor: '#4d2c7c',
    });

    const cleanup = () => {
      shade.destroy();
      panel.destroy();
      title.destroy();
      body.destroy();
      cancel.destroy();
      enter.destroy();
    };
  }
}
