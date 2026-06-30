import type { CharProgress, CharStatus, SaveData } from '../types';
import { charItems } from '../data/chars';
import { loadSave, mutateSave } from './storage';

function blankProgress(char: string): CharProgress {
  return {
    char,
    seenCount: 0,
    correctCount: 0,
    wrongCount: 0,
    lastSeenAt: null,
    status: 'unseen',
  };
}

export function calculateCharStatus(progress: CharProgress): CharStatus {
  if (progress.seenCount <= 0) {
    return 'unseen';
  }

  const attempts = progress.correctCount + progress.wrongCount;
  const accuracy = attempts === 0 ? 0 : progress.correctCount / attempts;

  if (progress.seenCount >= 5 && accuracy >= 0.8) {
    return 'mastered';
  }
  if (progress.seenCount >= 3 && accuracy >= 0.7) {
    return 'familiar';
  }
  if (attempts > 0 && (progress.wrongCount >= 2 || accuracy < 0.6)) {
    return 'weak';
  }
  return 'learning';
}

export function markCharSeen(char: string): CharProgress {
  let updated = blankProgress(char);
  mutateSave((save) => {
    const current = save.charProgress[char] ?? blankProgress(char);
    updated = {
      ...current,
      seenCount: current.seenCount + 1,
      lastSeenAt: new Date().toISOString(),
    };
    updated.status = calculateCharStatus(updated);
    save.charProgress[char] = updated;
  });
  return updated;
}

export function recordCharAnswer(char: string, correct: boolean): CharProgress {
  let updated = blankProgress(char);
  mutateSave((save) => {
    const current = save.charProgress[char] ?? blankProgress(char);
    updated = {
      ...current,
      correctCount: current.correctCount + (correct ? 1 : 0),
      wrongCount: current.wrongCount + (correct ? 0 : 1),
      lastSeenAt: new Date().toISOString(),
    };
    updated.status = calculateCharStatus(updated);
    save.charProgress[char] = updated;
  });
  return updated;
}

export function getCharProgress(char: string, save = loadSave()): CharProgress {
  return save.charProgress[char] ?? blankProgress(char);
}

export function getParentSummary(save: SaveData = loadSave()) {
  const progresses = charItems.map((item) => getCharProgress(item.char, save));
  const learned = progresses.filter((item) => item.seenCount > 0);
  const mastered = progresses.filter((item) => item.status === 'mastered');
  const weak = progresses
    .filter((item) => item.status === 'weak')
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, 8);
  const correct = progresses.reduce((sum, item) => sum + item.correctCount, 0);
  const wrong = progresses.reduce((sum, item) => sum + item.wrongCount, 0);
  const total = correct + wrong;

  return {
    learnedCount: learned.length,
    masteredCount: mastered.length,
    weakChars: weak,
    totalAccuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
    correct,
    wrong,
  };
}
