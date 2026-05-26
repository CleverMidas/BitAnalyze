import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import path from 'node:path';

const isWindows = process.platform === 'win32';
const pnpmBin = isWindows ? 'pnpm.cmd' : 'pnpm';
const workspaceRoot = process.cwd();
const appPorts = [3000, 3001];
const cleanupTargets = [
  '.turbo',
  'apps/web/.next',
  'apps/web/tsconfig.tsbuildinfo',
  'apps/api/dist',
  'apps/indexer/dist',
  'packages/db/dist',
  'packages/shared/dist',
];

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = isWindows
      ? spawn('cmd.exe', ['/c', command, ...args], {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: false,
          ...options,
        })
      : spawn(command, args, {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: false,
          ...options,
        });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} failed with code ${code ?? 'unknown'}`));
    });

    child.on('error', reject);
  });
}

function runCapture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = isWindows
      ? spawn('cmd.exe', ['/c', command, ...args], {
          cwd: workspaceRoot,
          stdio: ['ignore', 'pipe', 'pipe'],
          shell: false,
          ...options,
        })
      : spawn(command, args, {
          cwd: workspaceRoot,
          stdio: ['ignore', 'pipe', 'pipe'],
          shell: false,
          ...options,
        });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk) => {
      stdout += String(chunk);
    });

    child.stderr?.on('data', (chunk) => {
      stderr += String(chunk);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve({ stderr, stdout });
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(' ')} failed with code ${code ?? 'unknown'}\n${stderr || stdout}`.trim(),
        ),
      );
    });

    child.on('error', reject);
  });
}

async function killProcessTree(pid) {
  if (!pid) {
    return;
  }

  if (isWindows) {
    await run('taskkill', ['/PID', String(pid), '/T', '/F']).catch(() => {});
    return;
  }

  await run('kill', ['-TERM', String(pid)]).catch(() => {});
}

async function clearOccupiedPorts() {
  console.log('Clearing stale app processes...');

  if (isWindows) {
    for (const port of appPorts) {
      const result = await runCapture('powershell', [
        '-NoProfile',
        '-Command',
        `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique`,
      ]).catch(() => ({ stdout: '' }));

      const pids = result.stdout
        .split(/\r?\n/)
        .map((value) => value.trim())
        .filter(Boolean);

      for (const pid of pids) {
        console.log(`Stopping process on port ${port}: PID ${pid}`);
        await killProcessTree(pid);
      }
    }

    return;
  }

  for (const port of appPorts) {
    const result = await runCapture('sh', [
      '-lc',
      `lsof -ti tcp:${port} -sTCP:LISTEN 2>/dev/null || true`,
    ]).catch(() => ({ stdout: '' }));

    const pids = result.stdout
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    for (const pid of pids) {
      console.log(`Stopping process on port ${port}: PID ${pid}`);
      await killProcessTree(pid);
    }
  }
}

async function clearBuildArtifacts() {
  console.log('Clearing stale caches and build artifacts...');

  for (const target of cleanupTargets) {
    const absoluteTarget = path.join(workspaceRoot, target);
    await rm(absoluteTarget, { force: true, recursive: true }).catch(() => {});
  }
}

async function main() {
  await clearOccupiedPorts();
  await clearBuildArtifacts();

  console.log('Starting Docker services...');
  await run('docker', ['compose', 'up', '-d']);

  console.log('Waiting for Postgres to become ready...');
  await run('docker', [
    'compose',
    'exec',
    '-T',
    'postgres',
    'sh',
    '-lc',
    'until pg_isready -U postgres -d bitanalyze; do sleep 1; done',
  ]);

  console.log('Applying database bootstrap...');
  await run(pnpmBin, ['db:migrate']);

  console.log('Starting web, API, and indexer...');
  await run(pnpmBin, ['dev:apps']);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
