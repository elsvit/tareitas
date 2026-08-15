import { createSelector } from '@reduxjs/toolkit';

import type { RootStateT } from '~/store';
import { EStateName } from '~/store/enums';
import { selectChildById } from '~/store/children/selectors';
import { selectParentById } from '~/store/parents/selectors';
import { getTodayDateString } from '~/utils/date';

import { ERole } from './enums';
import type { IStateSettings } from './types';

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
