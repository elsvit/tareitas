import { ELang } from '~/types/ELang';

import { DEFAULT_LANG } from '~/constants/settings';

let currentApiLang: ELang = DEFAULT_LANG;

export function setApiLang(lang: ELang) {
  currentApiLang = lang;
}

export function getApiLang(): ELang {
  return currentApiLang;
}
