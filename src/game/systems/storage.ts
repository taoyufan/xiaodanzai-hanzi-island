import type { DailyStudy, LevelRunResult, SaveData } from '../types';
import { levels } from '../data/levels';

const STORAGE_KEY = 'xiaodanzai_hanzi_island_save_v1';
const SAVE_VERSION = 1;

function todayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDefaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    coins: 0,
    totalScore: 0,
    unlockedCostumeIds: [],
    equippedCostumeId: null,
    levelProgress: {},
    charProgress: {},
    recentCompletions: [],
    dailyStudy: {},
  };
}

export function loadSave(): SaveData {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const fresh = createDefaultSave();
    saveGame(fresh);
    return fresh;
  }

  try {
    const parsed = JSON.parse(raw) as SaveData;
    if (parsed.version !== SAVE_VERSION) {
      const migrated = { ...createDefaultSave(), ...parsed, version: SAVE_VERSION };
      saveGame(migrated);
      return migrated;
    }
    return {
      ...createDefaultSave(),
      ...parsed,
      levelProgress: parsed.levelProgress ?? {},
      charProgress: parsed.charProgress ?? {},
      recentCompletions: parsed.recentCompletions ?? [],
      dailyStudy: parsed.dailyStudy ?? {},
    };
  } catch {
    const fresh = createDefaultSave();
    saveGame(fresh);
    return fresh;
  }
}

export function saveGame(save: SaveData): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

export function mutateSave(mutator: (save: SaveData) => void): SaveData {
  const save = loadSave();
  mutator(save);
  saveGame(save);
  return save;
}

export function getTotalStars(save = loadSave()): number {
  return Object.values(save.levelProgress).reduce((sum, progress) => sum + progress.stars, 0);
}

export function getLevelStars(levelId: string, save = loadSave()): number {
  return save.levelProgress[levelId]?.stars ?? 0;
}

export function recordLevelCompletion(result: LevelRunResult): SaveData {
  return mutateSave((save) => {
    const level = levels.find((item) => item.id === result.levelId);
    const current = save.levelProgress[result.levelId] ?? {
      levelId: result.levelId,
      stars: 0,
      bestScore: 0,
      completedCount: 0,
      lastCompletedAt: null,
    };

    save.levelProgress[result.levelId] = {
      ...current,
      stars: Math.max(current.stars, result.stars),
      bestScore: Math.max(current.bestScore, result.score),
      completedCount: current.completedCount + 1,
      lastCompletedAt: result.completedAt,
    };

    save.coins += result.coins;
    save.totalScore += result.score;
    save.recentCompletions = [
      {
        levelId: result.levelId,
        title: level?.title ?? result.levelId,
        stars: result.stars,
        score: result.score,
        completedAt: result.completedAt,
      },
      ...save.recentCompletions,
    ].slice(0, 8);
  });
}

export function addStudySeconds(seconds: number): SaveData {
  const rounded = Math.max(0, Math.round(seconds));
  return mutateSave((save) => {
    const key = todayKey();
    const current: DailyStudy = save.dailyStudy[key] ?? { date: key, seconds: 0 };
    save.dailyStudy[key] = {
      date: key,
      seconds: current.seconds + rounded,
    };
  });
}

export function getTodayStudySeconds(save = loadSave()): number {
  return save.dailyStudy[todayKey()]?.seconds ?? 0;
}

export function unlockCostume(costumeId: string, cost: number): { ok: boolean; save: SaveData } {
  let ok = false;
  const save = mutateSave((draft) => {
    if (draft.unlockedCostumeIds.includes(costumeId)) {
      ok = true;
      return;
    }
    if (draft.coins < cost) {
      ok = false;
      return;
    }
    draft.coins -= cost;
    draft.unlockedCostumeIds.push(costumeId);
    ok = true;
  });
  return { ok, save };
}

export function equipCostume(costumeId: string | null): SaveData {
  return mutateSave((save) => {
    if (costumeId === null || save.unlockedCostumeIds.includes(costumeId)) {
      save.equippedCostumeId = costumeId;
    }
  });
}

export function resetSave(): SaveData {
  const fresh = createDefaultSave();
  saveGame(fresh);
  return fresh;
}
