#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '..', 'src', 'assets', 'translation');

const isObject = value =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Sort nested translation objects:
 * - "title" first (when present)
 * - string keys alphabetically
 * - nested objects alphabetically (each sorted recursively)
 *
 * Root-level sections (common, tasks, habits, …) keep their existing order.
 */
function sortTranslationNode(node) {
  if (!isObject(node)) {
    return node;
  }

  const entries = Object.entries(node);
  const titleEntry = entries.find(([key]) => key === 'title');
  const stringEntries = entries.filter(
    ([key, value]) => key !== 'title' && typeof value === 'string',
  );
  const objectEntries = entries.filter(
    ([key, value]) =>
      key !== 'title' && isObject(value) && !Array.isArray(value),
  );

  stringEntries.sort(([a], [b]) => a.localeCompare(b));
  objectEntries.sort(([a], [b]) => a.localeCompare(b));

  const sortedEntries = [
    ...(titleEntry ? [titleEntry] : []),
    ...stringEntries,
    ...objectEntries.map(([key, value]) => [key, sortTranslationNode(value)]),
  ];

  return Object.fromEntries(sortedEntries);
}

function sortTranslations(json) {
  if (!isObject(json)) {
    return json;
  }

  return Object.fromEntries(
    Object.entries(json).map(([sectionKey, sectionValue]) => [
      sectionKey,
      isObject(sectionValue) ? sortTranslationNode(sectionValue) : sectionValue,
    ]),
  );
}

function sortTranslationFile(filePath) {
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const sorted = sortTranslations(json);
  const nextContent = `${JSON.stringify(sorted, null, 2)}\n`;
  const currentContent = fs.readFileSync(filePath, 'utf8');

  if (currentContent !== nextContent) {
    fs.writeFileSync(filePath, nextContent, 'utf8');
    return true;
  }

  return false;
}

module.exports = {
  sortTranslationNode,
  sortTranslations,
};

if (require.main === module) {
  const targetFile = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(translationsDir, 'en.json');

  if (sortTranslationFile(targetFile)) {
    console.log(`Sorted ${path.relative(process.cwd(), targetFile)}`);
  } else {
    console.log(`Already sorted: ${path.relative(process.cwd(), targetFile)}`);
  }
}
