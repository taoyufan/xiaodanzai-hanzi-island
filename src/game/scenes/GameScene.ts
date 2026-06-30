import Phaser from 'phaser';
import { getCharItem, getCharItems } from '../data/chars';
import { playerProfile } from '../data/player';
import { BigButton } from '../objects/BigButton';
import { EggHero } from '../objects/EggHero';
import { WordCard } from '../objects/WordCard';
import { getLevel } from '../systems/levelManager';
import { markCharSeen, recordCharAnswer } from '../systems/progress';
import { buildLevelResult, createScoreState, scoreCorrect, scoreWrong, useHint, type ScoreState } from '../systems/score';
import { addStudySeconds, loadSave, recordLevelCompletion } from '../systems/storage';
import { playCorrectSound, playWinSound, playWrongSound } from '../systems/sound';
import { speak, speakAndWait, speakCharPrompt } from '../systems/speech';
import type { CharItem, LevelConfig } from '../types';

type OptionNode = Phaser.GameObjects.Container & { optionChar?: string };

export class GameScene extends Phaser.Scene {
  private level!: LevelConfig;
  private scoreState!: ScoreState;
  private hero!: EggHero;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private contentGroup!: Phaser.GameObjects.Group;
  private questions: CharItem[] = [];
  private questionIndex = 0;
  private currentItem!: CharItem;
  private questionStartedAt = Date.now();
  private hadWrongAttempt = false;
  private usedHint = false;
  private answerLocked = false;
  private learnedChars: string[] = [];
  private startedAt = Date.now();
  private memoryFirst: WordCard | null = null;
  private memorySecond: WordCard | null = null;
  private matchedPairs = 0;

  constructor() {
    super('GameScene');
  }

  init(data: { levelId?: string }): void {
    this.level = getLevel(data.levelId ?? 'body-1');
    this.resetRunState();
  }

  create(): void {
    if (this.level.isBoss) {
      this.scene.start('BossScene', { levelId: this.level.id });
      return;
    }

    this.startedAt = Date.now();
    this.scoreState = createScoreState();
    this.drawBackground();
    this.createTopBar();
    this.contentGroup = this.add.group();
    this.hero = new EggHero(this, 375, 430, loadSave().equippedCostumeId);
    this.feedbackText = this.add
      .text(375, 1112, '', {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '34px',
        color: '#6b3a1f',
        align: 'center',
      })
      .setOrigin(0.5);

    if (this.level.mode === 'memory_match') {
      this.startMemoryMatch();
    } else {
      this.questions = this.buildQuestions();
      this.showQuestion();
    }
  }

  private resetRunState(): void {
    this.questions = [];
    this.questionIndex = 0;
    this.questionStartedAt = Date.now();
    this.hadWrongAttempt = false;
    this.usedHint = false;
    this.answerLocked = false;
    this.learnedChars = [];
    this.memoryFirst = null;
    this.memorySecond = null;
    this.matchedPairs = 0;
  }

