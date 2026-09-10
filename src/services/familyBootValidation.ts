import { refreshAuthToken } from '~/services/api/authApi';
import { fetchFamilyDetails } from '~/services/api/familiesApi';
import { ApiError } from '~/services/api/client';
import { clearLocalFamilyForNewSetup } from '~/services/familySync';
import {
  flushFamilyPersistMode,
  resumeFamilyPersist,
} from '~/services/familyPersistMode';
import { ERole, ESyncMode } from '~/store/settings/enums';
import {
  selectAuthToken,
  selectFamilyId,
  selectHasAuthSession,
  selectHasPersistedFamily,
  selectRefreshToken,
  selectSyncMode,
} from '~/store/settings/selectors';
import { selectParentIds } from '~/store/parents/selectors';
import { addChildSuccess, clearChildren } from '~/store/children/slice';
import { addParentSuccess, clearParents } from '~/store/parents/slice';
import {
  clearAuthSession,
  setCurrentRole,
  setCurrentUser,
  setHasPersistedFamily,
  setPendingFamilySetup,
  setRequireLogin,
} from '~/store/settings/slice';
import type { AppDispatch } from '~/store/store';
import { persistor } from '~/store/store';
import type { IState } from '~/store/types';
import type { IFamilyDetails } from '~/types/IAuth';

import { persistSharedSettingsState } from './familyPersistMode';

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

  dispatch(setHasPersistedFamily(true));
  await flushFamilyPersistMode(persistor);
  resumeFamilyPersist(persistor);
}

export async function invalidateFamilyAndOpenSetup(
  dispatch: AppDispatch,
  getState: () => IState,
): Promise<void> {
  clearLocalFamilyForNewSetup(dispatch);
  dispatch(clearAuthSession());
  dispatch(setCurrentUser(null));
  dispatch(setCurrentRole(null));
  dispatch(setRequireLogin(false));
  dispatch(setPendingFamilySetup(true));
  dispatch(setHasPersistedFamily(false));
  await persistSharedSettingsState(getState);
}

export async function validatePersistedFamilyOnBoot(
  dispatch: AppDispatch,
  getState: () => IState,
): Promise<void> {
  const parentCount = selectParentIds(getState()).length;
  const syncMode = selectSyncMode(getState());
  const isMultidevice = syncMode === ESyncMode.multidevice;
  const hasPersistedFamily = selectHasPersistedFamily(getState());
  const familyId = selectFamilyId(getState());
  const hasAuthSession = selectHasAuthSession(getState());

  if (parentCount > 0 && !hasPersistedFamily) {
    dispatch(setHasPersistedFamily(true));
  }

  if (isMultidevice && familyId && hasAuthSession) {
    try {
      const family = await fetchFamilyDetailsForBoot(getState);

      if (!family) {
        await invalidateFamilyAndOpenSetup(dispatch, getState);
        return;
      }

      if (parentCount === 0 && hasPersistedFamily) {
        await hydrateMultideviceFamilyFromServer(
          dispatch,
          getState,
          family,
        );

        if (selectParentIds(getState()).length === 0) {
          await invalidateFamilyAndOpenSetup(dispatch, getState);
        }
      }

      return;
    } catch {
      if (parentCount === 0 && hasPersistedFamily) {
        await invalidateFamilyAndOpenSetup(dispatch, getState);
      }

      return;
    }
  }

  if (parentCount > 0) {
    return;
  }

  if (hasPersistedFamily) {
    await invalidateFamilyAndOpenSetup(dispatch, getState);
  }
}
