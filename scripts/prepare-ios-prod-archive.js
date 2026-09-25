#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const { loadEnvFile } = require('./load-env-file');
const { writeIosXcodeProductionEnv } = require('./write-ios-xcode-prod-env');

const projectRoot = path.resolve(__dirname, '..');
const envFile = '.env.production';

function rmrf(relativePath) {
  const targetPath = path.join(projectRoot, relativePath);

  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
    console.log(`Removed ${relativePath}`);
  }
}

function run(command) {
  console.log(`\n> ${command}\n`);
  execSync(command, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });
}

function parseArgs(argv) {
  return {
    openXcode: argv.includes('--open'),
    skipEmbed: argv.includes('--skip-embed'),
  };
}

function main() {
  const { openXcode, skipEmbed } = parseArgs(process.argv.slice(2));

  const loaded = loadEnvFile(envFile, projectRoot);
  if (!loaded.loaded) {
    console.error(
      `Missing ${envFile}. Copy .env.production.example and fill in production values.`,
    );
    process.exit(1);
  }

  process.env.EXPO_NO_DOTENV = '1';

  const envEntries = loaded.keys
    .filter(key => key !== 'EXPO_NO_DOTENV')
    .map(key => ({
      key,
      value: process.env[key] ?? '',
    }));

  const xcodeEnvPath = writeIosXcodeProductionEnv(projectRoot, envEntries);
  console.log(
    `Wrote ${path.relative(projectRoot, xcodeEnvPath)} (${envEntries.length} var(s) from ${envFile}, EXPO_NO_DOTENV=1).`,
  );
  console.log(
    `EXPO_PUBLIC_API_URL=${process.env.EXPO_PUBLIC_API_URL ?? '(unset)'}`,
  );

  console.log('Clearing JS bundler caches...');
  rmrf('node_modules/.cache');
  rmrf('.expo');
  rmrf('dist');

  if (!skipEmbed) {
    console.log('Embedding a fresh production JS bundle (iOS)...');
    run('npx expo export:embed --eager --platform ios --dev false');
  }

  const workspace = path.join(projectRoot, 'ios', 'Tareitas.xcworkspace');

  console.log(`
Next steps:
  1. Open ${path.relative(projectRoot, workspace)}
  2. Select "Any iOS Device" (or a generic iOS platform)
  3. Product → Archive
  4. Upload to App Store Connect

Xcode Release builds read env from ios/.xcode.env.local (production block above).
Re-run "yarn prepare-ios-prod-archive" after changing ${envFile}.
`);

  if (openXcode) {
    if (!fs.existsSync(workspace)) {
      console.error(`Workspace not found: ${workspace}`);
      process.exit(1);
    }

    run(`open "${workspace}"`);
  }
}

main();
