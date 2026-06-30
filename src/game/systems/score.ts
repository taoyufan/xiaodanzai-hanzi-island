import type { LevelRunResult } from '../types';

export type ScoreState = {
  score: number;
  streak: number;
  maxStreak: number;
  correctCount: number;
  wrongCount: number;
  hintsUsed: number;
};

export type CorrectScoreInput = {
  questionStartedAt: number;
  usedHint: boolean;
  hadWrongAttempt: boolean;
};

export type ScoreGain = {
  points: number;
  messages: string[];
};

export function createScoreState(): ScoreState {
  return {
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctCount: 0,
    wrongCount: 0,
    hintsUsed: 0,
  };
}

export function scoreCorrect(state: ScoreState, input: CorrectScoreInput): ScoreGain {
  let points = 10;
  const messages = ['+10'];

  if (input.usedHint) {
    points = 5;
    messages[0] = '提示答对 +5';
  }

  if (input.hadWrongAttempt) {
    points = 3;
    messages[0] = '再试答对 +3';
  }

  if (Date.now() - input.questionStartedAt <= 3000) {
    points += 5;
    messages.push('快快答对 +5');
  }

  state.correctCount += 1;
  state.streak += 1;
  state.maxStreak = Math.max(state.maxStreak, state.streak);

  if (state.streak === 3) {
    points += 10;
    messages.push('连对 3 题 +10');
  }
  if (state.streak === 5) {
    points += 20;
    messages.push('连对 5 题 +20');
  }

  state.score += points;
  return { points, messages };
}

export function scoreWrong(state: ScoreState): void {
  state.wrongCount += 1;
  state.streak = 0;
}

export function useHint(state: ScoreState): void {
  state.hintsUsed += 1;
}

export function calculateStars(correctCount: number, wrongCount: number, hintsUsed: number): number {
  const attempts = correctCount + wrongCount;
  if (attempts <= 0) {
    return 0;
  }
  const accuracy = correctCount / attempts;
  if (accuracy >= 0.9 && hintsUsed <= 1) {
    return 3;
  }
  if (accuracy >= 0.8) {
    return 2;
  }
  if (accuracy >= 0.6) {
    return 1;
  }
  return 0;
}

export function coinsForLevel(stars: number, isBoss: boolean): number {
  const starCoins = stars * 10;
  return starCoins + (isBoss && stars > 0 ? 50 : 0);
}

export function buildLevelResult(
  levelId: string,
  state: ScoreState,
  learnedChars: string[],
  isBoss: boolean,
): LevelRunResult {
  const stars = calculateStars(state.correctCount, state.wrongCount, state.hintsUsed);
  const attempts = state.correctCount + state.wrongCount;
  const accuracy = attempts === 0 ? 0 : Math.round((state.correctCount / attempts) * 100);

  return {
    levelId,
    score: state.score,
    stars,
    coins: coinsForLevel(stars, isBoss),
    accuracy,
    correctCount: state.correctCount,
    wrongCount: state.wrongCount,
    hintsUsed: state.hintsUsed,
    learnedChars: Array.from(new Set(learnedChars)),
    isBoss,
    completedAt: new Date().toISOString(),
  };
}
