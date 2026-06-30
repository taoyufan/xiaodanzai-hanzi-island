import Phaser from 'phaser';
import { playerProfile } from '../data/player';
import { BigButton } from '../objects/BigButton';
import { bindPhoneForCloud, getCloudIdentityText } from '../systems/cloud';
import { getParentSummary } from '../systems/progress';
import { getTodayStudySeconds, loadSave } from '../systems/storage';

export class ParentScene extends Phaser.Scene {
  private syncText!: Phaser.GameObjects.Text;

  constructor() {
    super('ParentScene');
  }

  create(): void {
    const save = loadSave();
    const summary = getParentSummary(save);
    this.drawBackground();

    this.add
      .text(375, 72, playerProfile.parentCenterName, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '52px',
        color: '#ffffff',
        stroke: '#5f83d6',
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(375, 126, playerProfile.parentNote, {
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '22px',
        color: '#45617a',
      })
      .setOrigin(0.5);

    this.drawStats([
      [`${playerProfile.childName}今日学习`, this.formatSeconds(getTodayStudySeconds(save))],
      ['已学习汉字', `${summary.learnedCount} 个`],
      ['已掌握汉字', `${summary.masteredCount} 个`],
      ['总正确率', `${summary.totalAccuracy}%`],
    ]);

    this.add
      .text(74, 520, '易错汉字', this.sectionTitleStyle())
      .setOrigin(0, 0.5);
    const weakText = summary.weakChars.length
      ? summary.weakChars.map((item) => `${item.char}（${item.wrongCount} 次）`).join('  ')
      : '暂时没有易错字';
    this.add
      .text(74, 574, weakText, {
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '30px',
        color: '#4d3d52',
        wordWrap: { width: 610 },
        lineSpacing: 10,
      })
      .setOrigin(0, 0);

    this.add
      .text(74, 708, '最近通关记录', this.sectionTitleStyle())
      .setOrigin(0, 0.5);
    const recent = save.recentCompletions.length
      ? save.recentCompletions
          .slice(0, 6)
          .map((item) => {
            const date = new Date(item.completedAt);
            const time = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(
              date.getHours(),
            ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            return `${time}  ${item.title}  ${'★'.repeat(item.stars).padEnd(3, '☆')}  ${item.score} 分`;
          })
          .join('\n')
      : '还没有通关记录';

    this.add
      .text(74, 764, recent, {
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '26px',
        color: '#4d3d52',
        lineSpacing: 16,
        wordWrap: { width: 620 },
      })
      .setOrigin(0, 0);

    this.add
      .text(375, 1088, `${playerProfile.coinName}：${save.coins}    累计分数：${save.totalScore}`, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '28px',
        color: '#4d3d52',
      })
      .setOrigin(0.5);

    this.syncText = this.add
      .text(375, 1138, getCloudIdentityText(), {
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '23px',
        color: '#45617a',
      })
      .setOrigin(0.5);

    new BigButton(this, 375, 1188, '绑定手机号同步', () => this.handleBindPhone(), {
      width: 300,
      height: 62,
      fontSize: 25,
      fillColor: 0xfff1a8,
      strokeColor: 0xffb347,
    });

    new BigButton(this, 375, 1262, '返回首页', () => this.scene.start('HomeScene'), {
      fillColor: 0xb8f7ff,
      strokeColor: 0x36b9d6,
      textColor: '#125d72',
    });
  }

  private drawBackground(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0xd9efff, 0xd9efff, 0xf8e9ff, 0xf8e9ff, 1);
    g.fillRect(0, 0, 750, 1334);
    g.fillStyle(0xffffff, 0.8);
    g.fillRoundedRect(44, 150, 662, 920, 32);
    g.lineStyle(6, 0x8dbde8, 1);
    g.strokeRoundedRect(44, 150, 662, 920, 32);
  }

  private drawStats(items: Array<[string, string]>): void {
    items.forEach(([label, value], index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 215 + col * 320;
      const y = 244 + row * 142;
      const bg = this.add.graphics();
      bg.fillStyle(0xfff7d6, 1);
      bg.fillRoundedRect(x - 135, y - 55, 270, 110, 24);
      bg.lineStyle(4, 0xffc35b, 1);
      bg.strokeRoundedRect(x - 135, y - 55, 270, 110, 24);
      this.add
        .text(x, y - 20, label, {
          fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
          fontSize: '23px',
          color: '#6c4a1f',
        })
        .setOrigin(0.5);
      this.add
        .text(x, y + 22, value, {
          fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
          fontSize: '34px',
          color: '#2f4054',
        })
        .setOrigin(0.5);
    });
  }

  private sectionTitleStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
      fontSize: '32px',
      color: '#2f4054',
    };
  }

  private formatSeconds(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainSeconds = seconds % 60;
    if (minutes <= 0) {
      return `${remainSeconds} 秒`;
    }
    return `${minutes} 分 ${remainSeconds} 秒`;
  }

  private async handleBindPhone(): Promise<void> {
    this.syncText.setText('正在同步宝一一的学习记录...');
    try {
      const text = await bindPhoneForCloud();
      this.syncText.setText(text);
    } catch {
      this.syncText.setText('同步暂时没有连上，稍后再试');
    }
  }
}
