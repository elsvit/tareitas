#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const METRO_PORT = 8081;

function isMetroRunning() {
  return new Promise(resolve => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
    socket.connect(METRO_PORT, '127.0.0.1');
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startMetroInBackground() {
  const child = spawn(
    process.execPath,
    [
      path.join(projectRoot, 'scripts', 'run-with-translation-watch.js'),
      '--env-file',
      '.env.local',
      'npx',
      'expo',
      'start',
      '--dev-client',
      '--host',
      'lan',
    ],
    {
      cwd: projectRoot,
      detached: true,
      stdio: 'ignore',
    },
  );

  child.unref();
}

function runIosOnDevice() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      ['expo', 'run:ios', '--device', '--no-bundler'],
      {
        cwd: projectRoot,
        stdio: 'inherit',
        env: process.env,
      },
    );

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`expo run:ios exited with code ${code}`));
    });
  });
}

async function main() {
  const metroUp = await isMetroRunning();

  if (!metroUp) {
    console.log(
      'Metro is not running. Starting dev server with --host lan (required for a physical iPhone)...',
    );
    startMetroInBackground();

    for (let attempt = 0; attempt < 30; attempt += 1) {
      await sleep(1000);

      if (await isMetroRunning()) {
        console.log(`Metro is ready on port ${METRO_PORT}.`);
        break;
      }

      if (attempt === 29) {
        console.error(
          `Metro did not start on port ${METRO_PORT}. Run "yarn start-local" in another terminal, then retry.`,
        );
        process.exit(1);
      }
    }
  } else {
    console.log(
      `Using existing Metro on port ${METRO_PORT}. Ensure it was started with "yarn start-local" (--host lan).`,
    );
  }

  console.log(
    'Building and installing on device (Metro stays running in the other process)...',
  );
  console.log(
    'Tip: iPhone and Mac must be on the same Wi‑Fi; disable VPN if the dev client cannot connect.',
  );

  await runIosOnDevice();
}

main().catch(error => {
  console.error(error.message ?? error);
  process.exit(1);
});
