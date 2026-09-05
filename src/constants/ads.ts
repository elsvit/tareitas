import { Platform } from 'react-native';

export const ADMOB_ANDROID_APP_ID =
  'ca-app-pub-5022414338280098~9698164642';

export const ADMOB_IOS_APP_ID =
  'ca-app-pub-5022414338280098~6359002088';

// Create a banner ad unit in AdMob for Android, or set EXPO_PUBLIC_ADMOB_BANNER_ID at build time.
export const ADMOB_ANDROID_BANNER_ID =
  'ca-app-pub-5022414338280098/4140032856';

export const ADMOB_IOS_BANNER_ID =
  'ca-app-pub-5022414338280098/5045920410';

export const ADMOB_BANNER_ID = Platform.select({
  android: ADMOB_ANDROID_BANNER_ID,
  ios: ADMOB_IOS_BANNER_ID,
  default: '',
})!;

export const AD_TASK_AMOUNT_START = 10;