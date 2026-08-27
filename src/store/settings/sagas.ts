import { call, put, select } from 'redux-saga/effects';

import { collectFamilyMemberCredentialUpdates } from '~/services/familySync';
import { LocalizationService } from '~/services/localization/localization';
import { updateChild } from '~/store/children/slice';
import {
  ensureSessionNotIdle,
  tryRefreshAuthTokens,
} from '~/store/helpers/multideviceSession';
import { takeLatestWithFetchable } from '~/store/helpers/fetchableHandler';
import {
  syncFamilyMembersFromServerSaga,
  syncRewardsDataFromServerSaga,
  syncTaskAssignmentsFromServerSaga,
} from '~/store/multideviceSync/sagas';
import { syncFamilyImagesFromServerSaga } from '~/store/images/sagas';
import { updateParent } from '~/store/parents/slice';
import type { IState } from '~/store/types';
import { syncRewardBaseTranslations } from '~/store/rewardBase/slice';
import { syncTaskBaseTranslations } from '~/store/taskBase/slice';

import {
  selectHasAuthSession,
  selectIsSessionPaused,
  selectLang,
} from './selectors';
import {
  initLanguage,
  refreshAuthSession,
  resumeMultideviceSession,
  setLanguage,
  syncCatalog,
  syncFamilyMembers,
  syncRewardsData,
  syncTaskAssignments,
  syncFamilyImages,
  touchSessionActivity,
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
  const hasAuthSession: boolean = yield select(
    selectHasAuthSession,
  );

  if (!hasAuthSession) {
    return;
  }

  try {
    yield call(syncFamilyMembersFromServerSaga);
  } catch {
    // Keep local data if sync fails (offline, expired token, etc.)
  }
}

function* syncTaskAssignmentsSaga(): Generator<any, void, any> {
  const hasAuthSession: boolean = yield select(
    selectHasAuthSession,
  );

  if (!hasAuthSession) {
    return;
  }

  try {
    yield call(syncTaskAssignmentsFromServerSaga);
  } catch {
    // Keep local data if sync fails (offline, expired token, etc.)
  }
}

function* syncRewardsDataSaga(): Generator<any, void, any> {
  const hasAuthSession: boolean = yield select(
    selectHasAuthSession,
  );

  if (!hasAuthSession) {
    return;
  }

  try {
    yield call(syncRewardsDataFromServerSaga);
  } catch {
    // Keep local data if sync fails (offline, expired token, etc.)
  }
}

function* syncFamilyImagesSaga(): Generator<any, void, any> {
  const hasAuthSession: boolean = yield select(
    selectHasAuthSession,
  );

  if (!hasAuthSession) {
    return;
  }

  try {
    yield call(syncFamilyImagesFromServerSaga);
  } catch {
    // Keep local image library if sync fails.
  }
}

function* resumeMultideviceSessionSaga(): Generator<
  any,
  void,
  any
> {
  const hasAuthSession: boolean = yield select(
    selectHasAuthSession,
  );

  if (!hasAuthSession) {
    return;
  }

  const isPaused: boolean = yield select(
    selectIsSessionPaused,
  );

  if (isPaused) {
    return;
  }

  const idleExpired: boolean = yield call(
    ensureSessionNotIdle,
  );

  if (idleExpired) {
    return;
  }

  yield put(touchSessionActivity());

  try {
    yield call(tryRefreshAuthTokens);
    yield put(syncCatalog());
    yield put(syncTaskAssignments());
    yield call(applyFamilyMemberCredentialUpdatesSaga);
  } catch {
    // Keep the existing session on transient failures (offline, timeout, etc.)
  }
}

function* refreshAuthSessionSaga(): Generator<any, void, any> {
  yield call(resumeMultideviceSessionSaga);
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
  yield put(resumeMultideviceSession());
  yield put(syncFamilyMembers());
  yield put(syncTaskAssignments());
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
    resumeMultideviceSession,
    resumeMultideviceSessionSaga,
  ),
  takeLatestWithFetchable(
    syncFamilyMembers,
    syncFamilyMembersSaga,
  ),
  takeLatestWithFetchable(
    syncTaskAssignments,
    syncTaskAssignmentsSaga,
  ),
  takeLatestWithFetchable(
    syncRewardsData,
    syncRewardsDataSaga,
  ),
  takeLatestWithFetchable(
    syncFamilyImages,
    syncFamilyImagesSaga,
  ),
];
