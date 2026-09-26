import { ELang } from '~/types/ELang';
import { resolvePrivacyPolicyLang } from '~/utils/privacyPolicyUrl';

const LOGIN_SIGNUP_HELP_BASE_URL =
  'https://tareitas.net/help-center/login-signup';

export function getLoginSignupHelpUrl(
  appLang: ELang | null | undefined,
): string {
  const lang = resolvePrivacyPolicyLang(appLang);

  return `${LOGIN_SIGNUP_HELP_BASE_URL}?lang=${lang}`;
}
