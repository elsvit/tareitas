#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

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

console.log('Clearing JS bundler caches (Gradle clean does not remove these)...');
rmrf('node_modules/.cache');
rmrf('.expo');
rmrf('dist');

console.log('Clearing Android build outputs...');
rmrf('android/app/.cxx');
rmrf('android/app/build');
rmrf('android/build');
rmrf('android/.gradle');

run('cd android && ./gradlew clean');

console.log('Embedding a fresh production JS bundle...');
run('npx expo export:embed --eager --platform android --dev false');

console.log('Building release AAB (forcing bundle task to rerun)...');
run(
  'cd android && ./gradlew :app:createBundleReleaseJsAndAssets --rerun-tasks && ./gradlew bundleRelease',
);

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
