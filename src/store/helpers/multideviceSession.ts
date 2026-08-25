import { select, put } from 'redux-saga/effects';
import i18next from 'i18next';

import {
  selectAuthToken,
  selectCurrentUser,
  selectFamilyId,
  selectHasAuthSession,
  selectIsMultidevice,
} from '~/store/settings/selectors';
import { setRequireLogin } from '~/store/settings/slice';

export type MultideviceSession = {
  authToken: string;
  familyId: string;
  currentUser: string;
};

export function* assertMultideviceSession(): Generator<
  any,
  MultideviceSession | null,
  any
> {
  const isMultidevice: boolean = yield select(
    selectIsMultidevice,
  );

  if (!isMultidevice) {
    return null;
  }

  const hasAuthSession: boolean = yield select(
    selectHasAuthSession,
  );

  if (!hasAuthSession) {
    yield put(setRequireLogin(true));

    throw new Error(
      i18next.t('settings.account.session_expired'),
    );
  }

  const authToken: string | null = yield select(
    selectAuthToken,
  );
  const familyId: string | null = yield select(
    selectFamilyId,
  );
  const currentUser: string | null = yield select(
    selectCurrentUser,
  );

  if (!authToken || !familyId || !currentUser) {
    yield put(setRequireLogin(true));

    throw new Error(
      i18next.t('settings.account.session_expired'),
    );
  }

  return {
    authToken,
    familyId,
    currentUser,
  };
}
