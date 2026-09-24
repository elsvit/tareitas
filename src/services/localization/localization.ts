import { Locale, setDefaultOptions } from 'date-fns';
import {
  bg as bgDateLocale,
  cs as csDateLocale,
  da as daDateLocale,
  de as deDateLocale,
  el as elDateLocale,
  enGB as enDateLocale,
  es as esDateLocale,
  et as etDateLocale,
  fi as fiDateLocale,
  fr as frDateLocale,
  hr as hrDateLocale,
  hu as huDateLocale,
  it as itDateLocale,
  lt as ltDateLocale,
  lv as lvDateLocale,
  nl as nlDateLocale,
  pl as plDateLocale,
  pt as ptDateLocale,
  ro as roDateLocale,
  sk as skDateLocale,
  sl as slDateLocale,
  sv as svDateLocale,
  uk as ukDateLocale,
} from 'date-fns/locale';
import i18next, { InitOptions } from 'i18next';
import { I18nManager } from 'react-native';

import { ELang } from '~/types/ELang';
import { getDeviceLocales } from '~/services/localization/deviceLocales';
import { esJson, translations } from '~/assets/translation';
import { DEFAULT_DATE_LOCALE, DEFAULT_LANG, FALLBACK_LANG } from '~/constants/settings';
import { setAnalyticsLanguage } from '~/services/analytics';
import { setApiLang } from '~/services/api/lang';
import { IAvailableLanguages, KeyOfJson } from '~/types/ILang';

const defineLanguage = (
  code: string,
  name: string,
  dateLocale: Locale,
): IAvailableLanguages => ({
  code: code as ELang,
  name,
  dateLocale,
});

const LANGUAGE_DEFINITIONS: IAvailableLanguages[] = [
  defineLanguage('cs', 'Čeština', csDateLocale),
  defineLanguage('da', 'Dansk', daDateLocale),
  defineLanguage('de', 'Deutsch', deDateLocale),
  defineLanguage('en', 'English', enDateLocale),
  defineLanguage('es', 'Español', esDateLocale),
  defineLanguage('el', 'Ελληνικά', elDateLocale),
  defineLanguage('et', 'Eesti', etDateLocale),
  defineLanguage('fr', 'Français', frDateLocale),
  defineLanguage('hr', 'Hrvatski', hrDateLocale),
  defineLanguage('it', 'Italiano', itDateLocale),
  defineLanguage('lt', 'Lietuvių', ltDateLocale),
  defineLanguage('lv', 'Latviešu', lvDateLocale),
  defineLanguage('hu', 'Magyar', huDateLocale),
  defineLanguage('nl', 'Nederlands', nlDateLocale),
  defineLanguage('pl', 'Polski', plDateLocale),
  defineLanguage('pt', 'Português', ptDateLocale),
  defineLanguage('ro', 'Română', roDateLocale),
  defineLanguage('sk', 'Slovenčina', skDateLocale),
  defineLanguage('sl', 'Slovenščina', slDateLocale),
  defineLanguage('fi', 'Suomi', fiDateLocale),
  defineLanguage('sv', 'Svenska', svDateLocale),
  defineLanguage('bg', 'Български', bgDateLocale),
  defineLanguage('uk', 'Українська', ukDateLocale),
];

export const AvailableLanguages: IAvailableLanguages[] = [...LANGUAGE_DEFINITIONS].sort(
  (left, right) => left.name.localeCompare(right.name),
);

const SUPPORTED_LANG_CODES = new Set<ELang>(
  AvailableLanguages.map(language => language.code),
);

function normalizeLanguageCode(code: string | null | undefined): string | undefined {
  if (!code) {
    return undefined;
  }

  const normalized = code.trim().replace('_', '-').toLowerCase();

  return normalized.split('-')[0];
}

function isSupportedLanguageCode(code: string | undefined): code is ELang {
  return Boolean(code && SUPPORTED_LANG_CODES.has(code as ELang));
}

function languageCodeFromLocaleIdentifier(
  localeIdentifier: string | null | undefined,
): string | undefined {
  return normalizeLanguageCode(localeIdentifier);
}

/** First app-supported language from the device preferred locale list. */
export function getSupportedDeviceLanguage(): ELang | null {
  for (const locale of getDeviceLocales()) {
    const candidates = [locale.languageCode, locale.languageTag];

    for (const candidate of candidates) {
      const code = normalizeLanguageCode(candidate);

      if (isSupportedLanguageCode(code)) {
        return code;
      }
    }
  }

  const localeIdentifier = I18nManager.getConstants?.()?.localeIdentifier;
  const fromI18nManager = languageCodeFromLocaleIdentifier(localeIdentifier);

  if (isSupportedLanguageCode(fromI18nManager)) {
    return fromI18nManager;
  }

  try {
    const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    const fromIntl = languageCodeFromLocaleIdentifier(intlLocale);

    if (isSupportedLanguageCode(fromIntl)) {
      return fromIntl;
    }
  } catch {
    // Intl may be unavailable in some environments.
  }

  return null;
}

