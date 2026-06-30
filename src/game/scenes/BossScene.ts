import Phaser from 'phaser';
import { getCharItem, getCharItems } from '../data/chars';
import { playerProfile } from '../data/player';
import { BigButton } from '../objects/BigButton';
import { BossMonster } from '../objects/BossMonster';
import { EggHero } from '../objects/EggHero';
import { getLevel } from '../systems/levelManager';
import { markCharSeen, recordCharAnswer } from '../systems/progress';
import { buildLevelResult, createScoreState, scoreCorrect, scoreWrong, useHint, type ScoreState } from '../systems/score';
import { addStudySeconds, loadSave, recordLevelCompletion } from '../systems/storage';
import { playCorrectSound, playWinSound, playWrongSound } from '../systems/sound';
import { speak, speakAndWait, speakCharPrompt } from '../systems/speech';
import type { CharItem, LevelConfig } from '../types';

type BossOption = Phaser.GameObjects.Container & { optionChar?: string };

export class BossScene extends Phaser.Scene {
  private level!: LevelConfig;
  private scoreState!: ScoreState;
  private boss!: BossMonster;
  private hero!: EggHero;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private contentGroup!: Phaser.GameObjects.Group;
  private questions: CharItem[] = [];
  private questionIndex = 0;
  private health = 5;
  private currentItem!: CharItem;
  private questionStartedAt = Date.now();
  private hadWrongAttempt = false;
  private usedHint = false;
  private answerLocked = false;
  private learnedChars: string[] = [];
  private startedAt = Date.now();

  constructor() {
    super('BossScene');
  }

  init(data: { levelId?: string }): void {
    this.level = getLevel(data.levelId ?? 'body-5');
    this.resetRunState();
  }

  create(): void {
    this.startedAt = Date.now();
    this.scoreState = createScoreState();
    this.health = 5;
    this.questions = this.buildQuestions();
    this.drawBackground();
    this.createTopBar();
    this.contentGroup = this.add.group();
    this.boss = new BossMonster(this, 375, 340);
    this.hero = new EggHero(this, 132, 550, loadSave().equippedCostumeId);
    this.feedbackText = this.add
      .text(375, 1136, '', {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '34px',
        color: '#6b3a1f',
        align: 'center',
      })
      .setOrigin(0.5);
    this.showQuestion();
  }

  private resetRunState(): void {
    this.questions = [];
    this.questionIndex = 0;
    this.health = 5;
    this.questionStartedAt = Date.now();
    this.hadWrongAttempt = false;
    this.usedHint = false;
    this.answerLocked = false;
    this.learnedChars = [];
  }

