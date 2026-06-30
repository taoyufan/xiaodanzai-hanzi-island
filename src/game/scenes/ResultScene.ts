import Phaser from 'phaser';
import { getCharItems } from '../data/chars';
import { playerProfile } from '../data/player';
import { BigButton } from '../objects/BigButton';
import { EggHero } from '../objects/EggHero';
import { getLevel, getNextLevel, isLevelUnlocked } from '../systems/levelManager';
import { getTotalStars, loadSave } from '../systems/storage';
import { playCoinSound } from '../systems/sound';
import type { LevelConfig, LevelRunResult } from '../types';

export class ResultScene extends Phaser.Scene {
  private level!: LevelConfig;
  private result!: LevelRunResult;

  constructor() {
    super('ResultScene');
  }

  init(data: { levelId?: string; result?: LevelRunResult }): void {
    this.level = getLevel(data.levelId ?? 'body-1');
    this.result =
      data.result ??
      ({
        levelId: this.level.id,
        score: 0,
        stars: 0,
        coins: 0,
        accuracy: 0,
        correctCount: 0,
        wrongCount: 0,
        hintsUsed: 0,
        learnedChars: this.level.chars,
        isBoss: this.level.isBoss,
        completedAt: new Date().toISOString(),
      } satisfies LevelRunResult);
  }

  create(): void {
    this.drawBackground();
    const hero = new EggHero(this, 375, 250, loadSave().equippedCostumeId);
    hero.celebrate();

    this.add
      .text(375, 96, `${playerProfile.childName}完成啦`, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '54px',
        color: '#ffffff',
        stroke: '#ef7b45',
        strokeThickness: 9,
      })
      .setOrigin(0.5);

    this.add
      .text(375, 450, '★'.repeat(this.result.stars).padEnd(3, '☆'), {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '74px',
        color: '#ffb000',
        stroke: '#ffffff',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(375, 548, `本关得分：${this.result.score}\n正确率：${this.result.accuracy}%\n获得${playerProfile.coinName}：${this.result.coins}`, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '34px',
        color: '#4d3d52',
        align: 'center',
        lineSpacing: 16,
      })
      .setOrigin(0.5);

    const chars = getCharItems(this.result.learnedChars);
    this.add
      .text(375, 720, `${playerProfile.childName}本关认识的汉字`, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '32px',
        color: '#5d4267',
      })
      .setOrigin(0.5);

    this.drawLearnedChars(chars.map((item) => `${item.emoji} ${item.char}`));

    if (this.result.coins > 0) {
      playCoinSound();
    }

    const next = getNextLevel(this.level.id);
    let actionLocked = false;
    const runAction = (action: () => void) => {
      if (actionLocked) {
        return;
      }
      actionLocked = true;
      this.time.delayedCall(0, () => {
        action();
        this.time.delayedCall(300, () => {
          actionLocked = false;
        });
      });
    };
    const goNext = () => runAction(() => {
      if (!next) {
        this.scene.start('MapScene');
        return;
      }
      const latestSave = loadSave();
      if (!isLevelUnlocked(next, latestSave)) {
        const need = Math.max(0, next.unlockStarsRequired - getTotalStars(latestSave));
        this.showToast(`再收集 ${need} 颗${playerProfile.starName}解锁下一关`);
        return;
      }
      this.scene.start(next.isBoss ? 'BossScene' : 'GameScene', { levelId: next.id });
    });
    const replay = () => runAction(() => {
      this.scene.start(this.level.isBoss ? 'BossScene' : 'GameScene', { levelId: this.level.id });
    });
    const backToMap = () => runAction(() => this.scene.start('MapScene'));

    new BigButton(this, 375, 1006, '下一关', goNext, {
      disabled: !next,
    });
    new BigButton(this, 375, 1122, '再玩一次', replay, {
      fillColor: 0xb8f7ff,
      strokeColor: 0x36b9d6,
      textColor: '#125d72',
    });
    new BigButton(this, 375, 1238, '回到地图', backToMap, {
      fillColor: 0xe9ddff,
      strokeColor: 0x9b6bff,
      textColor: '#4d2c7c',
    });

    this.addButtonHitArea(375, 1006, 430, 126, goNext);
    this.addButtonHitArea(375, 1122, 430, 126, replay);
    this.addButtonHitArea(375, 1238, 430, 126, backToMap);
  }

  private drawBackground(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0xffd5ec, 0xffd5ec, 0xfff1c7, 0xfff1c7, 1);
    g.fillRect(0, 0, 750, 1334);
    g.fillStyle(0xffffff, 0.42);
    g.fillCircle(96, 180, 54);
    g.fillCircle(650, 292, 72);
    g.fillStyle(0xb8f7c6, 1);
    g.fillEllipse(375, 1260, 760, 180);
  }

  private drawLearnedChars(labels: string[]): void {
    labels.slice(0, 12).forEach((label, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const x = 138 + col * 158;
      const y = 794 + row * 70;
      const bg = this.add.graphics();
      bg.fillStyle(0xffffff, 0.9);
      bg.fillRoundedRect(x - 62, y - 30, 124, 60, 24);
      bg.lineStyle(3, 0xffb347, 1);
      bg.strokeRoundedRect(x - 62, y - 30, 124, 60, 24);
      this.add
        .text(x, y, label, {
          fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
          fontSize: '27px',
          color: '#3d2f4b',
        })
        .setOrigin(0.5);
    });
  }

  private showToast(text: string): void {
    const toast = this.add
      .text(375, 936, text, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '30px',
        color: '#ffffff',
        backgroundColor: '#5d4267cc',
        padding: { x: 24, y: 14 },
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: toast,
      y: 900,
      alpha: 0,
      duration: 1100,
      ease: 'Sine.easeOut',
      onComplete: () => toast.destroy(),
    });
  }

  private addButtonHitArea(x: number, y: number, width: number, height: number, onClick: () => void): void {
    this.add
      .rectangle(x, y, width, height, 0xffffff, 0.001)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', onClick);
  }
}
