import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viteBin = path.join(rootDir, 'node_modules', '.bin', 'vite');

const children = [
  spawn(process.execPath, ['--no-warnings=ExperimentalWarning', 'server/hanzi-api.mjs'], {
    cwd: rootDir,
    env: { ...process.env, PORT: process.env.PORT ?? '8787' },
    stdio: 'inherit',
  }),
  spawn(viteBin, ['--host', '0.0.0.0'], {
    cwd: rootDir,
    env: { ...process.env, VITE_API_BASE: process.env.VITE_API_BASE ?? '' },
    stdio: 'inherit',
  }),
];

let shuttingDown = false;

function stopAll(signal = 'SIGTERM') {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  children.forEach((child) => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

children.forEach((child) => {
  child.on('exit', (code, signal) => {
    if (!shuttingDown && code !== 0) {
      console.error(`dev child exited with code ${code ?? 'null'} signal ${signal ?? 'null'}`);
      stopAll();
      process.exit(code ?? 1);
    }
  });
});

process.on('SIGINT', () => stopAll('SIGINT'));
process.on('SIGTERM', () => stopAll('SIGTERM'));
