import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Storage } from 'redux-persist';

import { EStateName } from '~/store/enums';
import { ESyncMode } from '~/store/settings/enums';
import type { IStateSettings } from '~/store/settings/types';

/**
 * Local persistence layout:
 *
 * - **sharedPersistStorage** (`persist:shared:`) — settings only (syncMode, familyId,
 *   currentUser, tokens, etc.). Same bucket for deviceOnly and multidevice.
 *
 * - **deviceOnlyFamilyStorage** (`persist:deviceOnly:`) — family slices when
 *   syncMode is deviceOnly (parents, children, tasks, images, …).
 *
 * - **multideviceFamilyStorage** (`persist:multidevice:`) — family slices when
 *   syncMode is multidevice.
 *
 * Never mix family data between the two family buckets. Always read settings.syncMode
 * from shared storage, then load/save family slices from the matching bucket.
 *
 * When syncMode is null (setup / Cambiar familia), family persist stays paused and
 * neither family bucket is written from empty in-memory state.
 */

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

/** Write settings to shared storage (works even when redux-persist is paused). */
export async function persistSharedSettingsSnapshot(
  settings: IStateSettings,
): Promise<void> {
  const { sessionPauseCount: _sessionPauseCount, ...snapshot } =
    settings;

  await sharedPersistStorage.setItem(
    EStateName.settings,
    JSON.stringify(snapshot),
  );
}

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
