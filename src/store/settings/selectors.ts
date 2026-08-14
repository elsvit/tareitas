import type { RootStateT } from '~/store';
import { EStateName } from '~/store/enums';
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
