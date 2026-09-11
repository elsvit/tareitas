import { REHYDRATE } from 'redux-persist';

import { dispatchFamilySliceHydrate } from '~/services/familyPersistHydrate';
import {
  FAMILY_PERSIST_KEYS,
  clearFamilyStorageBucket,
  getFamilyPersistStorageForMode,
  migrateLegacyPersistKeys,
  persistSharedSettingsSnapshot,
  setActiveFamilyPersistMode,
  sharedPersistStorage,
} from '~/services/storage/familyPersistStorage';
import { EStateName } from '~/store/enums';
import { ensureEntityState, normalizeEntityState } from '~/store/helpers';
import { clearChildren } from '~/store/children/slice';
import { clearAllImageUrls } from '~/store/images/slice';
import { clearParents } from '~/store/parents/slice';
import { clearRewardAssignment } from '~/store/rewardAssignment/slice';
import { resetRewardBase } from '~/store/rewardBase/slice';
import { clearRewards } from '~/store/rewards/slice';
import { ESyncMode } from '~/store/settings/enums';
import {
  selectFamilyId,
  selectSyncMode,
} from '~/store/settings/selectors';
import { selectChildIds } from '~/store/children/selectors';
import { selectParentIds } from '~/store/parents/selectors';
import { clearTaskAssignment } from '~/store/taskAssignment/slice';
import { resetTaskBase } from '~/store/taskBase/slice';
import { clearTasks } from '~/store/tasks/slice';
import {
  clearActiveSyncMode,
  clearAuthSession,
  clearMultideviceSession,
  setCurrentRole,
  setCurrentUser,
  setSyncMode,
} from '~/store/settings/slice';
import { store, persistor } from '~/store/store';
import type { AppDispatch } from '~/store/store';
import type { IState } from '~/store/types';

function syncActiveFamilyPersistMode(getState: () => IState): void {
  const syncMode = selectSyncMode(getState());

  if (
    syncMode === ESyncMode.deviceOnly ||
    syncMode === ESyncMode.multidevice
  ) {
    setActiveFamilyPersistMode(syncMode);
  }
}

type PersistorLike = {
  flush: () => Promise<unknown>;
  pause?: () => void;
  persist?: () => void;
};

const CLEAR_FAMILY_SLICE_ACTIONS: Partial<
  Record<(typeof FAMILY_PERSIST_KEYS)[number], () => { type: string }>
> = {
  parents: clearParents,
  children: clearChildren,
  tasks: clearTasks,
  taskBase: resetTaskBase,
  rewardBase: resetRewardBase,
  taskAssignment: clearTaskAssignment,
  rewardAssignment: clearRewardAssignment,
  rewards: clearRewards,
  images: clearAllImageUrls,
};

const ENTITY_FAMILY_PERSIST_KEYS = new Set<string>([
  EStateName.parents,
  EStateName.children,
  EStateName.tasks,
  EStateName.taskBase,
  EStateName.rewardBase,
  EStateName.taskAssignment,
  EStateName.rewardAssignment,
  EStateName.rewards,
]);

function parsePersistedSlice<T>(raw: string, key?: string): T | null {
  try {
    let parsed: unknown = JSON.parse(raw);

    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }

    if (
      key &&
      ENTITY_FAMILY_PERSIST_KEYS.has(key) &&
      parsed &&
      typeof parsed === 'object'
    ) {
      normalizeEntityState(
        parsed as Parameters<typeof normalizeEntityState>[0],
      );
    }

    return parsed as T;
  } catch {
    return null;
  }
}

function serializeFamilySliceForBucket(
  key: (typeof FAMILY_PERSIST_KEYS)[number],
  slice: unknown,
): string | null {
  if (slice === undefined || slice === null) {
    return null;
  }

  if (ENTITY_FAMILY_PERSIST_KEYS.has(key)) {
    return JSON.stringify(
      ensureEntityState({ ...(slice as Parameters<typeof ensureEntityState>[0]) }),
    );
  }

  return JSON.stringify(slice);
}

