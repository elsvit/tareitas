#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const translationsDir = path.join(projectRoot, 'src', 'assets', 'translation');
const sourceFile = path.join(translationsDir, 'en.json');
const targetFile = path.join(translationsDir, 'es.json');
const suggestionPrefix = '[TODO: es] ';
const ignoredSuggestionKeys = new Set(['jsonLanguage']);

const readJson = (filePath, { fallbackValue } = {}) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    if (fallbackValue !== undefined) {
      console.warn(`Could not parse ${path.relative(projectRoot, filePath)}: ${error.message}`);
      return fallbackValue;
    }

    throw error;
  }
};

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const createSuggestion = (keyPath, englishValue) => {
  if (ignoredSuggestionKeys.has(keyPath.join('.'))) {
    return 'Español';
  }

  return `${suggestionPrefix}${englishValue}`;
};

const isAutoSuggestion = (value) => typeof value === 'string' && value.startsWith(suggestionPrefix);

const syncNode = (englishNode, spanishNode, keyPath = []) => {
  if (typeof englishNode === 'string') {
    if (typeof spanishNode === 'string' && !isAutoSuggestion(spanishNode)) {
      return spanishNode;
    }

    return createSuggestion(keyPath, englishNode);
  }

  if (Array.isArray(englishNode)) {
    return Array.isArray(spanishNode) ? spanishNode : [...englishNode];
  }

  if (!isObject(englishNode)) {
    return englishNode;
  }

  const nextSpanishNode = isObject(spanishNode) ? spanishNode : {};

  return Object.fromEntries(
    Object.entries(englishNode).map(([key, value]) => [
      key,
      syncNode(value, nextSpanishNode[key], [...keyPath, key]),
    ])
  );
};

const writeJson = (filePath, json) => {
  const nextContent = `${JSON.stringify(json, null, 2)}\n`;
  const currentContent = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, 'utf8')
    : null;

  if (currentContent === nextContent) {
    return false;
  }

  fs.writeFileSync(filePath, nextContent, 'utf8');
  return true;
};

const syncTranslations = () => {
  const englishJson = readJson(sourceFile);
  const spanishJson = fs.existsSync(targetFile)
    ? readJson(targetFile, { fallbackValue: {} })
    : {};
  const nextSpanishJson = syncNode(englishJson, spanishJson);

  const didWrite = writeJson(targetFile, nextSpanishJson);

  if (didWrite) {
    console.log(`Synchronized ${path.relative(projectRoot, targetFile)} from ${path.relative(projectRoot, sourceFile)}`);
  }
};

const watchTranslations = () => {
  let debounceTimer;
  let lastRunFailed = false;

  const runSync = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try {
        syncTranslations();
        lastRunFailed = false;
      } catch (error) {
        lastRunFailed = true;
        console.error(`Translation sync failed: ${error.message}`);
      }
    }, 100);
  };

  runSync();

  fs.watch(translationsDir, (_eventType, filename) => {
    if (filename === path.basename(sourceFile)) {
      runSync();
    }
  });

  console.log(`Watching ${path.relative(projectRoot, sourceFile)} for changes...`);

  process.on('SIGINT', () => process.exit(lastRunFailed ? 1 : 0));
  process.on('SIGTERM', () => process.exit(lastRunFailed ? 1 : 0));
};

if (process.argv.includes('--watch')) {
  watchTranslations();
} else {
  syncTranslations();
}
