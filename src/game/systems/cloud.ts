import { playerProfile } from '../data/player';
import type { CharProgress, DailyStudy, LevelConfig, LevelProgress, RecentCompletion, SaveData } from '../types';
import { setActiveLevels } from './levelManager';
import { createDefaultSave, loadSave, replaceSave } from './storage';

const DEVICE_KEY = 'xiaodanzai_device_id_v1';
const PHONE_KEY = 'xiaodanzai_phone_v1';
const PROFILE_KEY = 'xiaodanzai_profile_id_v1';
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

let cloudProfileId: string | null = null;
let cloudDeviceId: string | null = null;
let listeningForSave = false;
let saveTimer: number | null = null;
let pendingSave: SaveData | null = null;
let currentInit: Promise<void> | null = null;

type SessionResponse = {
  profileId: string;
  childName: string;
  phone: string | null;
  deviceId: string;
};

type StateResponse = {
  save: SaveData | null;
  updatedAt: string | null;
};

type DailyPlanResponse = {
  dateKey: string;
  levels: LevelConfig[];
};

export function getDeviceId(): string {
  const existing = window.localStorage.getItem(DEVICE_KEY);
  if (existing) {
    return existing;
  }
  const randomPart = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const deviceId = `device-${randomPart}`;
  window.localStorage.setItem(DEVICE_KEY, deviceId);
  return deviceId;
}

export function getBoundPhone(): string | null {
  return window.localStorage.getItem(PHONE_KEY);
}

export function getCloudIdentityText(): string {
  const phone = getBoundPhone();
  if (phone) {
    return `手机号同步：${maskPhone(phone)}`;
  }
  const profileId = window.localStorage.getItem(PROFILE_KEY);
  return profileId ? '本设备已同步' : '本设备本地保存';
}

export async function bindPhoneForCloud(rawPhone?: string): Promise<string> {
  const input = rawPhone ?? window.prompt('输入手机号即可同步宝一一的学习记录，不需要验证码。', getBoundPhone() ?? '');
  const phone = normalizePhone(input);
  if (!phone) {
    return getCloudIdentityText();
  }
  window.localStorage.setItem(PHONE_KEY, phone);
  await initializeCloudProfile(true);
  return getCloudIdentityText();
}

export async function initializeCloudProfile(force = false): Promise<void> {
  if (currentInit && !force) {
    return currentInit;
  }
  currentInit = doInitializeCloudProfile();
  try {
    await currentInit;
  } finally {
    currentInit = null;
  }
}

async function doInitializeCloudProfile(): Promise<void> {
  setupSaveListener();
  const deviceId = getDeviceId();
  const phone = getBoundPhone();
  const session = await apiFetch<SessionResponse>('/api/session', {
    method: 'POST',
    body: JSON.stringify({
      deviceId,
      phone,
      childName: playerProfile.childName,
    }),
  });

  cloudProfileId = session.profileId;
  cloudDeviceId = session.deviceId;
  window.localStorage.setItem(PROFILE_KEY, session.profileId);

  const localSave = loadSave();
  const state = await apiFetch<StateResponse>(
    `/api/state?profileId=${encodeURIComponent(session.profileId)}&deviceId=${encodeURIComponent(session.deviceId)}`,
  );
  const mergedSave = state.save ? mergeSave(localSave, state.save) : localSave;
  replaceSave(mergedSave, false);
  await pushCloudSave(mergedSave);

  const plan = await apiFetch<DailyPlanResponse>(
    `/api/daily-plan?profileId=${encodeURIComponent(session.profileId)}&deviceId=${encodeURIComponent(session.deviceId)}&date=${todayKey()}`,
  );
  if (plan.levels?.length) {
    setActiveLevels(plan.levels);
  }
}

function setupSaveListener(): void {
  if (listeningForSave) {
    return;
  }
  listeningForSave = true;
  window.addEventListener('hanzi-save-updated', (event) => {
    const save = (event as CustomEvent<SaveData>).detail;
    scheduleCloudSave(save);
  });
}

function scheduleCloudSave(save: SaveData): void {
  if (!cloudProfileId || !cloudDeviceId) {
    return;
  }
  pendingSave = save;
  if (saveTimer) {
    window.clearTimeout(saveTimer);
  }
  saveTimer = window.setTimeout(() => {
    if (pendingSave) {
      void pushCloudSave(pendingSave);
    }
  }, 700);
}

