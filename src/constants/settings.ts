import { enGB, es } from 'date-fns/locale';
import { Appearance, Platform } from 'react-native';
import { ELang } from '~/types/ELang';

export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';
export const IS_WEB = Platform.OS === 'web';

export const isDark = Appearance.getColorScheme() === 'dark'; // 'light' | 'dark' | null | undefined;

export const DEFAULT_LANG = IS_ANDROID ? ELang.es : ELang.en;
export const FALLBACK_LANG = IS_ANDROID ? ELang.es : ELang.en;
export const DEFAULT_DATE_LOCALE = IS_ANDROID ? es : enGB;

