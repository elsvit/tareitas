import { call, put, select } from 'redux-saga/effects';

import { collectFamilyMemberCredentialUpdates } from '~/services/familySync';
import {
  LocalizationService,
  resolveInitialAppLanguage,
} from '~/services/localization/localization';
import { DEFAULT_LANG } from '~/constants/settings';
import { ELang } from '~/types/ELang';
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
import type { RootStateT } from '~/store/store';
import { syncRewardBaseTranslations } from '~/store/rewardBase/slice';
import { syncTaskBaseTranslations } from '~/store/taskBase/slice';

import {
  selectHasAuthSession,
  selectIsMultidevice,
  selectIsSessionPaused,
  selectLang,
  selectLangUserSelected,
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
  const state: RootStateT = yield select(
    (currentState: RootStateT) => currentState,
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
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    return;
  }

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
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    return;
  }

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
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    return;
  }

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
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    return;
  }

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
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    return;
  }

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
  const storeLang: ELang | null = yield select(selectLang);
  const langUserSelected: boolean = yield select(selectLangUserSelected);
  const langToApply = resolveInitialAppLanguage({
    storedLang: storeLang,
    langUserSelected,
  });
  let lang = langToApply;

  try {
    lang = yield call(LocalizationService.init, langToApply);
  } catch {
    try {
      lang = yield call(LocalizationService.init, DEFAULT_LANG);
    } catch {
      lang = DEFAULT_LANG;
    }
  }

  yield put(setLanguage({ lang, userSelected: false }));
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