/** Write every family slice directly to the device-only bucket (not modeAware). */
async function persistDeviceOnlyFamilyToBucket(
  getState: () => IState,
): Promise<void> {
  if (selectParentIds(getState()).length === 0) {
    return;
  }

  const storage = getFamilyPersistStorageForMode(ESyncMode.deviceOnly);
  const state = getState();

  for (const key of FAMILY_PERSIST_KEYS) {
    const slice = state[key as keyof IState];
    const serialized = serializeFamilySliceForBucket(key, slice);

    if (!serialized) {
      continue;
    }

    await storage.setItem(key, serialized);
  }
}

function isDeviceOnlyFamilyState(state: IState): boolean {
  return (
    selectSyncMode(state) === ESyncMode.deviceOnly || !selectFamilyId(state)
  );
}

export async function rehydrateDeviceOnlyConnectFromStorage(
  dispatch: AppDispatch,
): Promise<boolean> {
  await rehydrateFamilySlicesFromStorage(dispatch, ESyncMode.deviceOnly);

  return selectParentIds(store.getState()).length > 0;
}

/** Writes settings to shared storage (never to deviceOnly / multidevice family buckets). */
export async function persistSharedSettingsState(
  getState: () => IState,
): Promise<void> {
  const settings = getState()[EStateName.settings];

  if (!settings) {
    return;
  }

  await persistSharedSettingsSnapshot(settings);
}

async function rehydrateFamilySlicesFromStorage(
  dispatch: AppDispatch,
  mode: ESyncMode,
): Promise<void> {
  for (const key of FAMILY_PERSIST_KEYS) {
    const clearAction = CLEAR_FAMILY_SLICE_ACTIONS[key];

    if (clearAction) {
      dispatch(clearAction());
    }
  }

  const storage = getFamilyPersistStorageForMode(mode);

  for (const key of FAMILY_PERSIST_KEYS) {
    const raw = await storage.getItem(key);

    if (!raw) {
      continue;
    }

    const payload = parsePersistedSlice<unknown>(raw, key);

    if (payload) {
      if (!dispatchFamilySliceHydrate(dispatch, key, payload)) {
        dispatch({
          type: REHYDRATE,
          key,
          payload,
        });
      }
    }
  }
}

export async function saveFamilyStateToBucket(
  mode: ESyncMode,
  persistor: PersistorLike | null | undefined,
): Promise<void> {
  setActiveFamilyPersistMode(mode);
  await flushFamilyPersistMode(persistor);
}

/** Wipe device-only bucket and pause persist while the create flow runs. */
export async function beginDeviceOnlyFamilyCreate(
  dispatch: AppDispatch,
  persistor: PersistorLike | null | undefined,
  getState: () => IState = store.getState,
): Promise<void> {
  persistor?.pause?.();

  if (hasFamilyDataInMemory(getState())) {
    syncActiveFamilyPersistMode(getState);
    await flushFamilyPersistMode(persistor);
  }

  dispatch(setSyncMode(ESyncMode.deviceOnly));
  setActiveFamilyPersistMode(ESyncMode.deviceOnly);
  await clearFamilyStorageBucket(ESyncMode.deviceOnly);
  clearFamilySlicesInMemory(dispatch);
  dispatch(clearMultideviceSession());
}

/** Snapshot in-memory family slices to the active bucket (deviceOnly writes directly). */
export async function persistActiveFamilySnapshot(
  getState: () => IState = store.getState,
): Promise<void> {
  const syncMode = selectSyncMode(getState());

  if (syncMode === ESyncMode.deviceOnly) {
    if (selectParentIds(getState()).length === 0) {
      return;
    }

    setActiveFamilyPersistMode(ESyncMode.deviceOnly);
    await persistDeviceOnlyFamilyToBucket(getState);
  } else if (syncMode === ESyncMode.multidevice) {
    setActiveFamilyPersistMode(ESyncMode.multidevice);
  } else {
    return;
  }

  await flushFamilyPersistMode(persistor);
}

export async function saveDeviceOnlyFamilyForReconnect(
  getState: () => IState = store.getState,
): Promise<void> {
  const state = getState();

  if (selectParentIds(state).length === 0) {
    return;
  }

  if (!isDeviceOnlyFamilyState(state)) {
    return;
  }

  setActiveFamilyPersistMode(ESyncMode.deviceOnly);
  await persistDeviceOnlyFamilyToBucket(getState);
}

