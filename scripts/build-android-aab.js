#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const args = new Set(process.argv.slice(2));
const fullClean = args.has('--clean');
const runPrebuild = args.has('--prebuild') || fullClean;

/** Play AAB only needs phone ABIs; skipping x86 halves native (Reanimated) work. */
const RELEASE_ARCH = '-PreactNativeArchitectures=armeabi-v7a,arm64-v8a';

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

if (runPrebuild) {
  console.log('Syncing Android native project (notification icon, manifest, etc.)...');
  run('npx expo prebuild --platform android --no-install');
} else {
  console.log(
    'Skipping prebuild (use --prebuild after app.json/plugin changes, or --clean for full reset).',
  );
}

if (fullClean) {
  console.log('Full clean: clearing caches and Android build outputs...');
  rmrf('node_modules/.cache');
  rmrf('.expo');
  rmrf('dist');
  rmrf('android/app/.cxx');
  rmrf('android/app/build');
  rmrf('android/build');
  rmrf('android/.gradle');
  run('cd android && ./gradlew clean');
} else {
  console.log(
    'Incremental build (use --clean to wipe Gradle/CMake caches — much slower).',
  );
}

const bundleFlags = fullClean ? '--rerun-tasks' : '';

console.log('Building release JS bundle + AAB...');
run(
  `cd android && ./gradlew :app:createBundleReleaseJsAndAssets ${bundleFlags} ${RELEASE_ARCH}`.trim(),
);
run(`cd android && ./gradlew bundleRelease ${RELEASE_ARCH}`);

const aabPath = path.join(
  projectRoot,
  'android/app/build/outputs/bundle/release/app-release.aab',
);

if (fs.existsSync(aabPath)) {
  const { size, mtime } = fs.statSync(aabPath);
  console.log(
    `\nAAB ready: ${aabPath}\nSize: ${(size / 1024 / 1024).toFixed(1)} MiB\nBuilt: ${mtime.toISOString()}`,
  );
} else {
  console.error('AAB not found after build.');
  process.exit(1);
}
