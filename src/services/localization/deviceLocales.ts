import { I18nManager } from 'react-native';

export type DeviceLocaleInfo = {
  languageCode?: string | null;
  languageTag?: string | null;
};

function normalizeLanguageTag(
  localeIdentifier: string | null | undefined,
): string | undefined {
  if (!localeIdentifier) {
    return undefined;
  }

  return localeIdentifier.trim().replace('_', '-');
}

function languageCodeFromTag(tag: string | null | undefined): string | undefined {
  const normalized = normalizeLanguageTag(tag ?? undefined);

  return normalized?.split('-')[0]?.toLowerCase();
}

function getLocalesFromExpoLocalization(): DeviceLocaleInfo[] | null {
  try {
    // Call the native module directly — do not `require('expo-localization')`, which
    // loads ExpoLocalization.native.js and can log a redbox when the pod is missing.
    const { requireNativeModule } = require('expo-modules-core') as {
      requireNativeModule: <T>(name: string) => T;
    };
    const localization = requireNativeModule<{
      getLocales: () => DeviceLocaleInfo[];
    }>('ExpoLocalization');

    const locales = localization.getLocales();

    return locales?.length ? locales : null;
  } catch {
    return null;
  }
}

function getFallbackDeviceLocales(): DeviceLocaleInfo[] {
  const locales: DeviceLocaleInfo[] = [];

  const localeIdentifier = I18nManager.getConstants?.()?.localeIdentifier;
  const i18nTag = normalizeLanguageTag(localeIdentifier);

  if (i18nTag) {
    locales.push({
      languageTag: i18nTag,
      languageCode: languageCodeFromTag(i18nTag),
    });
  }

  try {
    const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    const intlTag = normalizeLanguageTag(intlLocale);

    if (intlTag) {
      locales.push({
        languageTag: intlTag,
        languageCode: languageCodeFromTag(intlTag),
      });
    }
  } catch {
    // Intl may be unavailable in some environments.
  }

  return locales;
}

/** Preferred device locales; works before expo-localization is linked in the dev client. */
export function getDeviceLocales(): DeviceLocaleInfo[] {
  const expoLocales = getLocalesFromExpoLocalization();

  if (expoLocales && expoLocales.length > 0) {
    return expoLocales;
  }

  return getFallbackDeviceLocales();
}
