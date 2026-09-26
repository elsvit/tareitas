import { isSessionIdleExpired } from '~/constants/session';
import { refreshAuthToken } from '~/services/api/authApi';
import { fetchFamilyDetails } from '~/services/api/familiesApi';
import { ApiError } from '~/services/api/client';
import { clearLocalFamilyForNewSetup } from '~/services/familySync';
import {
  flushFamilyPersistMode,
  persistSharedSettingsState,
  rehydrateDeviceOnlyConnectFromStorage,
  resumeFamilyPersist,
} from '~/services/familyPersistMode';
import { clearFamilyStorageBucket } from '~/services/storage/familyPersistStorage';
import { ERole, ESyncMode } from '~/store/settings/enums';
import {
  selectAuthToken,
  selectFamilyId,
  selectHasAuthSession,
  selectLastSessionActivityAt,
  selectRefreshToken,
  selectSyncMode,
} from '~/store/settings/selectors';
import { selectParentIds } from '~/store/parents/selectors';
import { addChildSuccess, clearChildren } from '~/store/children/slice';
import { addParentSuccess, clearParents } from '~/store/parents/slice';
import {
  clearActiveSyncMode,
  clearAuthSession,
  clearAuthTokens,
  setCurrentRole,
  setCurrentUser,
  setPendingOnboardingChildUserId,
  setRequireLogin,
  updateAuthTokens,
} from '~/store/settings/slice';
import { applyProfileLogout } from '~/services/sessionProfile';
import { selectPendingOnboardingChildUserId } from '~/store/settings/selectors';
import { shouldResumeOnboardingChildProfile } from '~/utils/onboarding/pendingOnboardingChild';
import type { AppDispatch } from '~/store/store';
import { persistor } from '~/store/store';
import type { IState } from '~/store/types';
import type { IFamilyDetails } from '~/types/IAuth';

function isFamilyMissingOnServerError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 404 || error.status === 403)
  );
}

async function resolveBootAuthToken(
  getState: () => IState,
): Promise<string | null> {
  let authToken = selectAuthToken(getState());
  const refreshToken = selectRefreshToken(getState());

  if (authToken) {
    return authToken;
  }

  if (!refreshToken) {
    return null;
  }

  try {
    const tokens = await refreshAuthToken(refreshToken);
    return tokens.accessToken;
  } catch {
    return null;
  }
}

async function fetchFamilyDetailsForBoot(
  getState: () => IState,
): Promise<IFamilyDetails | null> {
  const familyId = selectFamilyId(getState());

  if (!familyId) {
    return null;
  }

  const authToken = await resolveBootAuthToken(getState);

  if (!authToken) {
    return null;
  }

  try {
    return await fetchFamilyDetails(authToken, familyId);
  } catch (error) {
    if (isFamilyMissingOnServerError(error)) {
      return null;
    }

    throw error;
  }
}

async function hydrateMultideviceFamilyFromServer(
  dispatch: AppDispatch,
  getState: () => IState,
  family: IFamilyDetails,
): Promise<void> {
  if (family.parents.length === 0) {
    return;
  }

  const adminUserId =
    family.parents.find(parent => parent.role === 'admin')?.userId ??
    family.parents[0]?.userId ??
    '';

  dispatch(clearParents());
  dispatch(clearChildren());

  for (const parent of family.parents) {
    dispatch(
      addParentSuccess({
        id: parent.userId,
        name: parent.name,
        role: parent.role === 'admin' ? ERole.admin : ERole.parent,
        familyRole: parent.familyRole as never,
        color: parent.color,
        avatar: parent.avatar,
        email: parent.email,
        username: parent.username,
        createdAt: new Date().toISOString(),
        createdBy: adminUserId || parent.userId,
      }),
    );
  }

  for (const child of family.children) {
    dispatch(
      addChildSuccess({
        id: child.userId,
        name: child.name,
        color: child.color,
        avatar: child.avatar,
        reward: child.reward,
        birthday: child.birthday,
        username: child.username?.trim() || undefined,
        createdAt: new Date().toISOString(),
        createdBy: adminUserId,
      }),
    );
  }

  await flushFamilyPersistMode(persistor);
  resumeFamilyPersist(persistor);
}

async function openSetupBecauseFamilyMissing(
  dispatch: AppDispatch,
  getState: () => IState,
): Promise<void> {
  clearLocalFamilyForNewSetup(dispatch);
  dispatch(clearActiveSyncMode());
  dispatch(clearAuthSession());
  dispatch(setCurrentUser(null));
  dispatch(setCurrentRole(null));
  await persistSharedSettingsState(getState);
}

export async function invalidateFamilyAndOpenSetup(
  dispatch: AppDispatch,
  getState: () => IState,
): Promise<void> {
  await openSetupBecauseFamilyMissing(dispatch, getState);
}

