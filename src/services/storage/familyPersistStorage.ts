import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Storage } from 'redux-persist';

import { EStateName } from '~/store/enums';
import { ESyncMode } from '~/store/settings/enums';

const SHARED_PREFIX = 'persist:shared:';
const DEVICE_ONLY_PREFIX = 'persist:deviceOnly:';
const MULTIDEVICE_PREFIX = 'persist:multidevice:';
const LEGACY_PREFIX = 'persist:';

export const FAMILY_PERSIST_KEYS = [
  EStateName.parents,
  EStateName.children,
  EStateName.tasks,
  EStateName.taskBase,
  EStateName.rewardBase,
  EStateName.taskAssignment,
  EStateName.rewardAssignment,
  EStateName.rewards,
  EStateName.images,
] as const;

function createPrefixedStorage(prefix: string): Storage {
  return {
    getItem: key => AsyncStorage.getItem(`${prefix}${key}`),
    setItem: (key, value) =>
      AsyncStorage.setItem(`${prefix}${key}`, value),
    removeItem: key => AsyncStorage.removeItem(`${prefix}${key}`),
  };
}

export const sharedPersistStorage =
  createPrefixedStorage(SHARED_PREFIX);

export const deviceOnlyFamilyStorage = createPrefixedStorage(
  DEVICE_ONLY_PREFIX,
);

export const multideviceFamilyStorage = createPrefixedStorage(
  MULTIDEVICE_PREFIX,
);

let activeFamilyPersistMode: ESyncMode = ESyncMode.deviceOnly;

export function getActiveFamilyPersistMode(): ESyncMode {
  return activeFamilyPersistMode;
}

export function setActiveFamilyPersistMode(mode: ESyncMode): void {
  activeFamilyPersistMode = mode;
}

export function getFamilyPersistStorageForMode(
  mode: ESyncMode,
): Storage {
  return mode === ESyncMode.multidevice
    ? multideviceFamilyStorage
    : deviceOnlyFamilyStorage;
}

/** Stable reference — delegates reads/writes to the active mode bucket. */
export const modeAwareFamilyStorage: Storage = {
  getItem: key =>
    getFamilyPersistStorageForMode(activeFamilyPersistMode).getItem(
      key,
    ),
  setItem: (key, value) =>
    getFamilyPersistStorageForMode(activeFamilyPersistMode).setItem(
      key,
      value,
    ),
  removeItem: key =>
    getFamilyPersistStorageForMode(activeFamilyPersistMode).removeItem(
      key,
    ),
};

export async function clearFamilyStorageBucket(
  mode: ESyncMode,
): Promise<void> {
  const storage = getFamilyPersistStorageForMode(mode);

  await Promise.all(
    FAMILY_PERSIST_KEYS.map(key => storage.removeItem(key)),
  );
}

export async function migrateLegacyPersistKeys(): Promise<void> {
  const settingsLegacy = await AsyncStorage.getItem(
    `${LEGACY_PREFIX}${EStateName.settings}`,
  );

  if (settingsLegacy) {
    const sharedSettings = await sharedPersistStorage.getItem(
      EStateName.settings,
    );

    if (!sharedSettings) {
      await sharedPersistStorage.setItem(
        EStateName.settings,
        settingsLegacy,
      );
    }
  }

  for (const key of FAMILY_PERSIST_KEYS) {
    const legacyValue = await AsyncStorage.getItem(
      `${LEGACY_PREFIX}${key}`,
    );

    if (!legacyValue) {
      continue;
    }

    const deviceOnlyValue = await deviceOnlyFamilyStorage.getItem(key);

    if (!deviceOnlyValue) {
      await deviceOnlyFamilyStorage.setItem(key, legacyValue);
    }
  }
}