/** Persist a finished device-only family and resume redux-persist. */
export async function completeDeviceOnlyFamilyCreate(
  persistor: PersistorLike | null | undefined,
  getState: () => IState = store.getState,
): Promise<void> {
  setActiveFamilyPersistMode(ESyncMode.deviceOnly);
  await persistDeviceOnlyFamilyToBucket(getState);
  resumeFamilyPersist(persistor);
}

export async function flushFamilyPersistMode(
  persistor: PersistorLike | null | undefined,
): Promise<void> {
  if (!persistor) {
    return;
  }

  await persistor.flush();
}

export function resumeFamilyPersist(
  persistor: PersistorLike | null | undefined,
): void {
  persistor?.persist?.();
}

export function clearFamilySlicesInMemory(dispatch: AppDispatch): void {
  for (const key of FAMILY_PERSIST_KEYS) {
    const clearAction = CLEAR_FAMILY_SLICE_ACTIONS[key];

    if (clearAction) {
      dispatch(clearAction());
    }
  }
}

export function hasFamilyDataInMemory(state: IState): boolean {
  if (selectParentIds(state).length > 0) {
    return true;
  }

  if (selectChildIds(state).length > 0) {
    return true;
  }

  return FAMILY_PERSIST_KEYS.some(key => {
    if (
      key === EStateName.parents ||
      key === EStateName.children
    ) {
      return false;
    }

    if (key === EStateName.images) {
      const images = state.images;

      if (!images) {
        return false;
      }

      return (
        Object.keys(images.taskUrls ?? {}).length > 0 ||
        Object.keys(images.rewardUrls ?? {}).length > 0 ||
        Object.keys(images.userUrls ?? {}).length > 0
      );
    }

    const slice = state[key as keyof IState];

    if (
      slice &&
      typeof slice === 'object' &&
      'ids' in slice
    ) {
      const normalized = ensureEntityState(
        { ...(slice as Parameters<typeof ensureEntityState>[0]) },
      );

      return normalized.ids.length > 0;
    }

    if (key === EStateName.rewards) {
      const rewards = state.rewards;

      if (!rewards) {
        return false;
      }

      return (
        ensureEntityState({ ...rewards }).ids.length > 0 ||
        (rewards.earnedRewardPeriods?.length ?? 0) > 0
      );
    }

    return false;
  });
}

/** Flush active bucket, clear in-memory family data; keep AsyncStorage buckets intact. */
export async function resetFamilySetupScreenMemory(
  dispatch: AppDispatch,
  persistor: PersistorLike | null | undefined,
  options?: {
    getState?: () => IState;
    /** Always flush and clear slices (e.g. "Change family"). */
    force?: boolean;
  },
): Promise<void> {
  const getState = options?.getState;
  const force = options?.force ?? false;
  const readState = getState ?? store.getState;

  if (!force && getState && selectParentIds(getState()).length === 0) {
    dispatch(clearAuthSession());
    dispatch(setCurrentUser(null));
    dispatch(setCurrentRole(null));
    return;
  }

  if (!force && getState && !hasFamilyDataInMemory(getState())) {
    dispatch(clearAuthSession());
    dispatch(setCurrentUser(null));
    dispatch(setCurrentRole(null));
    return;
  }

  persistor?.pause?.();

  try {
    syncActiveFamilyPersistMode(readState);

    const deviceOnlyFamily = isDeviceOnlyFamilyState(readState());
    const parentCount = selectParentIds(readState()).length;

    if (parentCount > 0 && deviceOnlyFamily) {
      await persistDeviceOnlyFamilyToBucket(readState);
    } else if (hasFamilyDataInMemory(readState()) && !deviceOnlyFamily) {
      await flushFamilyPersistMode(persistor);
    }

    clearFamilySlicesInMemory(dispatch);
    dispatch(clearAuthSession());
    dispatch(setCurrentUser(null));
    dispatch(setCurrentRole(null));
  } finally {
    // Stay paused until a setup path loads or creates a family — avoids
    // persisting empty slices over the saved bucket.
  }
}

