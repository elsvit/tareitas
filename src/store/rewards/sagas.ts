import { PayloadAction } from '@reduxjs/toolkit';
import { call, put } from 'redux-saga/effects';

import {
  approveRewardRedemption,
  mapServerRedemptionToLocal,
  redeemFamilyReward,
  rejectRewardRedemption,
} from '~/services/api/rewardsApi';
import { ERewardStatus } from '~/types/EReward';
import {
  assertMultideviceSession,
  callMultideviceApi,
} from '~/store/helpers/multideviceSession';
import { takeLatestWithFetchable } from '../helpers/fetchableHandler';
import {
  addReward,
  addRewardSuccess,
  removeReward,
  removeRewardSuccess,
  updateReward,
  updateRewardSuccess,
} from './slice';
import {
  AddRewardPayload,
  RemoveRewardPayload,
  UpdateRewardPayload,
} from './types';

function* addRewardSaga(
  action: PayloadAction<AddRewardPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();

  if (!session) {
    yield put(addRewardSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  const redemption = yield* callMultideviceApi(token =>
    redeemFamilyReward(
      token,
      session.familyId,
      entity.rewardAssignmentId,
    ),
  );

  yield put(addRewardSuccess(mapServerRedemptionToLocal(redemption)));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* updateRewardSaga(
  action: PayloadAction<UpdateRewardPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();

  if (!session) {
    yield put(updateRewardSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  if (entity.status === ERewardStatus.Approved) {
    const redemption = yield* callMultideviceApi(token =>
      approveRewardRedemption(
        token,
        session.familyId,
        entity.id,
      ),
    );

    yield put(
      updateRewardSuccess({
        ...mapServerRedemptionToLocal(redemption),
        completedDate: entity.completedDate,
      }),
    );
  } else if (entity.status === ERewardStatus.Rejected) {
    const redemption = yield* callMultideviceApi(token =>
      rejectRewardRedemption(
        token,
        session.familyId,
        entity.id,
      ),
    );

    yield put(updateRewardSuccess(mapServerRedemptionToLocal(redemption)));
  } else {
    yield put(updateRewardSuccess(entity));
  }

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* removeRewardSaga(
  action: PayloadAction<RemoveRewardPayload>,
): Generator<any, void, any> {
  const { entity: id, onSuccess } = action.payload;

  // Server has no cancel endpoint for pending redemptions.
  yield put(removeRewardSuccess(id));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

export default [
  takeLatestWithFetchable(addReward, addRewardSaga),
  takeLatestWithFetchable(updateReward, updateRewardSaga),
  takeLatestWithFetchable(removeReward, removeRewardSaga),
];
