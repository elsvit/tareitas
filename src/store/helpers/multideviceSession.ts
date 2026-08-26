import { call, put, select } from 'redux-saga/effects';
import i18next from 'i18next';

import { isSessionIdleExpired } from '~/constants/session';
import { refreshAuthToken } from '~/services/api';
import { ApiError } from '~/services/api/client';
import {
  selectAuthToken,
  selectCurrentUser,
  selectFamilyId,
  selectHasAuthSession,
  selectIsSessionPaused,
  selectLastSessionActivityAt,
  selectRefreshToken,
} from '~/store/settings/selectors';
import {
  clearAuthSession,
  setRequireLogin,
  touchSessionActivity,
  updateAuthTokens,
} from '~/store/settings/slice';

export type MultideviceSession = {
  authToken: string;
  familyId: string;
  currentUser: string;
};

function sessionExpiredMessage(): string {
  return i18next.t('settings.account.session_expired');
}

function syncTryLaterMessage(): string {
  return i18next.t('settings.account.sync_try_later');
}

export function* invalidateAuthSession(): Generator<
  any,
  void,
  any
> {
  const isPaused: boolean = yield select(
    selectIsSessionPaused,
  );

  yield put(clearAuthSession());

  if (!isPaused) {
    yield put(setRequireLogin(true));
  }
}

export function* ensureSessionNotIdle(): Generator<
  any,
  boolean,
  any
> {
  const isPaused: boolean = yield select(
    selectIsSessionPaused,
  );

  if (isPaused) {
    return false;
  }

  const lastActivityAt: string | null = yield select(
    selectLastSessionActivityAt,
  );

  if (!isSessionIdleExpired(lastActivityAt)) {
    return false;
  }

  yield call(invalidateAuthSession);
  return true;
}

export function* tryRefreshAuthTokens(): Generator<
  any,
  boolean,
  any
> {
  const refreshToken: string | null = yield select(
    selectRefreshToken,
  );

  if (!refreshToken) {
    return false;
  }

  try {
    const tokens = yield call(
      refreshAuthToken,
      refreshToken,
    );

    yield put(
      updateAuthTokens({
        authToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }),
    );
    yield put(touchSessionActivity());

    return true;
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401
    ) {
      yield call(invalidateAuthSession);
    }

    throw error;
  }
}

export function* assertMultideviceSession(): Generator<
  any,
  MultideviceSession | null,
  any
> {
  const hasAuthSession: boolean = yield select(
    selectHasAuthSession,
  );

  if (!hasAuthSession) {
    return null;
  }

  const idleExpired: boolean = yield call(
    ensureSessionNotIdle,
  );

  if (idleExpired) {
    throw new Error(sessionExpiredMessage());
  }

  let authToken: string | null = yield select(
    selectAuthToken,
  );
  const refreshToken: string | null = yield select(
    selectRefreshToken,
  );
  let familyId: string | null = yield select(
    selectFamilyId,
  );
  const currentUser: string | null = yield select(
    selectCurrentUser,
  );

  if (!refreshToken) {
    yield call(invalidateAuthSession);
    throw new Error(sessionExpiredMessage());
  }

  if (!authToken) {
    try {
      yield call(tryRefreshAuthTokens);
      authToken = yield select(selectAuthToken);
      familyId = yield select(selectFamilyId);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 401
      ) {
        throw new Error(sessionExpiredMessage());
      }

      throw new Error(syncTryLaterMessage());
    }
  }

  if (!authToken || !familyId) {
    throw new Error(syncTryLaterMessage());
  }

  return {
    authToken,
    familyId,
    currentUser: currentUser ?? '',
  };
}

export function* callMultideviceApi<T>(
  apiCall: (authToken: string) => Promise<T>,
): Generator<any, T, any> {
  let authToken: string | null = yield select(
    selectAuthToken,
  );

  if (!authToken) {
    const refreshed: boolean = yield call(
      tryRefreshAuthTokens,
    );

    if (!refreshed) {
      throw new Error(sessionExpiredMessage());
    }

    authToken = yield select(selectAuthToken);
  }

  if (!authToken) {
    throw new Error(syncTryLaterMessage());
  }

  try {
    return yield call(apiCall, authToken);
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      error.status !== 401
    ) {
      throw error;
    }

    try {
      yield call(tryRefreshAuthTokens);
    } catch (refreshError) {
      if (
        refreshError instanceof ApiError &&
        refreshError.status === 401
      ) {
        throw new Error(sessionExpiredMessage());
      }

      throw new Error(syncTryLaterMessage());
    }

    authToken = yield select(selectAuthToken);

    if (!authToken) {
      throw new Error(syncTryLaterMessage());
    }

    return yield call(apiCall, authToken);
  }
}
