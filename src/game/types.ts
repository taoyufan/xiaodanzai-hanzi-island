export type GameMode = 'listen_jump' | 'image_choice' | 'memory_match' | 'meaning_choice' | 'word_choice' | 'boss_quiz';

export type CharStatus = 'unseen' | 'learning' | 'familiar' | 'mastered' | 'weak';

export type CharItem = {
  id: string;
  char: string;
  pinyin: string;
  meaning: string;
  category: string;
  emoji: string;
  words: string[];
  sentence: string;
  confusers: string[];
  similarChars?: string[];
};

export type LevelConfig = {
  id: string;
  worldId: string;
  title: string;
  mode: GameMode;
  chars: string[];
  questionCount: number;
  isBoss: boolean;
  unlockStarsRequired: number;
  dailyDate?: string;
  difficulty?: number;
};

export type WorldConfig = {
  id: string;
  title: string;
  subtitle: string;
  color: number;
  darkColor: number;
  chars: string[];
};

export type RewardItem = {
  id: string;
  name: string;
  cost: number;
  color: number;
  description: string;
};

export type CharProgress = {
  char: string;
  seenCount: number;
  correctCount: number;
  wrongCount: number;
  lastSeenAt: string | null;
  status: CharStatus;
};

export type LevelProgress = {
  levelId: string;
  stars: number;
  bestScore: number;
  completedCount: number;
  lastCompletedAt: string | null;
};

export type RecentCompletion = {
  levelId: string;
  title: string;
  stars: number;
  score: number;
  completedAt: string;
};

export type DailyStudy = {
  date: string;
  seconds: number;
};

export type SaveData = {
  version: number;
  coins: number;
  totalScore: number;
  unlockedCostumeIds: string[];
  equippedCostumeId: string | null;
  levelProgress: Record<string, LevelProgress>;
  charProgress: Record<string, CharProgress>;
  recentCompletions: RecentCompletion[];
  dailyStudy: Record<string, DailyStudy>;
};

export type LevelRunResult = {
  levelId: string;
  title?: string;
  score: number;
  stars: number;
  coins: number;
  accuracy: number;
  correctCount: number;
  wrongCount: number;
  hintsUsed: number;
  learnedChars: string[];
  isBoss: boolean;
  completedAt: string;
};

export const DESIGN_WIDTH = 750;
export const DESIGN_HEIGHT = 1334;