async function pushCloudSave(save: SaveData): Promise<void> {
  if (!cloudProfileId || !cloudDeviceId) {
    return;
  }
  await apiFetch('/api/state', {
    method: 'PUT',
    body: JSON.stringify({
      profileId: cloudProfileId,
      deviceId: cloudDeviceId,
      save,
    }),
  });
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 2500);
  try {
    const response = await window.fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
    if (!response.ok) {
      throw new Error(`api_${response.status}`);
    }
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

function mergeSave(localSave: SaveData, remoteSave: SaveData): SaveData {
  const base = createDefaultSave();
  const local = { ...base, ...localSave };
  const remote = { ...base, ...remoteSave };
  return {
    ...base,
    version: Math.max(local.version, remote.version),
    coins: Math.max(local.coins, remote.coins),
    totalScore: Math.max(local.totalScore, remote.totalScore),
    unlockedCostumeIds: Array.from(new Set([...remote.unlockedCostumeIds, ...local.unlockedCostumeIds])),
    equippedCostumeId: local.equippedCostumeId ?? remote.equippedCostumeId,
    levelProgress: mergeLevelProgress(local.levelProgress, remote.levelProgress),
    charProgress: mergeCharProgress(local.charProgress, remote.charProgress),
    recentCompletions: mergeRecentCompletions(local.recentCompletions, remote.recentCompletions),
    dailyStudy: mergeDailyStudy(local.dailyStudy, remote.dailyStudy),
  };
}

function mergeLevelProgress(
  local: Record<string, LevelProgress>,
  remote: Record<string, LevelProgress>,
): Record<string, LevelProgress> {
  const merged: Record<string, LevelProgress> = { ...remote };
  Object.entries(local).forEach(([levelId, progress]) => {
    const existing = merged[levelId];
    if (!existing) {
      merged[levelId] = progress;
      return;
    }
    merged[levelId] = {
      levelId,
      stars: Math.max(existing.stars, progress.stars),
      bestScore: Math.max(existing.bestScore, progress.bestScore),
      completedCount: Math.max(existing.completedCount, progress.completedCount),
      lastCompletedAt: latestIso(existing.lastCompletedAt, progress.lastCompletedAt),
    };
  });
  return merged;
}

function mergeCharProgress(
  local: Record<string, CharProgress>,
  remote: Record<string, CharProgress>,
): Record<string, CharProgress> {
  const merged: Record<string, CharProgress> = { ...remote };
  Object.entries(local).forEach(([char, progress]) => {
    const existing = merged[char];
    if (!existing) {
      merged[char] = progress;
      return;
    }
    const next: CharProgress = {
      char,
      seenCount: Math.max(existing.seenCount, progress.seenCount),
      correctCount: Math.max(existing.correctCount, progress.correctCount),
      wrongCount: Math.max(existing.wrongCount, progress.wrongCount),
      lastSeenAt: latestIso(existing.lastSeenAt, progress.lastSeenAt),
      status: 'learning',
    };
    next.status = calculateMergedStatus(next);
    merged[char] = next;
  });
  return merged;
}

function mergeRecentCompletions(local: RecentCompletion[], remote: RecentCompletion[]): RecentCompletion[] {
  const byKey = new Map<string, RecentCompletion>();
  [...remote, ...local].forEach((item) => {
    byKey.set(`${item.levelId}:${item.completedAt}`, item);
  });
  return Array.from(byKey.values())
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, 8);
}

function mergeDailyStudy(
  local: Record<string, DailyStudy>,
  remote: Record<string, DailyStudy>,
): Record<string, DailyStudy> {
  const merged: Record<string, DailyStudy> = { ...remote };
  Object.entries(local).forEach(([date, item]) => {
    const existing = merged[date];
    merged[date] = {
      date,
      seconds: Math.max(existing?.seconds ?? 0, item.seconds),
    };
  });
  return merged;
}

function calculateMergedStatus(progress: CharProgress): CharProgress['status'] {
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

function latestIso(left: string | null, right: string | null): string | null {
  if (!left) {
    return right;
  }
  if (!right) {
    return left;
  }
  return left > right ? left : right;
}

function normalizePhone(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const phone = value.replace(/\D/g, '');
  return phone.length >= 6 && phone.length <= 20 ? phone : null;
}

function maskPhone(phone: string): string {
  if (phone.length <= 7) {
    return phone;
  }
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
