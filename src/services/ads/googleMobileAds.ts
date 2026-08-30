import Constants from 'expo-constants';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

import { ADMOB_BANNER_ID } from '~/constants/admob';

type GoogleMobileAdsModule = typeof import('react-native-google-mobile-ads');

let cachedModule: GoogleMobileAdsModule | null | undefined;
let initPromise: Promise<void> | null = null;

export function isGoogleMobileAdsNativeModuleAvailable(): boolean {
  if (Platform.OS === 'web') {
    return false;
  }

  // Expo Go cannot load custom native modules.
  if (Constants.executionEnvironment === 'storeClient') {
    return false;
  }

  try {
    const turboModule = TurboModuleRegistry.get?.('RNGoogleMobileAdsModule');

    if (turboModule != null) {
      return true;
    }
  } catch {
    // Fall through to NativeModules check.
  }

  return Boolean(NativeModules.RNGoogleMobileAdsModule);
}

export function getGoogleMobileAdsModule(): GoogleMobileAdsModule | null {
  if (!isGoogleMobileAdsNativeModuleAvailable()) {
    return null;
  }

  if (cachedModule !== undefined) {
    return cachedModule;
  }

  try {
    cachedModule = require('react-native-google-mobile-ads') as GoogleMobileAdsModule;
  } catch {
    cachedModule = null;
  }

  return cachedModule;
}

export function initializeGoogleMobileAds(): Promise<void> {
  if (!isGoogleMobileAdsNativeModuleAvailable()) {
    return Promise.resolve();
  }

  if (!initPromise) {
    initPromise = (async () => {
      const adsModule = getGoogleMobileAdsModule();

      if (!adsModule) {
        return;
      }

      try {
        await adsModule.default().initialize();
      } catch {
        // Native module missing or failed to initialize — ads stay disabled.
      }
    })();
  }

  return initPromise;
}

function isPlaceholderAdUnitId(unitId: string): boolean {
  return /x{4,}/i.test(unitId);
}

export function getBannerAdUnitId(): string | null {
  const adsModule = getGoogleMobileAdsModule();

  if (!adsModule) {
    return null;
  }

  if (__DEV__) {
    return adsModule.TestIds.BANNER;
  }

  const envBannerId = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID?.trim();
  const configuredBannerId = envBannerId || ADMOB_BANNER_ID;

  if (!configuredBannerId || isPlaceholderAdUnitId(configuredBannerId)) {
    // Release builds need a real ad unit ID in admob.ts or EXPO_PUBLIC_ADMOB_BANNER_ID.
    return adsModule.TestIds.BANNER;
  }

  return configuredBannerId;
}
