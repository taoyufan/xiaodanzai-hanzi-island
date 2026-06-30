import Phaser from 'phaser';
import { levels, worlds } from '../data/levels';
import { playerProfile } from '../data/player';
import { BigButton } from '../objects/BigButton';
import { getLevelProgressText, getWorldLevels, isLevelUnlocked } from '../systems/levelManager';
import { getLevelStars, getTotalStars, loadSave } from '../systems/storage';

export class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene');
  }

  create(): void {
    const save = loadSave();
    this.drawBackground();

    this.add
      .text(375, 72, `${playerProfile.childName}的闯关地图`, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '50px',
        color: '#ffffff',
        stroke: '#2f75c8',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(375, 132, `${playerProfile.starName}：${getTotalStars(save)}  ${playerProfile.coinName}：${save.coins}`, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '30px',
        color: '#39506b',
        backgroundColor: '#ffffffaa',
        padding: { x: 18, y: 8 },
      })
      .setOrigin(0.5);

    worlds.forEach((world, index) => {
      const y = 274 + index * 318;
      this.drawWorld(world.id, world.title, world.subtitle, world.color, world.darkColor, y);
    });

    new BigButton(this, 375, 1242, '返回首页', () => this.scene.start('HomeScene'), {
      fillColor: 0xffffff,
      strokeColor: 0x6eb7ff,
      textColor: '#23639d',
      width: 300,
      height: 76,
      fontSize: 30,
    });
  }

  private drawBackground(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0x9fdcff, 0x9fdcff, 0xdbf7c4, 0xdbf7c4, 1);
    g.fillRect(0, 0, 750, 1334);
    g.lineStyle(16, 0xffffff, 0.35);
    this.drawSoftPath(g, [
      new Phaser.Math.Vector2(92, 250),
      new Phaser.Math.Vector2(310, 350),
      new Phaser.Math.Vector2(170, 610),
      new Phaser.Math.Vector2(512, 684),
      new Phaser.Math.Vector2(720, 730),
      new Phaser.Math.Vector2(578, 978),
      new Phaser.Math.Vector2(190, 1078),
    ]);
  }

  private drawSoftPath(graphics: Phaser.GameObjects.Graphics, points: Phaser.Math.Vector2[]): void {
    for (let i = 0; i < points.length - 1; i += 1) {
      const start = points[i];
      const end = points[i + 1];
      graphics.lineBetween(start.x, start.y, end.x, end.y);
    }
  }

  private drawWorld(
    worldId: string,
    title: string,
    subtitle: string,
    color: number,
    darkColor: number,
    y: number,
  ): void {
    const save = loadSave();
    const g = this.add.graphics();
    g.fillStyle(color, 0.92);
    g.fillRoundedRect(42, y - 92, 666, 250, 32);
    g.lineStyle(6, darkColor, 1);
    g.strokeRoundedRect(42, y - 92, 666, 250, 32);

    this.add
      .text(78, y - 58, title, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '34px',
        color: '#ffffff',
        stroke: '#00000055',
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5);
    this.add
      .text(80, y - 14, subtitle, {
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '23px',
        color: '#493651',
      })
      .setOrigin(0, 0.5);

    const worldLevels = getWorldLevels(worldId);
    worldLevels.forEach((level, index) => {
      const x = 106 + index * 134;
      const nodeY = y + 86;
      const unlocked = isLevelUnlocked(level, save);
      const stars = getLevelStars(level.id, save);
      const node = this.add.container(x, nodeY);
      const nodeBg = this.add.graphics();
      nodeBg.fillStyle(unlocked ? 0xffffff : 0xcbd5e1, 1);
      nodeBg.fillCircle(0, 0, 48);
      nodeBg.lineStyle(6, stars > 0 ? 0xffc531 : unlocked ? darkColor : 0x94a3b8, 1);
      nodeBg.strokeCircle(0, 0, 48);
      const label = this.add
        .text(0, -7, unlocked ? `${index + 1}` : '锁', {
          fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
          fontSize: unlocked ? '34px' : '24px',
          color: unlocked ? '#47345c' : '#64748b',
        })
        .setOrigin(0.5);
      const starLabel = this.add
        .text(0, 56, stars > 0 ? '★'.repeat(stars) : getLevelProgressText(level, save), {
          fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
          fontSize: stars > 0 ? '24px' : '17px',
          color: stars > 0 ? '#ffb000' : '#5a4b62',
        })
        .setOrigin(0.5);
      node.add([nodeBg, label, starLabel]);
      node.setSize(100, 130);
      node.setInteractive(new Phaser.Geom.Rectangle(-50, -50, 100, 130), Phaser.Geom.Rectangle.Contains);
      const openLevel = () => {
        if (!unlocked) {
          this.showToast(getLevelProgressText(level, save));
          return;
        }
        this.scene.start(level.isBoss ? 'BossScene' : 'GameScene', { levelId: level.id });
      };
      node.on('pointerup', openLevel);

      const hitZone = this.add.zone(x, nodeY, 118, 150).setOrigin(0.5).setInteractive();
      hitZone.on('pointerup', openLevel);
    });
  }

  private showToast(text: string): void {
    const toast = this.add
      .text(375, 1148, text, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '30px',
        color: '#ffffff',
        backgroundColor: '#5d4267cc',
        padding: { x: 24, y: 14 },
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: toast,
      y: 1108,
      alpha: 0,
      duration: 1100,
      ease: 'Sine.easeOut',
      onComplete: () => toast.destroy(),
    });
  }
}