/** Wipe all local family data and open setup (Settings → Cerrar sesión). */
export async function signOutAndClearFamilyData(
  dispatch: AppDispatch,
  getState: () => IState,
): Promise<void> {
  persistor?.pause?.();

  try {
    await clearFamilyStorageBucket(ESyncMode.deviceOnly);
    await clearFamilyStorageBucket(ESyncMode.multidevice);
    await openSetupBecauseFamilyMissing(dispatch, getState);
    await flushFamilyPersistMode(persistor);
  } finally {
    resumeFamilyPersist(persistor);
  }
}

async function lockProfileSessionOnBoot(
  dispatch: AppDispatch,
  getState: () => IState,
): Promise<void> {
  const syncMode = selectSyncMode(getState());

  if (
    syncMode !== ESyncMode.deviceOnly &&
    syncMode !== ESyncMode.multidevice
  ) {
    return;
  }

  const hasFamily =
    selectParentIds(getState()).length > 0 ||
    (syncMode === ESyncMode.multidevice &&
      Boolean(selectFamilyId(getState())));

  if (!hasFamily) {
    return;
  }

  if (syncMode === ESyncMode.deviceOnly) {
    applyProfileLogout(dispatch);
    await persistSharedSettingsState(getState);
    return;
  }

  const idleExpired = isSessionIdleExpired(
    selectLastSessionActivityAt(getState()),
  );

  const refreshTokensOnBoot = async (): Promise<boolean> => {
    const refreshToken = selectRefreshToken(getState());

    if (!refreshToken) {
      return false;
    }

    try {
      const tokens = await refreshAuthToken(refreshToken);

      dispatch(
        updateAuthTokens({
          authToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
      );

      return true;
    } catch {
      return false;
    }
  };

  const endCloudProfileSession = async () => {
    dispatch(clearAuthTokens());
    applyProfileLogout(dispatch);
    dispatch(setRequireLogin(false));
    await persistSharedSettingsState(getState);
  };

  if (idleExpired) {
    await endCloudProfileSession();
    return;
  }

  let sessionOk = selectHasAuthSession(getState());

  if (!sessionOk) {
    sessionOk = await refreshTokensOnBoot();
  } else if (!selectAuthToken(getState())) {
    sessionOk = await refreshTokensOnBoot();
  }

  if (sessionOk) {
    await persistSharedSettingsState(getState);
    return;
  }

  await endCloudProfileSession();
}

async function clearStalePendingOnboardingOnBoot(
  dispatch: AppDispatch,
  getState: () => IState,
): Promise<void> {
  const pendingChildUserId = selectPendingOnboardingChildUserId(getState());

  if (!pendingChildUserId) {
    return;
  }

  if (shouldResumeOnboardingChildProfile(getState)) {
    return;
  }

  dispatch(setPendingOnboardingChildUserId(null));
  await persistSharedSettingsState(getState);
}

export async function validatePersistedFamilyOnBoot(
  dispatch: AppDispatch,
  getState: () => IState,
): Promise<void> {
  await clearStalePendingOnboardingOnBoot(dispatch, getState);
  await lockProfileSessionOnBoot(dispatch, getState);

  const syncMode = selectSyncMode(getState());

  if (!syncMode) {
    return;
  }

  let parentCount = selectParentIds(getState()).length;

  if (syncMode === ESyncMode.deviceOnly) {
    if (parentCount > 0) {
      return;
    }

    persistor?.pause?.();

    try {
      const recovered = await rehydrateDeviceOnlyConnectFromStorage(dispatch);

      if (recovered) {
        return;
      }
    } finally {
      resumeFamilyPersist(persistor);
    }

    await openSetupBecauseFamilyMissing(dispatch, getState);
    return;
  }

  const familyId = selectFamilyId(getState());
  const hasAuthSession = selectHasAuthSession(getState());

  if (!familyId) {
    await openSetupBecauseFamilyMissing(dispatch, getState);
    return;
  }

  if (parentCount > 0) {
    if (!hasAuthSession) {
      return;
    }

    try {
      const family = await fetchFamilyDetailsForBoot(getState);

      if (!family) {
        await openSetupBecauseFamilyMissing(dispatch, getState);
      }
    } catch {
      // Offline or transient error — keep local multidevice family.
    }

    return;
  }

  if (!hasAuthSession) {
    await openSetupBecauseFamilyMissing(dispatch, getState);
    return;
  }

  try {
    const family = await fetchFamilyDetailsForBoot(getState);

    if (!family) {
      await openSetupBecauseFamilyMissing(dispatch, getState);
      return;
    }

    await hydrateMultideviceFamilyFromServer(dispatch, getState, family);

    parentCount = selectParentIds(getState()).length;

    if (parentCount === 0) {
      await openSetupBecauseFamilyMissing(dispatch, getState);
    }
  } catch {
    await openSetupBecauseFamilyMissing(dispatch, getState);
  }
}