export async function prepareFamilyPersistOnBoot(
  dispatch: AppDispatch,
  getState: () => IState,
): Promise<void> {
  persistor?.pause?.();

  try {
    await migrateLegacyPersistKeys();

    const settingsRaw = await sharedPersistStorage.getItem(
      EStateName.settings,
    );

    if (settingsRaw) {
      const parsed = parsePersistedSlice<{
        syncMode?: ESyncMode | null;
      }>(settingsRaw);

      if (parsed) {
        dispatch({
          type: REHYDRATE,
          key: EStateName.settings,
          payload: parsed,
        });
      }
    }

    let syncMode = selectSyncMode(getState());

    dispatch(setCurrentUser(null));
    dispatch(setCurrentRole(null));

    if (
      syncMode === ESyncMode.multidevice &&
      !selectFamilyId(getState())
    ) {
      setActiveFamilyPersistMode(ESyncMode.deviceOnly);
      await rehydrateFamilySlicesFromStorage(
        dispatch,
        ESyncMode.deviceOnly,
      );

      if (selectParentIds(getState()).length > 0) {
        dispatch(setSyncMode(ESyncMode.deviceOnly));
        syncMode = ESyncMode.deviceOnly;
      } else {
        clearFamilySlicesInMemory(dispatch);
      }
    }

    if (syncMode === ESyncMode.deviceOnly) {
      setActiveFamilyPersistMode(ESyncMode.deviceOnly);
      await rehydrateFamilySlicesFromStorage(
        dispatch,
        ESyncMode.deviceOnly,
      );
      await persistSharedSettingsState(getState);
      return;
    }

    if (syncMode === ESyncMode.multidevice) {
      setActiveFamilyPersistMode(ESyncMode.multidevice);
      await rehydrateFamilySlicesFromStorage(
        dispatch,
        ESyncMode.multidevice,
      );
      await persistSharedSettingsState(getState);
      return;
    }

    // syncMode null → setup: settings in shared storage only; keep family buckets unchanged.
    clearFamilySlicesInMemory(dispatch);
    await persistSharedSettingsState(getState);
  } finally {
    const activeMode = selectSyncMode(getState());

    if (
      activeMode === ESyncMode.deviceOnly ||
      activeMode === ESyncMode.multidevice
    ) {
      resumeFamilyPersist(persistor);
    }
  }
}

export async function switchFamilyPersistMode(
  dispatch: AppDispatch,
  persistor: PersistorLike | null | undefined,
  targetMode: ESyncMode,
  getState: () => IState = store.getState,
): Promise<void> {
  persistor?.pause?.();

  let loadedDeviceOnlyUsers = false;

  try {
    const parentCountBeforeSwitch = selectParentIds(getState()).length;

    if (parentCountBeforeSwitch > 0 && hasFamilyDataInMemory(getState())) {
      if (isDeviceOnlyFamilyState(getState())) {
        await persistDeviceOnlyFamilyToBucket(getState);
      } else {
        syncActiveFamilyPersistMode(getState);
        await flushFamilyPersistMode(persistor);
      }
    }

    if (
      targetMode === ESyncMode.deviceOnly ||
      targetMode === ESyncMode.multidevice
    ) {
      dispatch(setSyncMode(targetMode));
    }

    setActiveFamilyPersistMode(targetMode);

    if (targetMode === ESyncMode.deviceOnly) {
      const parentCountBeforeLoad = selectParentIds(getState()).length;

      if (
        parentCountBeforeLoad > 0 &&
        isDeviceOnlyFamilyState(getState())
      ) {
        loadedDeviceOnlyUsers = true;
      } else {
        loadedDeviceOnlyUsers =
          await rehydrateDeviceOnlyConnectFromStorage(dispatch);
      }
    } else {
      await rehydrateFamilySlicesFromStorage(dispatch, targetMode);
    }
  } finally {
    // Do not resume persist with empty family state — that would wipe the bucket.
    if (targetMode !== ESyncMode.deviceOnly || loadedDeviceOnlyUsers) {
      resumeFamilyPersist(persistor);
    }
  }
}

/** Open family-change setup; persist buckets kept, Redux memory cleared. */
export async function prepareFamilyChangeScreen(
  dispatch: AppDispatch,
): Promise<void> {
  await saveDeviceOnlyFamilyForReconnect(store.getState);

  await resetFamilySetupScreenMemory(dispatch, persistor, {
    force: true,
    getState: store.getState,
  });

  dispatch(clearActiveSyncMode());
  dispatch(setCurrentUser(null));
  dispatch(setCurrentRole(null));
  await persistSharedSettingsState(store.getState);
}