/**
 * Boot language: device preferred language first, then Spanish fallback.
 * Stored language applies only after the user picks a language in Settings.
 */
export function resolveInitialAppLanguage(options: {
  storedLang: ELang | null;
  langUserSelected?: boolean;
}): ELang {
  const deviceLang = getSupportedDeviceLanguage();
  const userPinnedLanguage =
    options.langUserSelected &&
    options.storedLang &&
    isSupportedLanguageCode(options.storedLang);

  if (userPinnedLanguage) {
    return options.storedLang as ELang;
  }

  return deviceLang ?? DEFAULT_LANG;
}

export const getDateLocaleForLang = (lang: ELang | null | undefined): Locale => {
  if (!lang) {
    return DEFAULT_DATE_LOCALE;
  }

  return (
    AvailableLanguages.find(language => language.code === lang)?.dateLocale ??
    DEFAULT_DATE_LOCALE
  );
};

const buildI18nResources = () =>
  Object.fromEntries(
    Object.entries(translations).map(([code, translation]) => [
      code,
      { translation },
    ]),
  );

class LocalizationServiceClass {
  private isInitialized = false;

  public getDeviceLanguage = (): string => {
    const supported = getSupportedDeviceLanguage();

    if (supported) {
      return supported;
    }

    const primaryLocale = getDeviceLocales()[0];
    const primaryCode = normalizeLanguageCode(
      primaryLocale?.languageCode ?? primaryLocale?.languageTag,
    );

    return primaryCode ?? 'unknown';
  };

  private checkIfLangAvailable = (lang: string | undefined) => {
    if (!lang) {
      return false;
    }

    return AvailableLanguages.some(val => val.code === lang);
  };

  private getDateLocale = (lang: string | undefined) => {
    return getDateLocaleForLang(lang as ELang | undefined);
  };

  private getLangJSON = (lang: ELang) => translations[lang] ?? translations[FALLBACK_LANG];

  private resolveLang = (lang: ELang | null | undefined): ELang => {
    if (lang && this.checkIfLangAvailable(lang)) {
      return lang;
    }

    return DEFAULT_LANG;
  };

  public init = async (initLang?: ELang | null) => {
    if (this.isInitialized) {
      return this.changeLanguage(this.resolveLang(initLang));
    }

    I18nManager.forceRTL(false);
    I18nManager.allowRTL(false);

    const bootLang =
      initLang ?? getSupportedDeviceLanguage() ?? DEFAULT_LANG;
    let lang: ELang = this.resolveLang(bootLang);
    const isLangAvailable = this.checkIfLangAvailable(lang);
    lang = isLangAvailable ? lang : DEFAULT_LANG;

    const i18nextOptions: InitOptions = {
      resources: buildI18nResources(),
      lng: lang,
      fallbackLng: FALLBACK_LANG,
      compatibilityJSON: 'v4',
      returnEmptyString: false,
      returnNull: false,
      interpolation: {
        escapeValue: false,
      },
    };

    await i18next.init(i18nextOptions);
    this.isInitialized = true;

    void setAnalyticsLanguage(lang);

    setApiLang(lang);
    setDefaultOptions({ locale: this.getDateLocale(lang) });

    return lang;
  };

  public initSync() {
    if (this.isInitialized) {
      return;
    }

    I18nManager.forceRTL(false);
    I18nManager.allowRTL(false);

    const lang = getSupportedDeviceLanguage() ?? DEFAULT_LANG;

    i18next.init({
      resources: buildI18nResources(),
      lng: lang,
      fallbackLng: FALLBACK_LANG,
      compatibilityJSON: 'v4',
      returnEmptyString: false,
      returnNull: false,
      interpolation: {
        escapeValue: false,
      },
    });

    setDefaultOptions({ locale: this.getDateLocale(lang) });

    setApiLang(lang);
    void setAnalyticsLanguage(lang);
    this.isInitialized = true;
  }

  public async changeLanguage(lang: ELang | null | undefined): Promise<ELang> {
    const resolvedLang = this.resolveLang(lang);
    const langJSON = this.getLangJSON(resolvedLang);

    i18next.addResourceBundle(resolvedLang, 'translation', langJSON, true, true);
    await i18next.changeLanguage(resolvedLang);

    setApiLang(resolvedLang);
    setDefaultOptions({ locale: this.getDateLocale(resolvedLang) });

    void setAnalyticsLanguage(resolvedLang);

    return resolvedLang;
  }
}

export const LocalizationService = new LocalizationServiceClass();

LocalizationService.initSync();

export type TranslationKey = KeyOfJson<typeof esJson>;

export const t = (
  translationKey: TranslationKey,
  vars?: Record<string, string | number> | Record<string, unknown>,
  options?: { translationIfError?: string },
) => {
  const translation = i18next.t(translationKey, vars);
  if (
    options?.translationIfError &&
    translationKey === translation &&
    typeof translation === 'string' &&
    translation.includes('.')
  ) {
    return options.translationIfError;
  }
  return translation;
};
