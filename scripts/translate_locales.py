#!/usr/bin/env python3
"""Translate locale JSON files from en.json using Google Translate."""

import json
import re
import sys
import time
from pathlib import Path
from typing import List, Tuple

sys.path.insert(0, str(Path(__file__).parent / '.pydeps'))

from deep_translator import GoogleTranslator

ROOT = Path(__file__).parent.parent / 'src' / 'assets' / 'translation'
SOURCE = ROOT / 'en.json'
SKIP = {'en', 'es'}

LANGUAGE_NAMES = {
    # 'bg': 'Български',
    # 'cs': 'Čeština',
    'da': 'Dansk',
    'de': 'Deutsch',
    # 'el': 'Ελληνικά',
    # 'et': 'Eesti',
    # 'fi': 'Suomi',    
    'fr': 'Français',
    # 'ga': 'Gaeilge',
    # 'hr': 'Hrvatski',
    # 'hu': 'Magyar',
    'it': 'Italiano',
    # 'lt': 'Lietuvių',
    # 'lv': 'Latviešu',
    # 'mt': 'Malti',
    'nl': 'Nederlands',
    # 'pl': 'Polski',
    'pt': 'Português',
    # 'ro': 'Română',
    # 'sk': 'Slovenčina',
    # 'sl': 'Slovenščina',
    # 'sv': 'Svenska',
    'uk': 'Українська',
}

PLACEHOLDER_RE = re.compile(r'\{\{[^}]+\}\}')

# Google Translate target codes (ga = Irish)
TARGET_CODES = {code: code for code in JSON_LANGUAGE_NAMES}


def protect_placeholders(text: str) -> Tuple[str, List[str]]:
    placeholders = PLACEHOLDER_RE.findall(text)
    protected = text
    for index, placeholder in enumerate(placeholders):
        protected = protected.replace(placeholder, f'__PH_{index}__', 1)
    return protected, placeholders


def restore_placeholders(text: str, placeholders: List[str]) -> str:
    restored = text
    for index, placeholder in enumerate(placeholders):
        restored = restored.replace(f'__PH_{index}__', placeholder)
        restored = restored.replace(f'{{{{PH_{index}}}}}', placeholder)
    return restored


def collect_strings(obj, path=()):
    items = []
    if isinstance(obj, dict):
        for key, value in obj.items():
            items.extend(collect_strings(value, path + (key,)))
    elif isinstance(obj, str):
        items.append((path, obj))
    return items


def set_at_path(obj, path, value):
    current = obj
    for key in path[:-1]:
        current = current[key]
    current[path[-1]] = value


def translate_text(text: str, translator: GoogleTranslator) -> str:
    if not text.strip():
        return text

    protected, placeholders = protect_placeholders(text)

    for attempt in range(3):
        try:
            translated = translator.translate(protected)
            return restore_placeholders(translated, placeholders)
        except Exception as error:
            if attempt == 2:
                raise error
            time.sleep(1.5 * (attempt + 1))

    return text


def translate_file(lang_code: str, source_data: dict) -> dict:
    translator = GoogleTranslator(source='en', target=TARGET_CODES[lang_code])
    result = json.loads(json.dumps(source_data))
    result['jsonLanguage'] = JSON_LANGUAGE_NAMES[lang_code]

    strings = collect_strings(result)
    total = len(strings)

    for index, (path, value) in enumerate(strings):
        if path == ('jsonLanguage',):
            continue

        translated = translate_text(value, translator)
        set_at_path(result, path, translated)

        if (index + 1) % 25 == 0 or index + 1 == total:
            print(f'  [{lang_code}] {index + 1}/{total}', flush=True)

        time.sleep(0.05)

    return result


def main():
    with SOURCE.open(encoding='utf-8') as file:
        source_data = json.load(file)

    for lang_code in sorted(JSON_LANGUAGE_NAMES):
        if lang_code in SKIP:
            continue

        output_path = ROOT / f'{lang_code}.json'
        print(f'Translating {lang_code} -> {output_path.name}', flush=True)

        translated = translate_file(lang_code, source_data)

        with output_path.open('w', encoding='utf-8') as file:
            json.dump(translated, file, ensure_ascii=False, indent=2)
            file.write('\n')

    print('Done.', flush=True)


if __name__ == '__main__':
    main()
