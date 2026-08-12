import { setDefaultOptions } from 'date-fns';
import { es } from 'date-fns/locale';
import i18next, { InitOptions } from 'i18next';
import { I18nManager, NativeModules } from 'react-native';

import { DEFAULT_DATE_LOCALE, DEFAULT_LANG, FALLBACK_LANG, IS_IOS, } from '~/constants/settings';
import { IAvailableLanguages, KeyOfJson } from '~/types/ILang';
import { ELang } from '~/types/ELang';


import enJson from '~/assets/translation/en.json';
import esJson from '~/assets/translation/es.json';

export const AvailableLanguages: IAvailableLanguages[] = [
  {
    name: 'Español',
    code: ELang.es,
    dateLocale: es,
  },
  {
    name: 'English',
    code: ELang.en,
    dateLocale: undefined,
  },
];

class LocalizationServiceClass {
  private isInitialized = false;

  private getNativeDeviceLocale = () => {
    let deviceLocale = IS_IOS
      ? NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages[0]
      : NativeModules.I18nManager?.localeIdentifier; // "fr_FR"
    deviceLocale = deviceLocale?.replace('_', '-');

    return deviceLocale;
  };

  private checkIfLangAvailable = (lang: string | undefined) => {
    if (!lang) {
      return false;
    }

    return AvailableLanguages.some(val => val.code === lang);
  };

  private getDateLocale = (lang: string | undefined) => {
    if (!lang || !this.checkIfLangAvailable(lang)) {
      return DEFAULT_DATE_LOCALE;
    }

    const locale = AvailableLanguages.find(val => val.code === lang);
    return locale?.dateLocale;
  };

  private getLangJSON = (lang: ELang) => {
    return lang === ELang.en ? enJson : esJson;
  };

  public init = async (initLang?: ELang) => {
    // If already initialized, just change language
    if (this.isInitialized) {
      return this.changeLanguage(initLang || DEFAULT_LANG);
    }

    I18nManager.forceRTL(false);
    I18nManager.allowRTL(false);

    let lang: ELang = initLang || this.getNativeDeviceLocale();
    const isLangAvailable = lang && this.checkIfLangAvailable(lang);
    lang = isLangAvailable ? lang : DEFAULT_LANG;

    const langJSON = this.getLangJSON(lang);
    const i18nextOptions: InitOptions = {
      resources: {
        [lang]: { translation: langJSON },
        [FALLBACK_LANG]: { translation: esJson },
      },
      lng: lang,
      fallbackLng: FALLBACK_LANG,
      compatibilityJSON: 'v4',
      returnEmptyString: false,
      returnNull: false,
    };

    await i18next.init(i18nextOptions);
    this.isInitialized = true;

    setDefaultOptions({ locale: this.getDateLocale(lang) });

    return lang;
  };

  // Initialize immediately with default language
  public initSync() {
    if (this.isInitialized) return;

    I18nManager.forceRTL(false);
    I18nManager.allowRTL(false);

    const lang = DEFAULT_LANG;
    const langJSON = this.getLangJSON(lang);

    i18next.init({
      resources: {
        [lang]: { translation: langJSON },
      },
      lng: lang,
      fallbackLng: FALLBACK_LANG,
      compatibilityJSON: 'v4',
      returnEmptyString: false,
      returnNull: false,
    });

    setDefaultOptions({ locale: DEFAULT_DATE_LOCALE });

    this.isInitialized = true;
  }

  public async changeLanguage(lang: ELang) {
    // const langJSON = await this.loadLangFile(lang);
    const langJSON = this.getLangJSON(lang);
    await i18next.addResourceBundle(lang, 'translation', langJSON, true, true);

    await i18next.changeLanguage(lang);

    setDefaultOptions({ locale: this.getDateLocale(lang) });
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
    translation.includes('.')
  ) {
    return options.translationIfError;
  }
  return translation;
};
