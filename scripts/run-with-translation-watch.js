#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/run-with-translation-watch.js <command> [...args]');
  process.exit(1);
}

const projectRoot = path.resolve(__dirname, '..');
const watchScript = path.join(projectRoot, 'scripts', 'sync-translations.js');

const watcher = spawn(process.execPath, [watchScript, '--watch'], {
  cwd: projectRoot,
  stdio: 'inherit',
});

const command = args[0];
const commandArgs = args.slice(1);

const child = spawn(command, commandArgs, {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

const stopWatcher = () => {
  if (!watcher.killed) {
    watcher.kill('SIGTERM');
  }
};

child.on('exit', (code, signal) => {
  stopWatcher();

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on('error', (error) => {
  stopWatcher();
  console.error(error.message);
  process.exit(1);
});

watcher.on('error', (error) => {
  child.kill('SIGTERM');
  console.error(error.message);
  process.exit(1);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
  stopWatcher();
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
  stopWatcher();
});
