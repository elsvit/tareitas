const fs = require('fs');
const path = require('path');

const MARKER_START = '# --- production embed env (yarn prepare-ios-prod-archive) ---';
const MARKER_END = '# --- end production embed env ---';

function shellExport(key, value) {
  const escaped = String(value).replace(/'/g, "'\\''");
  return `export ${key}='${escaped}'`;
}

function extractNodeBinaryLine(content) {
  for (const line of content.split('\n')) {
    if (/^export NODE_BINARY=/.test(line.trim())) {
      return line.trim();
    }
  }

  return null;
}

function stripProductionBlock(content) {
  const start = content.indexOf(MARKER_START);
  if (start === -1) {
    return content.trimEnd();
  }

  const end = content.indexOf(MARKER_END, start);
  if (end === -1) {
    return content.slice(0, start).trimEnd();
  }

  return (
    content.slice(0, start) + content.slice(end + MARKER_END.length)
  ).trimEnd();
}

function stripNodeBinaryLines(content) {
  return content
    .split('\n')
    .filter(line => !/^export NODE_BINARY=/.test(line.trim()))
    .join('\n')
    .trimEnd();
}

/**
 * Writes ios/.xcode.env.local so Xcode Archive uses .env.production (EXPO_NO_DOTENV=1).
 * Preserves an existing export NODE_BINARY= line.
 */
function writeIosXcodeProductionEnv(projectRoot, envEntries) {
  const iosDir = path.join(projectRoot, 'ios');
  const targetPath = path.join(iosDir, '.xcode.env.local');

  if (!fs.existsSync(iosDir)) {
    throw new Error(
      'ios/ not found. Run npx expo prebuild first, then try again.',
    );
  }

  let existing = '';
  if (fs.existsSync(targetPath)) {
    existing = fs.readFileSync(targetPath, 'utf8');
  }

  const nodeBinary =
    extractNodeBinaryLine(existing)
    ?? 'export NODE_BINARY=$(command -v node)';

  const base = stripNodeBinaryLines(stripProductionBlock(existing));
  const productionBlock = [
    MARKER_START,
    '# Loaded from .env.production; Expo skips other .env* files during export:embed.',
    shellExport('EXPO_NO_DOTENV', '1'),
    ...envEntries.map(({ key, value }) => shellExport(key, value)),
    MARKER_END,
  ].join('\n');

  const parts = [base, nodeBinary, productionBlock].filter(
    section => section && section.trim().length > 0,
  );

  const nextContent = `${parts.join('\n\n')}\n`;
  fs.writeFileSync(targetPath, nextContent, 'utf8');

  return targetPath;
}

module.exports = {
  writeIosXcodeProductionEnv,
  MARKER_START,
};
