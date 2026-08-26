import { createSelector } from '@reduxjs/toolkit';

import type { RootStateT } from '~/store';
import { EStateName } from '~/store/enums';
import { selectChildById } from '~/store/children/selectors';
import { selectParentById } from '~/store/parents/selectors';
import { getTodayDateString } from '~/utils/date';

import { ERole, ESyncMode } from './enums';
import type { IStateSettings } from './types';

function decodeJwtSub(token: string): string | null {
  try {
    const segment = token.split('.')[1];

    if (!segment) {
      return null;
    }

    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );

    if (typeof globalThis.atob !== 'function') {
      return null;
    }

    const payload = JSON.parse(globalThis.atob(padded)) as {
      sub?: unknown;
    };

    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

export const getSettingsState = (state: RootStateT) => state[EStateName.settings];

export const selectLang = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).lang;

export const selectIsLangInitiating = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).isLangInitiating;

export const selectIsRecurringTabSeparated = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).isHabitsTabSeparated;

export const selectIsChildPasswordObligatory = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>)
    .isChildPasswordObligatory ?? true;

export const selectShowLoginName = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).showLoginName ??
  false;

export const selectShowParentLoginName = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).showParentLoginName ??
  false;

export const selectCurrentUser = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).currentUser;

export const selectCurrentRole = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).currentRole;

export const selectResolvedCurrentRole = createSelector(
  [selectCurrentUser, selectCurrentRole, (state: RootStateT) => state],
  (userId, storedRole, state): ERole | null => {
    if (!userId) {
      return null;
    }

    if (selectChildById(state, userId)) {
      return ERole.child;
    }

    const parent = selectParentById(state, userId);

    if (parent) {
      return parent.role === ERole.admin ? ERole.admin : ERole.parent;
    }

    return storedRole;
  },
);

export const selectIsChild = createSelector(
  [selectResolvedCurrentRole],
  role => role === ERole.child,
);

export const selectIsParent = createSelector(
  [selectResolvedCurrentRole],
  role => role === ERole.parent || role === ERole.admin,
);

export const selectIsAdmin = createSelector(
  [selectResolvedCurrentRole],
  role => role === ERole.admin,
);

export const selectTaskCalendarDate = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).taskCalendarDate ??
  getTodayDateString();

export const selectSyncMode = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).syncMode;

export const selectIsMultidevice = createSelector(
  [selectSyncMode],
  syncMode => syncMode === ESyncMode.multidevice,
);

export const selectFamilyId = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).familyId;

export const selectAuthToken = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).authToken;

export const selectRefreshToken = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).refreshToken;

export const selectHasAuthSession = createSelector(
  [selectAuthToken, selectRefreshToken, selectFamilyId],
  (authToken, refreshToken, familyId) =>
    Boolean(authToken && refreshToken && familyId),
);

/** True when the app should read/write family data through the server. */
export const selectUsesCloudSync = selectHasAuthSession;

export const selectAuthUserId = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).authUserId;

export const selectResolvedAuthUserId = createSelector(
  [selectAuthUserId, selectAuthToken],
  (authUserId, authToken) =>
    authUserId ?? (authToken ? decodeJwtSub(authToken) : null),
);

export const selectAuthUserRole = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>).authUserRole;

export const selectCanReviewTasks = createSelector(
  [
    selectHasAuthSession,
    selectAuthUserRole,
    selectResolvedAuthUserId,
    (state: RootStateT) => state,
  ],
  (hasAuthSession, authUserRole, authUserId, state) => {
    if (!hasAuthSession) {
      return true;
    }

    if (
      authUserRole === ERole.admin ||
      authUserRole === ERole.parent
    ) {
      return true;
    }

    if (authUserRole === ERole.child) {
      return false;
    }

    if (!authUserId) {
      return false;
    }

    const parent = selectParentById(state, authUserId);

    if (parent) {
      return (
        parent.role === ERole.admin || parent.role === ERole.parent
      );
    }

    return !selectChildById(state, authUserId);
  },
);

export const selectNeedsAuthLogin = createSelector(
  [selectIsMultidevice, selectHasAuthSession],
  (isMultidevice, hasAuthSession) =>
    isMultidevice && !hasAuthSession,
);

export const selectRequireLogin = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>)
    .requireLogin ?? false;

export const selectLastSessionActivityAt = (
  state: RootStateT,
) =>
  (state[EStateName.settings] as Persisted<IStateSettings>)
    .lastSessionActivityAt ?? null;

export const selectPendingReturnRoute = (
  state: RootStateT,
) =>
  (state[EStateName.settings] as Persisted<IStateSettings>)
    .pendingReturnRoute ?? null;

export const selectSessionPauseCount = (
  state: RootStateT,
) =>
  (state[EStateName.settings] as Persisted<IStateSettings>)
    .sessionPauseCount ?? 0;

export const selectIsSessionPaused = createSelector(
  [selectSessionPauseCount],
  pauseCount => pauseCount > 0,
);

export const selectLastSyncedTaskBaseRevision = (
  state: RootStateT,
) =>
  (state[EStateName.settings] as Persisted<IStateSettings>)
    .lastSyncedTaskBaseRevision ?? 0;

export const selectLastSyncedRewardBaseRevision = (
  state: RootStateT,
) =>
  (state[EStateName.settings] as Persisted<IStateSettings>)
    .lastSyncedRewardBaseRevision ?? 0;

export const selectCatalogDirty = (state: RootStateT) =>
  (state[EStateName.settings] as Persisted<IStateSettings>)
    .catalogDirty ?? false;

export const selectPendingRemovedTaskBaseIds = (
  state: RootStateT,
) =>
  (state[EStateName.settings] as Persisted<IStateSettings>)
    .pendingRemovedTaskBaseIds ?? [];

export const selectPendingRemovedRewardBaseIds = (
  state: RootStateT,
) =>
  (state[EStateName.settings] as Persisted<IStateSettings>)
    .pendingRemovedRewardBaseIds ?? [];
