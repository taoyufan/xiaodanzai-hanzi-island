import type { LevelConfig, SaveData } from '../types';
import { levels, worlds } from '../data/levels';
import { getTotalStars, loadSave } from './storage';

export function getLevel(levelId: string): LevelConfig {
  const level = levels.find((item) => item.id === levelId);
  if (!level) {
    throw new Error(`Unknown level: ${levelId}`);
  }
  return level;
}

export function getWorldLevels(worldId: string): LevelConfig[] {
  return levels.filter((level) => level.worldId === worldId);
}

export function getNextLevel(levelId: string): LevelConfig | null {
  const index = levels.findIndex((item) => item.id === levelId);
  if (index < 0 || index >= levels.length - 1) {
    return null;
  }
  return levels[index + 1];
}

export function getWorldTitle(worldId: string): string {
  return worlds.find((world) => world.id === worldId)?.title ?? worldId;
}

export function isLevelUnlocked(level: LevelConfig, save: SaveData = loadSave()): boolean {
  if (level.unlockStarsRequired <= 0) {
    return true;
  }
  const totalStars = getTotalStars(save);
  return totalStars >= level.unlockStarsRequired;
}

export function getLevelProgressText(level: LevelConfig, save: SaveData = loadSave()): string {
  if (isLevelUnlocked(level, save)) {
    return save.levelProgress[level.id]?.stars ? '已解锁' : '新关卡';
  }
  const need = Math.max(0, level.unlockStarsRequired - getTotalStars(save));
  return `还差 ${need} 星`;
}
