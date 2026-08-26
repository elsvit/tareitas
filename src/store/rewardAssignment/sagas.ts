import { PayloadAction } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { call, put, select } from 'redux-saga/effects';

import {
  createFamilyReward,
  deleteFamilyReward,
  mapServerFamilyRewardToAssignment,
  toCreateFamilyRewardBody,
  toUpdateFamilyRewardBody,
  updateFamilyReward,
} from '~/services/api/rewardsApi';
import { ApiError } from '~/services/api/client';
import {
  assertMultideviceSession,
  callMultideviceApi,
} from '~/store/helpers/multideviceSession';
import { resolveAndCacheRewardPicture } from '~/store/helpers/imageRefSync';
import { selectDedupedChildIds } from '~/store/children/selectors';
import { selectCanReviewTasks } from '~/store/settings/selectors';
import { takeLatestWithFetchable } from '../helpers/fetchableHandler';
import {
  resolveSavedRewardChildIds,
} from './childIds';
import {
  addRewardAssignment,
  addRewardAssignmentSuccess,
  removeRewardAssignment,
  removeRewardAssignmentSuccess,
  updateRewardAssignment,
  updateRewardAssignmentSuccess,
} from './slice';
import {
  AddRewardAssignmentPayload,
  RemoveRewardAssignmentPayload,
  UpdateRewardAssignmentPayload,
} from './types';
import type { IState } from '../types';

function* getValidChildIds(): Generator<any, string[], any> {
  const state: IState = yield select((currentState: IState) => currentState);

  return selectDedupedChildIds(state);
}

function manageRewardsRequiresAdminLoginMessage(): string {
  return i18next.t('rewards.manage_requires_admin_login');
}

function* assertCanManageRewardsOnServer(): Generator<any, void, any> {
  const canManage: boolean = yield select(selectCanReviewTasks);

  if (!canManage) {
    throw new Error(manageRewardsRequiresAdminLoginMessage());
  }
}

function* persistRewardChildIdsOnServer(
  familyId: string,
  rewardId: string,
  childIds: string[],
): Generator<any, void, any> {
  try {
    yield* callMultideviceApi(token =>
      updateFamilyReward(token, familyId, rewardId, {
        childUserIds: childIds,
      }),
    );
  } catch {
    // Main create/update already succeeded; keep local childIds.
  }
}

function* addRewardAssignmentSaga(
  action: PayloadAction<AddRewardAssignmentPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();
  const validChildIds: string[] = yield* getValidChildIds();
  const savedChildIds = resolveSavedRewardChildIds(
    entity.childIds,
    undefined,
    validChildIds,
  );

  if (!session) {
    yield put(
      addRewardAssignmentSuccess({
        ...entity,
        childIds: savedChildIds,
      }),
    );

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  yield* assertCanManageRewardsOnServer();

  let picture = entity.picture;

  if (picture) {
    picture =
      (yield call(
        resolveAndCacheRewardPicture,
        picture,
        session.familyId,
      )) ?? picture;
  }

  let serverReward = yield* callMultideviceApi(token =>
    createFamilyReward(
      token,
      session.familyId,
      toCreateFamilyRewardBody({
        ...entity,
        childIds: savedChildIds,
      }),
    ),
  );

  if (savedChildIds?.length && !serverReward.childUserIds?.length) {
    yield* persistRewardChildIdsOnServer(
      session.familyId,
      serverReward.id,
      savedChildIds,
    );

    serverReward = {
      ...serverReward,
      childUserIds: savedChildIds,
    };
  }

  const mapped = mapServerFamilyRewardToAssignment(serverReward);
  const childIds = resolveSavedRewardChildIds(
    savedChildIds,
    serverReward.childUserIds,
    validChildIds,
  );

  yield put(
    addRewardAssignmentSuccess({
      ...mapped,
      picture,
      childIds,
      createdAt: serverReward.createdAt ?? entity.createdAt,
    }),
  );

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* updateRewardAssignmentSaga(
  action: PayloadAction<UpdateRewardAssignmentPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();
  const validChildIds: string[] = yield* getValidChildIds();
  const savedChildIds = resolveSavedRewardChildIds(
    entity.childIds,
    undefined,
    validChildIds,
  );
  const entityForSave = {
    ...entity,
    childIds: savedChildIds,
  };

  if (!session) {
    yield put(updateRewardAssignmentSuccess(entityForSave));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  yield* assertCanManageRewardsOnServer();

  let picture = entity.picture;

  if (picture) {
    picture =
      (yield call(
        resolveAndCacheRewardPicture,
        picture,
        session.familyId,
      )) ?? picture;
  }

  const entityWithPicture = { ...entityForSave, picture };

  try {
    let serverReward = yield* callMultideviceApi(token =>
      updateFamilyReward(
        token,
        session.familyId,
        entity.id,
        toUpdateFamilyRewardBody(entityWithPicture),
      ),
    );

    if (savedChildIds?.length && !serverReward.childUserIds?.length) {
      yield* persistRewardChildIdsOnServer(
        session.familyId,
        serverReward.id,
        savedChildIds,
      );

      serverReward = {
        ...serverReward,
        childUserIds: savedChildIds,
      };
    }

    const mapped = mapServerFamilyRewardToAssignment(serverReward);
    const childIds = resolveSavedRewardChildIds(
      savedChildIds,
      serverReward.childUserIds,
      validChildIds,
    );

    yield put(
      updateRewardAssignmentSuccess({
        ...mapped,
        picture,
        childIds,
      }),
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      let serverReward = yield* callMultideviceApi(token =>
        createFamilyReward(
          token,
          session.familyId,
          toCreateFamilyRewardBody(entityWithPicture),
        ),
      );

      if (savedChildIds?.length && !serverReward.childUserIds?.length) {
        yield* persistRewardChildIdsOnServer(
          session.familyId,
          serverReward.id,
          savedChildIds,
        );

        serverReward = {
          ...serverReward,
          childUserIds: savedChildIds,
        };
      }

      const mapped = mapServerFamilyRewardToAssignment(serverReward);
      const childIds = resolveSavedRewardChildIds(
        savedChildIds,
        serverReward.childUserIds,
        validChildIds,
      );

      yield put(
        updateRewardAssignmentSuccess({
          ...mapped,
          picture,
          childIds,
        }),
      );
    } else {
      throw error;
    }
  }

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* removeRewardAssignmentSaga(
  action: PayloadAction<RemoveRewardAssignmentPayload>,
): Generator<any, void, any> {
  const { entity: id, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();

  if (!session) {
    yield put(removeRewardAssignmentSuccess(id));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  yield* assertCanManageRewardsOnServer();

  try {
    yield* callMultideviceApi(token =>
      deleteFamilyReward(token, session.familyId, id),
    );
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      error.status !== 404
    ) {
      throw error;
    }
  }

  yield put(removeRewardAssignmentSuccess(id));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

export default [
  takeLatestWithFetchable(addRewardAssignment, addRewardAssignmentSaga),
  takeLatestWithFetchable(updateRewardAssignment, updateRewardAssignmentSaga),
  takeLatestWithFetchable(removeRewardAssignment, removeRewardAssignmentSaga),
];