  private drawBackground(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0xf3d0ff, 0xf3d0ff, 0xfff1c7, 0xfff1c7, 1);
    g.fillRect(0, 0, 750, 1334);
    g.fillStyle(0xffffff, 0.42);
    g.fillCircle(105, 205, 58);
    g.fillCircle(650, 184, 48);
    g.fillStyle(0xb8f7c6, 1);
    g.fillEllipse(375, 1250, 760, 180);
  }

  private createTopBar(): void {
    const bar = this.add.graphics();
    bar.fillStyle(0xffffff, 0.86);
    bar.fillRoundedRect(22, 24, 706, 120, 28);

    this.add
      .text(375, 42, this.level.title, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '28px',
        color: '#57326e',
      })
      .setOrigin(0.5, 0);

    this.scoreText = this.add.text(58, 92, '分数 0', this.topTextStyle());
    this.comboText = this.add.text(236, 92, '连击 0', this.topTextStyle());
    this.hpText = this.add.text(420, 92, 'Boss 5/5', this.topTextStyle());
    new BigButton(this, 650, 90, '地图', () => this.scene.start('MapScene'), {
      width: 112,
      height: 56,
      fontSize: 24,
      fillColor: 0xe8f5ff,
      strokeColor: 0x65aee8,
      textColor: '#23639d',
    });
  }

  private topTextStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
      fontSize: '24px',
      color: '#57326e',
    };
  }

  private buildQuestions(): CharItem[] {
    const items = Phaser.Utils.Array.Shuffle(getCharItems(this.level.chars));
    return items.slice(0, this.level.questionCount);
  }

  private showQuestion(): void {
    this.answerLocked = false;
    this.hadWrongAttempt = false;
    this.usedHint = false;
    this.currentItem = this.questions[this.questionIndex % this.questions.length];
    if (!this.currentItem) {
      this.finishLevel();
      return;
    }
    this.learnedChars.push(this.currentItem.char);
    markCharSeen(this.currentItem.char);
    this.questionStartedAt = Date.now();
    this.clearContent();
    this.updateTopBar();

    this.promptText = this.add
      .text(375, 584, `${playerProfile.childName}，找到正确的字，帮${playerProfile.heroName}发出${playerProfile.starName}：${this.currentItem.char}`, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '34px',
        color: '#4d3d52',
        align: 'center',
        wordWrap: { width: 660 },
      })
      .setOrigin(0.5);
    this.contentGroup.add(this.promptText);
    speakCharPrompt(this.currentItem);

    const speakButton = new BigButton(this, 250, 660, '读一读', () => speakCharPrompt(this.currentItem), {
      width: 210,
      height: 64,
      fontSize: 26,
      fillColor: 0xe9ddff,
      strokeColor: 0x9b6bff,
      textColor: '#4d2c7c',
    });
    const hintButton = new BigButton(this, 500, 660, '提示', () => this.handleHint(), {
      width: 210,
      height: 64,
      fontSize: 26,
      fillColor: 0xfff1a8,
      strokeColor: 0xffb347,
    });
    this.contentGroup.addMultiple([speakButton, hintButton]);

    this.buildOptions(this.currentItem).forEach((char, index) => {
      const button = this.createOption(164 + index * 211, 860, char);
      this.contentGroup.add(button);
    });
  }

  private buildOptions(item: CharItem): string[] {
    const confusers = item.confusers.filter((char) => char !== item.char && char.length === 1);
    const fallback = this.level.chars.filter((char) => char !== item.char);
    return Phaser.Utils.Array.Shuffle([item.char, ...Phaser.Utils.Array.Shuffle([...confusers, ...fallback]).slice(0, 2)]);
  }

  private createOption(x: number, y: number, char: string): BossOption {
    const container = this.add.container(x, y) as BossOption;
    container.optionChar = char;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(-82, -74, 164, 148, 26);
    g.lineStyle(6, 0x9b6bff, 1);
    g.strokeRoundedRect(-82, -74, 164, 148, 26);
    const text = this.add
      .text(0, 0, char, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '80px',
        color: '#30233d',
      })
      .setOrigin(0.5);
    container.add([g, text]);
    container.setSize(164, 148);
    container.setInteractive(new Phaser.Geom.Rectangle(-82, -74, 164, 148), Phaser.Geom.Rectangle.Contains);
    container.on('pointerup', () => this.handleChoice(char, container));
    const hitZone = this.add.zone(x, y, 190, 172).setOrigin(0.5).setInteractive();
    hitZone.on('pointerup', () => this.handleChoice(char, container));
    this.contentGroup.add(hitZone);
    return container;
  }

  private handleHint(): void {
    if (this.usedHint) {
      speak(this.currentItem.sentence);
      return;
    }
    this.usedHint = true;
    useHint(this.scoreState);
    this.updateTopBar();
    speak(`${this.currentItem.char}，${this.currentItem.words[0]}的${this.currentItem.char}。${this.currentItem.sentence}`);
    this.feedbackText.setText(`${playerProfile.childName}的小提示来啦，慢慢找`);
  }

  private handleChoice(selectedChar: string, option: BossOption): void {
    if (this.answerLocked) {
      return;
    }

    if (selectedChar === this.currentItem.char) {
      this.answerLocked = true;
      recordCharAnswer(this.currentItem.char, true);
      const gain = scoreCorrect(this.scoreState, {
        questionStartedAt: this.questionStartedAt,
        usedHint: this.usedHint,
        hadWrongAttempt: this.hadWrongAttempt,
      });
      this.health -= 1;
      this.boss.setHealth(this.health);
      this.boss.takeHit();
      this.hero.happyJump();
      this.updateTopBar();
      playCorrectSound();
      const praiseText = `${playerProfile.childName}太棒啦，错字怪变小啦`;
      this.feedbackText.setText(`${playerProfile.childName}太棒啦！Boss 少 1 点活力  ${gain.messages.join('  ')}`);
      this.tweens.add({
        targets: option,
        scale: 1.08,
        duration: 120,
        yoyo: true,
      });
      this.waitForSpeechThen(praiseText, 1400, () => this.nextQuestion());
      return;
    }

    this.hadWrongAttempt = true;
    recordCharAnswer(this.currentItem.char, false);
    scoreWrong(this.scoreState);
    this.updateTopBar();
    playWrongSound();
    speak(`${playerProfile.childName}，差一点点哦，再试一次`);
    this.feedbackText.setText(`${playerProfile.childName}，差一点点哦，再试一次`);
    this.hero.sadShake();
    option.setAlpha(0.5);
  }

  private nextQuestion(): void {
    if (this.health <= 0) {
      this.finishLevel();
      return;
    }
    this.questionIndex += 1;
    this.showQuestion();
  }

  private updateTopBar(): void {
    this.scoreText.setText(`分数 ${this.scoreState.score}`);
    this.comboText.setText(`连击 ${this.scoreState.streak}`);
    this.hpText.setText(`Boss ${this.health}/5`);
  }

  private clearContent(): void {
    if (this.contentGroup) {
      this.contentGroup.clear(true, true);
    }
    this.feedbackText?.setText('');
  }

  private waitForSpeechThen(text: string, minMs: number, next: () => void): void {
    const minDelay = new Promise<void>((resolve) => {
      this.time.delayedCall(minMs, () => resolve());
    });
    void Promise.all([speakAndWait(text), minDelay]).then(() => next());
  }

  private finishLevel(): void {
    const result = buildLevelResult(this.level.id, this.scoreState, this.learnedChars, true);
    recordLevelCompletion(result);
    addStudySeconds((Date.now() - this.startedAt) / 1000);
    playWinSound();
    this.boss.defeat();
    this.hero.celebrate();
    this.time.delayedCall(850, () => {
      this.scene.start('ResultScene', { levelId: this.level.id, result });
    });
  }
}
