// Cross-platform Cloudflare Workers helper.
//
// Nitro emits the Cloudflare build by setting NITRO_PRESET=cloudflare-durable
// (WebSockets run on a Durable Object). This script sets that variable and runs
// wrangler so the same commands work on Windows PowerShell, macOS and CI.
//
// Usage:
//   node scripts/cf.mjs build          # nuxt build (cloudflare-durable preset)
//   node scripts/cf.mjs preview        # build + wrangler dev  (local preview)
//   node scripts/cf.mjs deploy         # build + wrangler deploy
import { spawn } from 'node:child_process';
import process from 'node:process';

const cmd = process.argv[2];
const preset = 'cloudflare-durable';

function run(command, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: { ...process.env, NITRO_PRESET: preset },
      shell: process.platform === 'win32',
      ...opts,
    });
    child.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`))
    );
  });
}

async function main() {
  if (cmd === 'build' || cmd === 'preview' || cmd === 'deploy') {
    await run('npx', ['nuxt', 'build']);
  }
  if (cmd === 'preview') {
    await run('npx', [
      'wrangler', '--config', '.output/server/wrangler.json', 'dev', '--local',
    ]);
  } else if (cmd === 'deploy') {
    await run('npx', [
      'wrangler', '--config', '.output/server/wrangler.json', 'deploy',
    ]);
  } else if (cmd !== 'build') {
    console.error('Usage: node scripts/cf.mjs [build|preview|deploy]');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
