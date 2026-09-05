#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const translationsDir = path.join(projectRoot, 'src', 'assets', 'translation');
const repairsFile = path.join(__dirname, 'translation-repairs.json');

function setByPath(target, keyPath, value) {
  const parts = keyPath.split('.');
  let current = target;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

function applyRepairs(locale, repairs) {
  const filePath = path.join(translationsDir, `${locale}.json`);
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const [keyPath, value] of Object.entries(repairs)) {
    setByPath(json, keyPath, value);
  }

  fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
}

const repairs = JSON.parse(fs.readFileSync(repairsFile, 'utf8'));

for (const locale of Object.keys(repairs)) {
  applyRepairs(locale, repairs[locale]);
  console.log(`Applied ${Object.keys(repairs[locale]).length} repairs to ${locale}.json`);
}
