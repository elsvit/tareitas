#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const credentialsPath = path.join(__dirname, '../e2e/config/credentials.yaml');
const flowPath = process.argv[2] ?? 'e2e/flows/main.yaml';

const credentialsSource = fs.readFileSync(credentialsPath, 'utf8');
const env = {};

for (const line of credentialsSource.split('\n')) {
  const match = line.match(/^\s+([A-Z0-9_]+):\s*(.+)\s*$/);
  if (!match) {
    continue;
  }

  let value = match[2].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  env[match[1]] = value;
}

const envArgs = Object.entries(env).flatMap(([key, value]) => [
  '-e',
  `${key}=${value}`,
]);

execSync(['maestro', 'test', flowPath, ...envArgs].join(' '), {
  stdio: 'inherit',
  env: { ...process.env, ...env },
});
