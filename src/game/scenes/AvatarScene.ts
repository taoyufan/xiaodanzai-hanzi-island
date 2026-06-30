import Phaser from 'phaser';
import { playerProfile } from '../data/player';
import { rewards } from '../data/rewards';
import { BigButton } from '../objects/BigButton';
import { EggHero } from '../objects/EggHero';
import { equipCostume, loadSave, unlockCostume } from '../systems/storage';
import { playCoinSound, playCorrectSound, playWrongSound } from '../systems/sound';
import type { SaveData } from '../types';

export class AvatarScene extends Phaser.Scene {
  private save!: SaveData;
  private hero!: EggHero;
  private coinText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;

  constructor() {
    super('AvatarScene');
  }

  create(): void {
    this.save = loadSave();
    this.drawBackground();

    this.add
      .text(375, 76, `${playerProfile.childName}的装扮间`, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#7c4ac7',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.coinText = this.add
      .text(375, 138, `${playerProfile.coinName}：${this.save.coins}`, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '34px',
        color: '#7b4f00',
        backgroundColor: '#fff0a8',
        padding: { x: 22, y: 10 },
      })
      .setOrigin(0.5);

    this.hero = new EggHero(this, 375, 340, this.save.equippedCostumeId);
    this.feedbackText = this.add
      .text(375, 514, `给${playerProfile.heroName}换上喜欢的装扮吧`, {
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '28px',
        color: '#5d4267',
      })
      .setOrigin(0.5);

    this.drawRewardGrid();

    new BigButton(this, 375, 1242, '返回首页', () => this.scene.start('HomeScene'), {
      fillColor: 0xb8f7ff,
      strokeColor: 0x36b9d6,
      textColor: '#125d72',
    });
  }

  private drawBackground(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0xcaa8ff, 0xcaa8ff, 0xffd5ec, 0xffd5ec, 1);
    g.fillRect(0, 0, 750, 1334);
    g.fillStyle(0xffffff, 0.35);
    g.fillCircle(95, 220, 60);
    g.fillCircle(650, 170, 46);
    g.fillCircle(650, 1040, 78);
  }

  private drawRewardGrid(): void {
    const startX = 200;
    const startY = 680;
    const gapX = 350;
    const gapY = 210;

    rewards.forEach((reward, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * gapX;
      const y = startY + row * gapY;
      const unlocked = this.save.unlockedCostumeIds.includes(reward.id);
      const equipped = this.save.equippedCostumeId === reward.id;
      const canBuy = this.save.coins >= reward.cost;

      const card = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(unlocked ? 0xffffff : 0xf2eef8, 1);
      bg.fillRoundedRect(-145, -84, 290, 168, 24);
      bg.lineStyle(6, equipped ? 0xffc531 : unlocked ? 0x77d67a : canBuy ? 0xffb347 : 0xa9a3b8, 1);
      bg.strokeRoundedRect(-145, -84, 290, 168, 24);
      bg.fillStyle(reward.color, 1);
      bg.fillCircle(-92, -24, 30);
      const name = this.add
        .text(-42, -44, reward.name, {
          fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
          fontSize: '28px',
          color: '#38294a',
        })
        .setOrigin(0, 0.5);
      const status = this.add
          .text(-42, 18, equipped ? '穿戴中' : unlocked ? '点击穿戴' : `${reward.cost} ${playerProfile.coinName}解锁`, {
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          fontSize: '23px',
          color: unlocked || canBuy ? '#4d7b22' : '#8a7698',
        })
        .setOrigin(0, 0.5);
      card.add([bg, name, status]);
      card.setSize(290, 168);
      card.setInteractive(new Phaser.Geom.Rectangle(-145, -84, 290, 168), Phaser.Geom.Rectangle.Contains);
      card.on('pointerup', () => this.handleRewardClick(reward.id, reward.cost, reward.name));
    });

    new BigButton(this, 375, 554, '卸下装扮', () => {
      this.save = equipCostume(null);
      this.hero.setCostume(null);
      this.feedbackText.setText(`${playerProfile.heroName}换回原本样子啦`);
      playCorrectSound();
      this.scene.restart();
    }, {
      width: 270,
      height: 70,
      fontSize: 28,
      fillColor: 0xffffff,
      strokeColor: 0xffb347,
    });
  }

  private handleRewardClick(costumeId: string, cost: number, name: string): void {
    if (this.save.unlockedCostumeIds.includes(costumeId)) {
      this.save = equipCostume(costumeId);
      this.hero.setCostume(costumeId);
      this.feedbackText.setText(`已穿戴：${name}`);
      playCorrectSound();
      this.scene.restart();
      return;
    }

    const result = unlockCostume(costumeId, cost);
    this.save = result.save;
    if (result.ok) {
      playCoinSound();
      this.save = equipCostume(costumeId);
      this.feedbackText.setText(`解锁成功：${name}`);
      this.scene.restart();
    } else {
      playWrongSound();
      this.feedbackText.setText(`${playerProfile.coinName}还不够哦，继续闯关收集吧`);
    }
    this.coinText.setText(`${playerProfile.coinName}：${this.save.coins}`);
  }
}
