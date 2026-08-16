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
import { I18nManager, NativeModules } from 'react-native';

import { ELang } from '~/types/ELang';
import { esJson, translations } from '~/assets/translation';
import { DEFAULT_DATE_LOCALE, DEFAULT_LANG, FALLBACK_LANG, IS_IOS } from '~/constants/settings';
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

const buildI18nResources = () =>
  Object.fromEntries(
    Object.entries(translations).map(([code, translation]) => [
      code,
      { translation },
    ]),
  );

class LocalizationServiceClass {
  private isInitialized = false;

  private getNativeDeviceLocale = () => {
    let deviceLocale = IS_IOS
      ? NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages[0]
      : NativeModules.I18nManager?.localeIdentifier;
    deviceLocale = deviceLocale?.replace('_', '-');

    return deviceLocale?.split('-')[0];
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

    return locale?.dateLocale ?? DEFAULT_DATE_LOCALE;
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

    let lang: ELang = this.resolveLang(initLang ?? (this.getNativeDeviceLocale() as ELang));
    const isLangAvailable = this.checkIfLangAvailable(lang);
    lang = isLangAvailable ? lang : DEFAULT_LANG;

    const i18nextOptions: InitOptions = {
      resources: buildI18nResources(),
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

  public initSync() {
    if (this.isInitialized) {
      return;
    }

    I18nManager.forceRTL(false);
    I18nManager.allowRTL(false);

    const lang = DEFAULT_LANG;

    i18next.init({
      resources: buildI18nResources(),
      lng: lang,
      fallbackLng: FALLBACK_LANG,
      compatibilityJSON: 'v4',
      returnEmptyString: false,
      returnNull: false,
    });

    setDefaultOptions({ locale: DEFAULT_DATE_LOCALE });

    this.isInitialized = true;
  }

  public async changeLanguage(lang: ELang | null | undefined): Promise<ELang> {
    const resolvedLang = this.resolveLang(lang);
    const langJSON = this.getLangJSON(resolvedLang);

    i18next.addResourceBundle(resolvedLang, 'translation', langJSON, true, true);
    await i18next.changeLanguage(resolvedLang);

    setDefaultOptions({ locale: this.getDateLocale(resolvedLang) });

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
