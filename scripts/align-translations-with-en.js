#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { sortTranslations } = require('./sort-translation-keys');

const translationsDir = path.join(__dirname, '..', 'src', 'assets', 'translation');
const sourceFile = path.join(translationsDir, 'en.json');

const isObject = value =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function alignToEnglish(englishNode, localeNode) {
  if (typeof englishNode === 'string') {
    return typeof localeNode === 'string' ? localeNode : englishNode;
  }

  if (Array.isArray(englishNode)) {
    return Array.isArray(localeNode) ? localeNode : [...englishNode];
  }

  if (!isObject(englishNode)) {
    return englishNode;
  }

  const localeObject = isObject(localeNode) ? localeNode : {};

  return Object.fromEntries(
    Object.entries(englishNode).map(([key, value]) => [
      key,
      alignToEnglish(value, localeObject[key]),
    ]),
  );
}

const englishJson = sortTranslations(
  JSON.parse(fs.readFileSync(sourceFile, 'utf8')),
);
const sortedEnglishContent = `${JSON.stringify(englishJson, null, 2)}\n`;
const currentEnglishContent = fs.readFileSync(sourceFile, 'utf8');

if (currentEnglishContent !== sortedEnglishContent) {
  fs.writeFileSync(sourceFile, sortedEnglishContent, 'utf8');
  console.log('Sorted en.json');
}

const files = fs
  .readdirSync(translationsDir)
  .filter(file => file.endsWith('.json') && file !== 'en.json')
  .sort();

let changedCount = 0;

for (const file of files) {
  const filePath = path.join(translationsDir, file);
  const localeJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const aligned = alignToEnglish(englishJson, localeJson);
  const nextContent = `${JSON.stringify(aligned, null, 2)}\n`;
  const currentContent = fs.readFileSync(filePath, 'utf8');

  if (currentContent !== nextContent) {
    fs.writeFileSync(filePath, nextContent, 'utf8');
    changedCount += 1;
    console.log(`Aligned ${file}`);
  }
}

console.log(
  changedCount > 0
    ? `Done. Updated ${changedCount} file(s).`
    : 'All translation files already match en.json structure.',
);
