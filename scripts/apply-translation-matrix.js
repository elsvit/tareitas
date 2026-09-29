#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '..', 'src', 'assets', 'translation');
const matrixPath = path.join(__dirname, 'translation-matrix.json');
const sourceFile = path.join(translationsDir, 'en.json');

const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const englishJson = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

const isObject = value =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function flatten(obj, prefix = '') {
  const out = {};

  for (const [key, value] of Object.entries(obj)) {
    const pathKey = prefix ? `${prefix}.${key}` : key;

    if (isObject(value)) {
      Object.assign(out, flatten(value, pathKey));
    } else {
      out[pathKey] = value;
    }
  }

  return out;
}

function setByPath(obj, pathKey, value) {
  const parts = pathKey.split('.');
  let current = obj;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];

    if (!isObject(current[part])) {
      current[part] = {};
    }

    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

function shouldReplace(englishValue, currentValue) {
  if (currentValue === undefined) {
    return true;
  }

  if (typeof currentValue !== 'string') {
    return false;
  }

  if (currentValue.startsWith('[TODO:')) {
    return true;
  }

  return currentValue === englishValue;
}

const englishFlat = flatten(englishJson);
const localeFiles = fs
  .readdirSync(translationsDir)
  .filter(file => file.endsWith('.json') && file !== 'en.json')
  .sort();

let updatedFiles = 0;
let replacedCount = 0;

for (const file of localeFiles) {
  const locale = file.replace('.json', '');
  const filePath = path.join(translationsDir, file);
  const localeJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const localeFlat = flatten(localeJson);
  let fileChanged = false;

  for (const [key, localeValues] of Object.entries(matrix)) {
    const translation = localeValues[locale];

    if (typeof translation !== 'string') {
      continue;
    }

    const englishValue = englishFlat[key];

    if (typeof englishValue !== 'string') {
      continue;
    }

    const currentValue = localeFlat[key];

    if (!shouldReplace(englishValue, currentValue)) {
      continue;
    }

    setByPath(localeJson, key, translation);
    fileChanged = true;
    replacedCount += 1;
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, `${JSON.stringify(localeJson, null, 2)}\n`, 'utf8');
    updatedFiles += 1;
    console.log(`Updated ${file}`);
  }
}

console.log(
  updatedFiles > 0
    ? `Done. Updated ${updatedFiles} file(s), ${replacedCount} string(s).`
    : 'No translation files needed updates.',
);
