#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '..', 'src', 'assets', 'translation');
const files = fs
  .readdirSync(translationsDir)
  .filter(file => file.endsWith('.json'))
  .sort();

function flatten(obj, prefix = '') {
  const out = {};

  for (const [key, value] of Object.entries(obj)) {
    const pathKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value, pathKey));
    } else {
      out[pathKey] = value;
    }
  }

  return out;
}

const locales = Object.fromEntries(
  files.map(file => [
    file.replace('.json', ''),
    flatten(JSON.parse(fs.readFileSync(path.join(translationsDir, file), 'utf8'))),
  ]),
);

const en = locales.en;
const enKeys = Object.keys(en);

console.log('Translation audit (reference: en.json)\n');

for (const loc of files.map(file => file.replace('.json', ''))) {
  if (loc === 'en') {
    continue;
  }

  const flat = locales[loc];
  const missing = enKeys.filter(key => !(key in flat));
  const sameAsFr =
    loc === 'fr'
      ? []
      : enKeys.filter(
          key =>
            flat[key] === locales.fr[key] &&
            typeof flat[key] === 'string' &&
            flat[key].length > 2 &&
            flat[key] !== en[key],
        );
  const sameAsEn = enKeys.filter(
    key =>
      flat[key] === en[key] &&
      typeof flat[key] === 'string' &&
      flat[key].length > 3 &&
      !/^[A-Z0-9_]+$/.test(flat[key]),
  );

  if (!missing.length && !sameAsFr.length && !sameAsEn.length) {
    console.log(`${loc}: OK`);
    continue;
  }

  console.log(`${loc}:`);
  if (missing.length) {
    console.log(`  missing keys: ${missing.length}`);
    missing.slice(0, 5).forEach(key => console.log(`    - ${key}`));
    if (missing.length > 5) {
      console.log(`    ... +${missing.length - 5} more`);
    }
  }
  if (sameAsFr.length) {
    console.log(`  same as fr.json: ${sameAsFr.length}`);
    sameAsFr.slice(0, 3).forEach(key => console.log(`    - ${key}: "${String(flat[key]).slice(0, 50)}"`));
    if (sameAsFr.length > 3) {
      console.log(`    ... +${sameAsFr.length - 3} more`);
    }
  }
  if (sameAsEn.length) {
    console.log(`  untranslated (same as en): ${sameAsEn.length}`);
    sameAsEn.slice(0, 3).forEach(key => console.log(`    - ${key}`));
    if (sameAsEn.length > 3) {
      console.log(`    ... +${sameAsEn.length - 3} more`);
    }
  }
  console.log('');
}
