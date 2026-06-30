import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { commonStandardCharsLevel1 } from './common-chars.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(rootDir, 'data');
const dbPath = process.env.XIAODANZAI_DB ?? path.join(dataDir, 'xiaodanzai.sqlite');
const port = Number(process.env.PORT ?? 8787);
const childName = '宝一一';
const DAILY_PLAN_VERSION = 5;
const DAILY_NEW_CHAR_TARGET = 20;

mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE,
    child_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS devices (
    device_id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
  );
  CREATE TABLE IF NOT EXISTS saves (
    profile_id TEXT PRIMARY KEY,
    save_json TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
  );
  CREATE TABLE IF NOT EXISTS daily_plans (
    profile_id TEXT NOT NULL,
    date_key TEXT NOT NULL,
    plan_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (profile_id, date_key),
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
  );
`);

const level1Chars = Array.from(commonStandardCharsLevel1);
const starterChars = Array.from(
  [
    '人口手足目耳头心大小日月山水火木土石田云雨风鸟鱼虫牛羊马猫狗兔鸡',
    '爸妈爷奶姐姐哥哥妹妹弟弟孩女男家门书学画歌舞跑跳吃喝看听说笑爱好玩',
    '上下来去里外左右前后中天星花草树果车船衣鞋帽灯床桌椅饭米面包奶',
    '春夏秋冬早晚红黄蓝绿白黑园校老师朋友宝宝',
  ].join(''),
).filter((char) => level1Chars.includes(char));
const learningOrderChars = unique([...starterChars, ...level1Chars]);
const worlds = [
  { id: 'body', title: '基础字岛', chars: learningOrderChars.filter((_char, index) => index % 3 === 0) },
  { id: 'nature', title: '进阶字谷', chars: learningOrderChars.filter((_char, index) => index % 3 === 1) },
  { id: 'animal', title: '故事字林', chars: learningOrderChars.filter((_char, index) => index % 3 === 2) },
];
const allChars = learningOrderChars;

const routeHandlers = {
  'GET /api/health': handleHealth,
  'POST /api/session': handleSession,
  'GET /api/state': handleGetState,
  'PUT /api/state': handlePutState,
  'GET /api/daily-plan': handleDailyPlan,
};

const server = createServer(async (req, res) => {
  try {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const key = `${req.method} ${url.pathname}`;
    const handler = routeHandlers[key];
    if (handler) {
      await handler(req, res, url);
      return;
    }

    if (url.pathname.startsWith('/api/')) {
      sendJson(res, 404, { error: 'not_found' });
      return;
    }

    serveStatic(res, url.pathname);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: 'server_error' });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`小蛋仔 API ready on http://localhost:${port}`);
  console.log(`SQLite: ${dbPath}`);
});

function handleHealth(_req, res) {
  sendJson(res, 200, { ok: true, db: path.basename(dbPath) });
}

async function handleSession(req, res) {
  const body = await readJson(req);
  const deviceId = normalizeDeviceId(body.deviceId);
  const phone = normalizePhone(body.phone);
  if (!deviceId) {
    sendJson(res, 400, { error: 'device_id_required' });
    return;
  }

  const profile = ensureProfile({ deviceId, phone, childName: body.childName || childName });
  sendJson(res, 200, {
    profileId: profile.id,
    childName: profile.child_name,
    phone: profile.phone,
    deviceId,
  });
}

function handleGetState(_req, res, url) {
  const access = requireProfileAccess(url.searchParams);
  if (!access.ok) {
    sendJson(res, access.status, { error: access.error });
    return;
  }

  const row = db.prepare('SELECT save_json, updated_at FROM saves WHERE profile_id = ?').get(access.profileId);
  sendJson(res, 200, {
    save: row ? JSON.parse(row.save_json) : null,
    updatedAt: row?.updated_at ?? null,
  });
}

