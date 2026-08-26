import { PayloadAction } from '@reduxjs/toolkit';
import { call, put } from 'redux-saga/effects';

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
import { takeLatestWithFetchable } from '../helpers/fetchableHandler';
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

function* addRewardAssignmentSaga(
  action: PayloadAction<AddRewardAssignmentPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();

  if (!session) {
    yield put(addRewardAssignmentSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  let picture = entity.picture;

  if (picture) {
    picture =
      (yield call(
        resolveAndCacheRewardPicture,
        picture,
        session.familyId,
      )) ?? picture;
  }

  const serverReward = yield* callMultideviceApi(token =>
    createFamilyReward(
      token,
      session.familyId,
      toCreateFamilyRewardBody(entity),
    ),
  );

  yield put(
    addRewardAssignmentSuccess({
      ...mapServerFamilyRewardToAssignment(serverReward),
      picture,
      childIds: entity.childIds,
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

  if (!session) {
    yield put(updateRewardAssignmentSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  let picture = entity.picture;

  if (picture) {
    picture =
      (yield call(
        resolveAndCacheRewardPicture,
        picture,
        session.familyId,
      )) ?? picture;
  }

  const entityWithPicture = { ...entity, picture };

  try {
    const serverReward = yield* callMultideviceApi(token =>
      updateFamilyReward(
        token,
        session.familyId,
        entity.id,
        toUpdateFamilyRewardBody(entity),
      ),
    );

    yield put(
      updateRewardAssignmentSuccess({
        ...mapServerFamilyRewardToAssignment(serverReward),
        picture,
        childIds: entity.childIds,
      }),
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      const serverReward = yield* callMultideviceApi(token =>
        createFamilyReward(
          token,
          session.familyId,
          toCreateFamilyRewardBody(entityWithPicture),
        ),
      );

      yield put(
        updateRewardAssignmentSuccess({
          ...mapServerFamilyRewardToAssignment(serverReward),
          picture,
          childIds: entity.childIds,
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
