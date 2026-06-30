import type { LevelConfig, SaveData } from '../types';
import { levels as defaultLevels, worlds } from '../data/levels';
import { getTotalStars, loadSave } from './storage';

let activeLevels: LevelConfig[] = defaultLevels;

export function setActiveLevels(levels: LevelConfig[]): void {
  activeLevels = levels.length ? levels : defaultLevels;
}

export function getAllLevels(): LevelConfig[] {
  return activeLevels;
}

export function getLevel(levelId: string): LevelConfig {
  const level = activeLevels.find((item) => item.id === levelId) ?? defaultLevels.find((item) => item.id === levelId);
  if (!level) {
    throw new Error(`Unknown level: ${levelId}`);
  }
  return level;
}

export function getWorldLevels(worldId: string): LevelConfig[] {
  return activeLevels.filter((level) => level.worldId === worldId);
}

export function getNextLevel(levelId: string): LevelConfig | null {
  const index = activeLevels.findIndex((item) => item.id === levelId);
  if (index < 0 || index >= activeLevels.length - 1) {
    return null;
  }
  return activeLevels[index + 1];
}

export function getWorldTitle(worldId: string): string {
  return worlds.find((world) => world.id === worldId)?.title ?? worldId;
}

export function isLevelUnlocked(level: LevelConfig, save: SaveData = loadSave()): boolean {
  if (level.unlockStarsRequired <= 0) {
    return true;
  }
  return getUnlockStars(level, save) >= level.unlockStarsRequired;
}

export function getLevelProgressText(level: LevelConfig, save: SaveData = loadSave()): string {
  if (isLevelUnlocked(level, save)) {
    return save.levelProgress[level.id]?.stars ? '已解锁' : '新关卡';
  }
  const need = Math.max(0, level.unlockStarsRequired - getUnlockStars(level, save));
  return `还差 ${need} 星`;
}

export function getUnlockStars(level: LevelConfig, save: SaveData = loadSave()): number {
  if (!level.dailyDate) {
    return getTotalStars(save);
  }
  const prefix = `daily-${level.dailyDate}-`;
  return Object.values(save.levelProgress)
    .filter((progress) => progress.levelId.startsWith(prefix))
    .reduce((sum, progress) => sum + progress.stars, 0);
}
