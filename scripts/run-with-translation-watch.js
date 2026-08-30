#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const loadEnvFile = (filePath) => {
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(projectRoot, filePath);

  if (!fs.existsSync(resolvedPath)) {
    console.warn(`Env file not found: ${path.relative(projectRoot, resolvedPath)}`);
    return;
  }

  const content = fs.readFileSync(resolvedPath, 'utf8');

  for (const line of content.split('\n')) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
};

const args = process.argv.slice(2);
const commandArgs = [];

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];

  if (arg === '--env-file') {
    const envFile = args[index + 1];

    if (!envFile) {
      console.error('Missing value for --env-file');
      process.exit(1);
    }

    loadEnvFile(envFile);
    index += 1;
    continue;
  }

  if (arg.startsWith('--env-file=')) {
    loadEnvFile(arg.slice('--env-file='.length));
    continue;
  }

  commandArgs.push(arg);
}

if (commandArgs.length === 0) {
  console.error(
    'Usage: node scripts/run-with-translation-watch.js [--env-file <path>] <command> [...args]',
  );
  process.exit(1);
}
const watchScript = path.join(projectRoot, 'scripts', 'sync-translations.js');

const watcher = spawn(process.execPath, [watchScript, '--watch'], {
  cwd: projectRoot,
  stdio: 'inherit',
});

const command = commandArgs[0];
const childArgs = commandArgs.slice(1);

const child = spawn(command, childArgs, {
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