  private drawBackground(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0xb9ecff, 0xb9ecff, 0xfff1c7, 0xfff1c7, 1);
    g.fillRect(0, 0, 750, 1334);
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(92, 190, 54);
    g.fillCircle(646, 258, 68);
    g.fillStyle(0xb8f7c6, 1);
    g.fillEllipse(375, 1250, 760, 180);
  }

  private createTopBar(): void {
    const bar = this.add.graphics();
    bar.fillStyle(0xffffff, 0.82);
    bar.fillRoundedRect(22, 24, 706, 120, 28);

    this.add
      .text(375, 42, this.level.title, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '28px',
        color: '#39506b',
      })
      .setOrigin(0.5, 0);

    this.scoreText = this.add.text(58, 92, '分数 0', this.topTextStyle());
    this.comboText = this.add.text(250, 92, '连击 0', this.topTextStyle());
    this.progressText = this.add.text(454, 92, '0/0', this.topTextStyle());

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
      color: '#39506b',
    };
  }

  private buildQuestions(): CharItem[] {
    const items = getCharItems(this.level.chars);
    const shuffled = Phaser.Utils.Array.Shuffle([...items]);
    const questions: CharItem[] = [];
    for (let i = 0; i < this.level.questionCount; i += 1) {
      questions.push(shuffled[i % shuffled.length]);
    }
    return Phaser.Utils.Array.Shuffle(questions);
  }

  private showQuestion(): void {
    this.answerLocked = false;
    this.hadWrongAttempt = false;
    this.usedHint = false;
    this.currentItem = this.questions[this.questionIndex];
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
      .text(
        375,
        190,
        this.level.mode === 'listen_jump'
          ? `${playerProfile.childName}，请找到这个字：${this.currentItem.char}`
          : `${playerProfile.childName}，看图找一找对应的汉字`,
        {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '40px',
        color: '#4d3d52',
        align: 'center',
        wordWrap: { width: 650 },
      })
      .setOrigin(0.5);
    this.contentGroup.add(this.promptText);

    if (this.level.mode === 'listen_jump') {
      speakCharPrompt(this.currentItem);
      this.renderListenJump();
    } else {
      this.renderImageChoice();
    }
  }

  private renderListenJump(): void {
    const speakButton = new BigButton(this, 250, 270, '读一读', () => speakCharPrompt(this.currentItem), {
      width: 210,
      height: 64,
      fontSize: 26,
      fillColor: 0xe9ddff,
      strokeColor: 0x9b6bff,
      textColor: '#4d2c7c',
    });
    const hintButton = new BigButton(this, 500, 270, '提示', () => this.handleHint(), {
      width: 210,
      height: 64,
      fontSize: 26,
      fillColor: 0xfff1a8,
      strokeColor: 0xffb347,
    });
    this.contentGroup.addMultiple([speakButton, hintButton]);

    const optionChars = this.buildOptions(this.currentItem);
    optionChars.forEach((char, index) => {
      const x = 154 + index * 221;
      const y = 760 + (index % 2) * 24;
      const island = this.createIslandOption(x, y, char);
      this.contentGroup.add(island);
    });
  }

  private renderImageChoice(): void {
    const item = this.currentItem;
    const emojiBg = this.add.graphics();
    emojiBg.fillStyle(0xffffff, 0.88);
    emojiBg.fillRoundedRect(235, 245, 280, 230, 36);
    emojiBg.lineStyle(6, 0xffb347, 1);
    emojiBg.strokeRoundedRect(235, 245, 280, 230, 36);
    const emoji = this.add
      .text(375, 360, item.emoji, {
        fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif',
        fontSize: '106px',
      })
      .setOrigin(0.5);
    const meaning = this.add
      .text(375, 510, item.meaning, {
        fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '30px',
        color: '#5d4267',
      })
      .setOrigin(0.5);
    const hintButton = new BigButton(this, 375, 592, '听提示', () => this.handleHint(), {
      width: 230,
      height: 64,
      fontSize: 26,
      fillColor: 0xfff1a8,
      strokeColor: 0xffb347,
    });
    this.contentGroup.addMultiple([emojiBg, emoji, meaning, hintButton]);

    const optionChars = this.buildOptions(item);
    optionChars.forEach((char, index) => {
      const button = this.createWordOption(164 + index * 211, 815, char);
      this.contentGroup.add(button);
    });
  }

  private buildOptions(item: CharItem): string[] {
    const pool = item.confusers.filter((char) => char !== item.char && char.length === 1);
    const fallback = this.level.chars.filter((char) => char !== item.char);
    const selected = Phaser.Utils.Array.Shuffle([...pool, ...fallback]).slice(0, 2);
    return Phaser.Utils.Array.Shuffle([item.char, ...selected]);
  }

  private createIslandOption(x: number, y: number, char: string): OptionNode {
    const container = this.add.container(x, y) as OptionNode;
    container.optionChar = char;
    const g = this.add.graphics();
    g.fillStyle(0x79d889, 1);
    g.fillEllipse(0, 44, 172, 54);
    g.fillStyle(0xfff3c4, 1);
    g.fillEllipse(0, 18, 156, 74);
    g.lineStyle(5, 0x64b56d, 1);
    g.strokeEllipse(0, 18, 156, 74);
    const text = this.add
      .text(0, -6, char, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '72px',
        color: '#30233d',
      })
      .setOrigin(0.5);
    container.add([g, text]);
    container.setSize(180, 130);
    container.setInteractive(new Phaser.Geom.Rectangle(-90, -45, 180, 130), Phaser.Geom.Rectangle.Contains);
    container.on('pointerup', () => this.handleChoice(char, container));
    const hitZone = this.add.zone(x, y + 10, 214, 170).setOrigin(0.5).setInteractive();
    hitZone.on('pointerup', () => this.handleChoice(char, container));
    this.contentGroup.add(hitZone);
    return container;
  }

  private createWordOption(x: number, y: number, char: string): OptionNode {
    const container = this.add.container(x, y) as OptionNode;
    container.optionChar = char;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(-82, -74, 164, 148, 26);
    g.lineStyle(6, 0x65aee8, 1);
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
    this.feedbackText.setText(`${playerProfile.childName}的小提示来啦，仔细看一看`);
  }

  private handleChoice(selectedChar: string, option: OptionNode): void {
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
      this.updateTopBar();
      playCorrectSound();
      const praiseText = `${playerProfile.childName}太棒啦，你答对啦`;
      this.feedbackText.setText(`${playerProfile.childName}太棒啦！${gain.messages.join('  ')}`);
      this.hero.happyJump();
      this.tweens.add({
        targets: this.hero,
        x: option.x,
        y: Math.min(option.y - 160, 650),
        duration: 380,
        yoyo: true,
        ease: 'Sine.easeInOut',
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
    this.questionIndex += 1;
    if (this.questionIndex >= this.questions.length) {
      this.finishLevel();
      return;
    }
    this.showQuestion();
  }

  private startMemoryMatch(): void {
    this.clearContent();
    this.hero.setPosition(375, 272);
    this.progressText.setText('0/3');

    const title = this.add
      .text(375, 178, `${playerProfile.childName}，翻开两张卡，帮汉字找到图片朋友`, {
        fontFamily: 'Arial Rounded MT Bold, PingFang SC, Microsoft YaHei, sans-serif',
        fontSize: '34px',
        color: '#4d3d52',
        align: 'center',
        wordWrap: { width: 650 },
      })
      .setOrigin(0.5);
    this.contentGroup.add(title);

    const items = getCharItems(this.level.chars.slice(0, 3));
    items.forEach((item) => {
      this.learnedChars.push(item.char);
      markCharSeen(item.char);
    });

    const cardsData = Phaser.Utils.Array.Shuffle(
      items.flatMap((item) => [
        { char: item.char, text: item.char, kind: 'char' as const },
        { char: item.char, text: item.emoji, kind: 'emoji' as const },
      ]),
    );

    cardsData.forEach((cardData, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const card = new WordCard(this, 168 + col * 207, 588 + row * 240, {
        char: cardData.char,
        frontText: cardData.text,
        kind: cardData.kind,
      });
      card.on('pointerup', () => this.handleMemoryCard(card));
      this.contentGroup.add(card);
      const hitZone = this.add.zone(card.x, card.y, 190, 230).setOrigin(0.5).setInteractive();
      hitZone.on('pointerup', () => this.handleMemoryCard(card));
      this.contentGroup.add(hitZone);
    });
  }

  private handleMemoryCard(card: WordCard): void {
    if (this.answerLocked || card.isMatched() || card.isRevealed()) {
      return;
    }

    card.reveal();
    if (!this.memoryFirst) {
      this.memoryFirst = card;
      this.questionStartedAt = Date.now();
      return;
    }

    this.memorySecond = card;
    this.answerLocked = true;

    if (this.memoryFirst.char === this.memorySecond.char && this.memoryFirst.kind !== this.memorySecond.kind) {
      const char = this.memoryFirst.char;
      recordCharAnswer(char, true);
      const gain = scoreCorrect(this.scoreState, {
        questionStartedAt: this.questionStartedAt,
        usedHint: false,
        hadWrongAttempt: false,
      });
      this.matchedPairs += 1;
      this.memoryFirst.markMatched();
      this.memorySecond.markMatched();
      this.feedbackText.setText(`${playerProfile.childName}配对成功！${gain.messages.join('  ')}`);
      this.hero.happyJump();
      playCorrectSound();
      const pairPraiseText = `${playerProfile.childName}答对啦`;
      this.memoryFirst = null;
      this.memorySecond = null;
      this.answerLocked = false;
      this.updateTopBar();
      this.progressText.setText(`${this.matchedPairs}/3`);
      if (this.matchedPairs >= 3) {
        this.waitForSpeechThen(pairPraiseText, 1200, () => this.finishLevel());
      } else {
        speak(pairPraiseText);
      }
      return;
    }

    const char = this.memoryFirst.char;
    recordCharAnswer(char, false);
    scoreWrong(this.scoreState);
    this.updateTopBar();
    this.feedbackText.setText(`${playerProfile.childName}没关系，再试一次`);
    this.hero.sadShake();
    playWrongSound();
    speak(`${playerProfile.childName}没关系，再试一次`);
    this.time.delayedCall(650, () => {
      this.memoryFirst?.hide();
      this.memorySecond?.hide();
      this.memoryFirst = null;
      this.memorySecond = null;
      this.answerLocked = false;
    });
  }

  private updateTopBar(): void {
    this.scoreText.setText(`分数 ${this.scoreState.score}`);
    this.comboText.setText(`连击 ${this.scoreState.streak}`);
    if (this.level.mode !== 'memory_match') {
      this.progressText.setText(`${Math.min(this.questionIndex + 1, this.questions.length)}/${this.questions.length}`);
    }
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
    const result = buildLevelResult(this.level.id, this.scoreState, this.learnedChars, false);
    recordLevelCompletion(result);
    addStudySeconds((Date.now() - this.startedAt) / 1000);
    playWinSound();
    this.hero.celebrate();
    this.time.delayedCall(760, () => {
      this.scene.start('ResultScene', { levelId: this.level.id, result });
    });
  }
}
