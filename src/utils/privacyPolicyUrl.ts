import { AvailableLanguages, LocalizationService } from '~/services/localization/localization';
import { ELang } from '~/types/ELang';

const PRIVACY_POLICY_BASE_URL = 'https://tareitas.net/privacy-policy';

function isSupportedLang(lang: string | null | undefined): lang is ELang {
  return Boolean(
    lang &&
      lang !== 'unknown' &&
      AvailableLanguages.some(language => language.code === lang),
  );
}

export function resolvePrivacyPolicyLang(
  appLang: ELang | null | undefined,
): string {
  if (isSupportedLang(appLang)) {
    return appLang;
  }

  const deviceLang = LocalizationService.getDeviceLanguage();

  if (isSupportedLang(deviceLang)) {
    return deviceLang;
  }

  return ELang.en;
}

export function getPrivacyPolicyUrl(
  appLang: ELang | null | undefined,
): string {
  const lang = resolvePrivacyPolicyLang(appLang);

  return `${PRIVACY_POLICY_BASE_URL}?lang=${lang}`;
}
