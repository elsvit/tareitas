// RevenueCat native module + initialization

import Constants from 'expo-constants';
import {
  NativeModules,
  Platform,
  TurboModuleRegistry,
} from 'react-native';

type PurchasesModule = typeof import('react-native-purchases').default;

const androidApiKey =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

const iosApiKey =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;

let cachedModule: PurchasesModule | null | undefined;

export function isRevenueCatNativeModuleAvailable(): boolean {
  // Expo Go cannot load custom native modules.
  if (Constants.executionEnvironment === 'storeClient') {
    return false;
  }

  try {
    const turboModule = TurboModuleRegistry.get?.('RNPurchases');

    if (turboModule != null) {
      return true;
    }
  } catch {
    // Fall through to NativeModules check.
  }

  return Boolean(NativeModules.RNPurchases);
}

export function getPurchasesModule(): PurchasesModule | null {
  if (!isRevenueCatNativeModuleAvailable()) {
    return null;
  }

  if (cachedModule !== undefined) {
    return cachedModule;
  }

  try {
    cachedModule =
      require('react-native-purchases')
        .default as PurchasesModule;
  } catch {
    cachedModule = null;
  }

  return cachedModule;
}

export function initializeRevenueCat() {
  const apiKey =
    Platform.OS === 'android'
      ? androidApiKey
      : iosApiKey;

  if (!apiKey) {
    if (__DEV__) {
      console.warn(
        'TEST_80 __DEV__ [RevenueCat] API key is missing — skipping init',
      );
    }

    return;
  }

  const Purchases = getPurchasesModule();

  if (!Purchases) {
    if (__DEV__) {
      console.warn(
        'TEST_92 __DEV__ [RevenueCat] Native module unavailable — skipping init. Use a development build after installing react-native-purchases.',
      );
    }

    return;
  }

  try {
    Purchases.configure({ apiKey });
  } catch {
    if (__DEV__) {
      console.warn(
        'TEST_105 __DEV__ [RevenueCat] Failed to initialize',
      );
    }
  }
}