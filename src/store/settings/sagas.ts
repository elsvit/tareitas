import { call, put, select } from 'redux-saga/effects';

import { collectFamilyMemberCredentialUpdates } from '~/services/familySync';
import { refreshAuthToken } from '~/services/api';
import { LocalizationService } from '~/services/localization/localization';
import { updateChild } from '~/store/children/slice';
import { takeLatestWithFetchable } from '~/store/helpers/fetchableHandler';
import { updateParent } from '~/store/parents/slice';
import type { IState } from '~/store/types';
import { syncRewardBaseTranslations } from '~/store/rewardBase/slice';
import { syncTaskBaseTranslations } from '~/store/taskBase/slice';

import {
  selectAuthToken,
  selectFamilyId,
  selectIsMultidevice,
  selectLang,
  selectRefreshToken,
} from './selectors';
import {
  clearAuthSession,
  initLanguage,
  refreshAuthSession,
  setLanguage,
  setRequireLogin,
  syncCatalog,
  syncFamilyMembers,
  updateAuthTokens,
} from './slice';

function* applyFamilyMemberCredentialUpdatesSaga(): Generator<
  any,
  void,
  any
> {
  const state: IState = yield select(
    (currentState: IState) => currentState,
  );
  const updates = yield call(
    collectFamilyMemberCredentialUpdates,
    state,
  );

  for (const { entity } of updates.parents) {
    yield put(updateParent({ entity }));
  }

  for (const { entity } of updates.children) {
    yield put(updateChild({ entity }));
  }
}

function* syncFamilyMembersSaga(): Generator<any, void, any> {
  const isMultidevice: boolean = yield select(
    selectIsMultidevice,
  );
  const authToken: string | null = yield select(
    selectAuthToken,
  );
  const familyId: string | null = yield select(
    selectFamilyId,
  );

  if (!isMultidevice || !authToken || !familyId) {
    return;
  }

  try {
    yield call(applyFamilyMemberCredentialUpdatesSaga);
  } catch {
    // Keep local data if sync fails (offline, expired token, etc.)
  }
}

function* refreshAuthSessionSaga(): Generator<any, void, any> {
  const isMultidevice: boolean = yield select(
    selectIsMultidevice,
  );
  const refreshToken: string | null = yield select(
    selectRefreshToken,
  );

  if (!isMultidevice || !refreshToken) {
    return;
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
    yield put(syncCatalog());
  } catch {
    yield put(clearAuthSession());
    yield put(setRequireLogin(true));
    return;
  }

  yield call(applyFamilyMemberCredentialUpdatesSaga);
}

function* initLanguageSaga(): Generator<any, void, any> {
  const storeLang = yield select(selectLang);
  const lang = yield call(
    LocalizationService.init,
    storeLang,
  );
  yield put(setLanguage(lang));
  yield put(syncTaskBaseTranslations());
  yield put(syncRewardBaseTranslations());
  yield put(refreshAuthSession());
  yield put(syncFamilyMembers());
}

export default [
  takeLatestWithFetchable(
    initLanguage,
    initLanguageSaga,
  ),
  takeLatestWithFetchable(
    refreshAuthSession,
    refreshAuthSessionSaga,
  ),
  takeLatestWithFetchable(
    syncFamilyMembers,
    syncFamilyMembersSaga,
  ),
];