async function handlePutState(req, res) {
  const body = await readJson(req);
  const profileId = typeof body.profileId === 'string' ? body.profileId : '';
  const deviceId = normalizeDeviceId(body.deviceId);
  const access = validateDeviceProfile(profileId, deviceId);
  if (!access.ok) {
    sendJson(res, access.status, { error: access.error });
    return;
  }
  if (!body.save || typeof body.save !== 'object') {
    sendJson(res, 400, { error: 'save_required' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO saves (profile_id, save_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(profile_id) DO UPDATE SET save_json = excluded.save_json, updated_at = excluded.updated_at
  `).run(profileId, JSON.stringify(body.save), now);
  db.prepare('UPDATE profiles SET updated_at = ? WHERE id = ?').run(now, profileId);
  sendJson(res, 200, { ok: true, updatedAt: now });
}

function handleDailyPlan(_req, res, url) {
  const access = requireProfileAccess(url.searchParams);
  if (!access.ok) {
    sendJson(res, access.status, { error: access.error });
    return;
  }

  const dateKey = normalizeDateKey(url.searchParams.get('date')) ?? todayKey();
  const existing = db
    .prepare('SELECT plan_json, created_at FROM daily_plans WHERE profile_id = ? AND date_key = ?')
    .get(access.profileId, dateKey);
  if (existing) {
    const plan = JSON.parse(existing.plan_json);
    if (plan.planVersion === DAILY_PLAN_VERSION && plan.dailyNewTarget === DAILY_NEW_CHAR_TARGET) {
      sendJson(res, 200, { ...plan, createdAt: existing.created_at });
      return;
    }
  }

  const saveRow = db.prepare('SELECT save_json FROM saves WHERE profile_id = ?').get(access.profileId);
  const save = saveRow ? safeJsonParse(saveRow.save_json, null) : null;
  const plan = createDailyPlan(access.profileId, dateKey, save);
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO daily_plans (profile_id, date_key, plan_json, created_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(profile_id, date_key) DO UPDATE SET plan_json = excluded.plan_json, created_at = excluded.created_at
  `).run(access.profileId, dateKey, JSON.stringify(plan), now);
  sendJson(res, 200, { ...plan, createdAt: now });
}

function ensureProfile({ deviceId, phone, childName }) {
  const now = new Date().toISOString();
  if (phone) {
    let profile = db.prepare('SELECT * FROM profiles WHERE phone = ?').get(phone);
    if (!profile) {
      const id = `phone_${shortHash(phone)}`;
      db.prepare('INSERT INTO profiles (id, phone, child_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(
        id,
        phone,
        childName,
        now,
        now,
      );
      profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
    }
    db.prepare(`
      INSERT INTO devices (device_id, profile_id, created_at, last_seen_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(device_id) DO UPDATE SET profile_id = excluded.profile_id, last_seen_at = excluded.last_seen_at
    `).run(deviceId, profile.id, now, now);
    return profile;
  }

  const device = db.prepare('SELECT profile_id FROM devices WHERE device_id = ?').get(deviceId);
  if (device) {
    db.prepare('UPDATE devices SET last_seen_at = ? WHERE device_id = ?').run(now, deviceId);
    return db.prepare('SELECT * FROM profiles WHERE id = ?').get(device.profile_id);
  }

  const id = `device_${shortHash(deviceId)}_${randomUUID().slice(0, 8)}`;
  db.prepare('INSERT INTO profiles (id, phone, child_name, created_at, updated_at) VALUES (?, NULL, ?, ?, ?)').run(
    id,
    childName,
    now,
    now,
  );
  db.prepare('INSERT INTO devices (device_id, profile_id, created_at, last_seen_at) VALUES (?, ?, ?, ?)').run(
    deviceId,
    id,
    now,
    now,
  );
  return db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
}

function requireProfileAccess(searchParams) {
  const profileId = searchParams.get('profileId') ?? '';
  const deviceId = normalizeDeviceId(searchParams.get('deviceId'));
  return validateDeviceProfile(profileId, deviceId);
}

function validateDeviceProfile(profileId, deviceId) {
  if (!profileId || !deviceId) {
    return { ok: false, status: 400, error: 'profile_and_device_required' };
  }
  const row = db.prepare('SELECT profile_id FROM devices WHERE device_id = ?').get(deviceId);
  if (!row || row.profile_id !== profileId) {
    return { ok: false, status: 403, error: 'device_not_bound_to_profile' };
  }
  return { ok: true, profileId };
}

function createDailyPlan(profileId, dateKey, save) {
  const seedBase = `${profileId}:${dateKey}`;
  const charProgress = save?.charProgress && typeof save.charProgress === 'object' ? save.charProgress : {};
  const progressValues = Object.values(charProgress);
  const masteredCount = progressValues.filter((item) => item?.status === 'mastered').length;
  const weakChars = Object.values(charProgress)
    .filter((item) => item?.status === 'weak' || Number(item?.wrongCount ?? 0) >= 2)
    .map((item) => item.char)
    .filter(Boolean);
  const learnedChars = progressValues
    .filter((item) => Number(item?.seenCount ?? 0) > 0)
    .map((item) => item.char)
    .filter(Boolean);
  const learnedSet = new Set(learnedChars);
  const unseenChars = allChars.filter((char) => !learnedSet.has(char));
  const dailyNewChars = selectDailyNewChars(unseenChars, seedBase);
  const hasLearnedChars = learnedChars.length > 0 || weakChars.length > 0;
  const fallbackReviewCandidates = hasLearnedChars
    ? allChars.filter((char) => !dailyNewChars.includes(char))
    : dailyNewChars;
  const reviewChars = unique([
    ...weakChars,
    ...seededShuffle(learnedChars, `${seedBase}:review`),
    ...seededShuffle(fallbackReviewCandidates, `${seedBase}:fallback-review`),
  ]);
  const difficulty = Math.min(3, 1 + Math.floor(masteredCount / 100));

  const levels = worlds.flatMap((world, worldIndex) => {
    const shuffled = seededShuffle(world.chars, `${seedBase}:${world.id}`);
    const worldNew = dailyNewChars.filter((char) => world.chars.includes(char));
    const worldWeak = weakChars.filter((char) => world.chars.includes(char));
    const worldReview = reviewChars.filter((char) => world.chars.includes(char));
    const worldPool = unique([...worldNew, ...worldWeak, ...worldReview]);
    const fallbackPool = worldPool.length > 0 ? worldPool : shuffled.slice(0, 3);
    const titleNo = worldIndex + 1;
    const first = pickLevelChars(worldNew, fallbackPool, 3, 0);
    const second = pickLevelChars(worldNew, fallbackPool, 3, 3);
    const memory = pickLevelChars(worldNew, fallbackPool, 3, 6);
    const review = pickLevelChars(unique([...worldWeak, ...worldNew]), fallbackPool, Math.min(8, Math.max(6, worldNew.length)), 0);
    const boss = pickLevelChars(unique([...worldWeak, ...worldNew]), fallbackPool, Math.min(fallbackPool.length, 8 + difficulty), 0);
    const questionCount = Math.min(8, 5 + difficulty);

    return [
      makeLevel(dateKey, world.id, 1, `${titleNo}-1 今日听音跳字`, 'listen_jump', first, questionCount, false, 0, difficulty),
      makeLevel(dateKey, world.id, 2, `${titleNo}-2 今日词语补字`, 'word_choice', second, questionCount, false, 1, difficulty),
      makeLevel(dateKey, world.id, 3, `${titleNo}-3 今日字卡翻翻乐`, 'memory_match', memory, 3, false, 3, difficulty),
      makeLevel(dateKey, world.id, 4, `${titleNo}-4 今日看意思找字`, 'meaning_choice', review, 8, false, 5, difficulty),
      makeLevel(dateKey, world.id, 5, `${titleNo}-5 今日错字怪`, 'boss_quiz', boss, 5, true, 7, difficulty),
    ];
  });

  return {
    planVersion: DAILY_PLAN_VERSION,
    dateKey,
    childName,
    difficulty,
    dailyNewTarget: DAILY_NEW_CHAR_TARGET,
    newChars: dailyNewChars,
    reviewChars: reviewChars.slice(0, 40),
    worlds,
    levels,
  };
}

function makeLevel(dateKey, worldId, index, title, mode, chars, questionCount, isBoss, unlockStarsRequired, difficulty) {
  return {
    id: `daily-${dateKey}-${worldId}-${index}`,
    worldId,
    title,
    mode,
    chars,
    questionCount,
    isBoss,
    unlockStarsRequired,
    dailyDate: dateKey,
    difficulty,
  };
}

function pickChars(shuffled, count, offset, priorityChars) {
  const rotated = [...shuffled.slice(offset), ...shuffled.slice(0, offset)];
  return unique([...priorityChars, ...rotated]).slice(0, count);
}

function pickLevelChars(primaryChars, fallbackChars, count, offset) {
  const primary = [...primaryChars.slice(offset), ...primaryChars.slice(0, offset)];
  const fallback = [...fallbackChars.slice(offset), ...fallbackChars.slice(0, offset)];
  return unique([...primary, ...fallback]).slice(0, count);
}

function selectDailyNewChars(unseenChars, seedBase) {
  const todaysNewChars = unseenChars.slice(0, DAILY_NEW_CHAR_TARGET);
  const unseenSet = new Set(todaysNewChars);
  const pools = worlds.map((world) => ({
    worldId: world.id,
    chars: seededShuffle(
      todaysNewChars.filter((char) => world.chars.includes(char) && unseenSet.has(char)),
      `${seedBase}:new:${world.id}`,
    ),
  }));
  const allocation = distributeTarget(DAILY_NEW_CHAR_TARGET, pools.map((pool) => pool.chars.length));
  const selected = pools.flatMap((pool, index) => pool.chars.slice(0, allocation[index]));
  const selectedSet = new Set(selected);
  const fallback = seededShuffle(
    unseenChars.filter((char) => !selectedSet.has(char)),
    `${seedBase}:new:fallback`,
  );
  return unique([...selected, ...fallback]).slice(0, DAILY_NEW_CHAR_TARGET);
}

function distributeTarget(target, capacities) {
  const totalCapacity = capacities.reduce((sum, value) => sum + value, 0);
  const totalTarget = Math.min(target, totalCapacity);
  const allocation = capacities.map((capacity) => Math.min(capacity, Math.floor((capacity / Math.max(1, totalCapacity)) * totalTarget)));
  let remaining = totalTarget - allocation.reduce((sum, value) => sum + value, 0);

  while (remaining > 0) {
    let bestIndex = -1;
    let bestRemainder = -1;
    capacities.forEach((capacity, index) => {
      const remainder = capacity - allocation[index];
      if (remainder > bestRemainder) {
        bestRemainder = remainder;
        bestIndex = index;
      }
    });
    if (bestIndex < 0 || bestRemainder <= 0) {
      break;
    }
    allocation[bestIndex] += 1;
    remaining -= 1;
  }

  return allocation;
}

function seededShuffle(items, seedText) {
  const random = mulberry32(hashNumber(seedText));
  return [...items]
    .map((item) => ({ item, sort: random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function mulberry32(seed) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hashNumber(text) {
  return createHash('sha256').update(text).digest().readUInt32BE(0);
}

function shortHash(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 14);
}

function unique(items) {
  return Array.from(new Set(items));
}

function normalizeDeviceId(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().slice(0, 120);
}

function normalizePhone(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const phone = value.replace(/\D/g, '');
  if (phone.length < 6 || phone.length > 20) {
    return null;
  }
  return phone;
}

function normalizeDateKey(value) {
  if (typeof value !== 'string') {
    return null;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function safeJsonParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 2_000_000) {
      throw new Error('request_too_large');
    }
    chunks.push(chunk);
  }
  if (!chunks.length) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function serveStatic(res, urlPath) {
  const distDir = path.join(rootDir, 'dist');
  const requested = urlPath === '/' ? '/index.html' : decodeURIComponent(urlPath);
  const filePath = safeJoin(distDir, requested);
  const fallbackPath = path.join(distDir, 'index.html');
  const target = filePath && existsSync(filePath) && statSync(filePath).isFile() ? filePath : fallbackPath;

  if (!existsSync(target)) {
    sendJson(res, 404, { error: 'dist_not_found', message: 'Run npm run build before npm run start.' });
    return;
  }

  res.writeHead(200, { 'Content-Type': contentType(target) });
  createReadStream(target).pipe(res);
}

function safeJoin(baseDir, requestPath) {
  const resolved = path.resolve(baseDir, `.${requestPath}`);
  return resolved.startsWith(baseDir) ? resolved : null;
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}
