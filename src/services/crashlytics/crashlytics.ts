import Constants from 'expo-constants';

import type { Crashlytics } from '@react-native-firebase/crashlytics';

type FirebaseCrashlyticsModule =
  typeof import('@react-native-firebase/crashlytics');

let cachedModule: FirebaseCrashlyticsModule | null | undefined;
let cachedInstance: Crashlytics | null | undefined;

function getCrashlyticsContext(): {
  mod: FirebaseCrashlyticsModule;
  instance: Crashlytics;
} | null {
  if (cachedModule !== undefined) {
    if (!cachedModule || !cachedInstance) {
      return null;
    }

    return { mod: cachedModule, instance: cachedInstance };
  }

  // Production release builds only — skip dev, Expo Go, and local dev clients.
  if (__DEV__ || Constants.executionEnvironment === 'storeClient') {
    cachedModule = null;
    cachedInstance = null;
    return null;
  }

  try {
    const mod =
      require('@react-native-firebase/crashlytics') as FirebaseCrashlyticsModule;
    cachedModule = mod;
    cachedInstance = mod.getCrashlytics();

    return { mod, instance: cachedInstance };
  } catch {
    cachedModule = null;
    cachedInstance = null;
    return null;
  }
}

function runCrashlytics(
  action: (ctx: {
    mod: FirebaseCrashlyticsModule;
    instance: Crashlytics;
  }) => void,
): void {
  const ctx = getCrashlyticsContext();

  if (!ctx) {
    return;
  }

  try {
    action(ctx);
  } catch {
    // Crashlytics must never break user actions.
  }
}

export type PersistedSliceParseFailureReason =
  | 'json_parse_error'
  | 'empty_after_parse';

function toError(error: unknown, fallbackMessage: string): Error {
  return error instanceof Error ? error : new Error(fallbackMessage);
}

export function recordCrashlyticsError(
  jsErrorName: string,
  error: unknown,
  attributes?: Record<string, string>,
): void {
  if (__DEV__) {
    console.error(`[Tareitas] ${jsErrorName}`, attributes ?? {}, error);
    return;
  }

  runCrashlytics(({ mod, instance }) => {
    if (attributes) {
      mod.setAttributes(instance, attributes);
    }

    mod.recordError(
      instance,
      toError(error, jsErrorName),
      jsErrorName,
    );
  });
}

export function recordPersistedSliceParseFailure(
  key: string,
  reason: PersistedSliceParseFailureReason,
  options?: { error?: unknown; rawLength?: number },
): void {
  recordCrashlyticsError(
    'persisted_slice_parse_failure',
    options?.error ??
      new Error(`Persisted slice parse failed: ${key} (${reason})`),
    {
      persist_slice_key: key,
      persist_parse_reason: reason,
      persist_raw_length: String(options?.rawLength ?? 0),
    },
  );
}
