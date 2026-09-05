#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const { loadEnvFile } = require('./load-env-file');

const projectRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const commandArgs = [];
let explicitEnvFile = null;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];

  if (arg === '--env-file') {
    const envFile = args[index + 1];

    if (!envFile) {
      console.error('Missing value for --env-file');
      process.exit(1);
    }

    explicitEnvFile = envFile;
    const result = loadEnvFile(envFile, projectRoot);

    if (!result.loaded) {
      console.error(
        `Env file not found: ${path.relative(projectRoot, result.resolvedPath)}`,
      );
      process.exit(1);
    }

    console.log(
      `Loaded ${result.keys.length} env var(s) from ${path.relative(projectRoot, result.resolvedPath)}`,
    );
    index += 1;
    continue;
  }

  if (arg.startsWith('--env-file=')) {
    explicitEnvFile = arg.slice('--env-file='.length);
    const result = loadEnvFile(explicitEnvFile, projectRoot);

    if (!result.loaded) {
      console.error(
        `Env file not found: ${path.relative(projectRoot, result.resolvedPath)}`,
      );
      process.exit(1);
    }

    console.log(
      `Loaded ${result.keys.length} env var(s) from ${path.relative(projectRoot, result.resolvedPath)}`,
    );
    continue;
  }

  commandArgs.push(arg);
}

if (explicitEnvFile) {
  process.env.EXPO_NO_DOTENV = '1';
  console.log(
    `Using ${explicitEnvFile} (EXPO_NO_DOTENV=1). EXPO_PUBLIC_API_URL=${process.env.EXPO_PUBLIC_API_URL ?? '(unset)'}`,
  );
}

if (commandArgs.length === 0) {
  console.error(
    'Usage: node scripts/run-with-env.js --env-file <path> <command> [...args]',
  );
  process.exit(1);
}

const [command, ...childArgs] = commandArgs;

const child = spawn(command, childArgs, {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on('error', error => {
  console.error(error.message);
  process.exit(1);
});
