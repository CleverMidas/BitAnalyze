import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const pnpmBin = isWindows ? 'pnpm.cmd' : 'pnpm';

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

async function main() {
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
