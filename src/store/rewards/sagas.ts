import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select } from 'redux-saga/effects';

import {
  approveRewardRedemption,
  completeRewardRedemption,
  mapServerRedemptionToLocal,
  redeemFamilyReward,
  rejectRewardRedemption,
} from '~/services/api/rewardsApi';
import { ApiError } from '~/services/api/client';
import { ERewardStatus } from '~/types/EReward';
import {
  assertMultideviceSession,
  callMultideviceApi,
} from '~/store/helpers/multideviceSession';
import { takeLatestWithFetchable } from '../helpers/fetchableHandler';
import { RootStateT } from '~/store';
import {
  addReward,
  addRewardSuccess,
  removeReward,
  removeRewardSuccess,
  updateReward,
  updateRewardSuccess,
} from './slice';
import { selectRewardById, selectAllRewards } from './selectors';
import {
  AddRewardPayload,
  RemoveRewardPayload,
  UpdateRewardPayload,
} from './types';
import { syncRewardsData } from '~/store/settings/slice';
import { IReward } from '~/types/IReward';

function resolveRedemptionIdForComplete(
  rewards: IReward[],
  entity: IReward,
): string {
  const approvedMatches = rewards.filter(
    reward =>
      reward.rewardAssignmentId === entity.rewardAssignmentId &&
      reward.childId === entity.childId &&
      reward.status === ERewardStatus.Approved &&
      !reward.completedDate,
  );

  if (approvedMatches.some(reward => reward.id === entity.id)) {
    return entity.id;
  }

  if (approvedMatches.length === 0) {
    return entity.id;
  }

  return approvedMatches.reduce((latest, current) => {
    const latestTime = latest.updatedAt ?? latest.createdAt ?? '';
    const currentTime = current.updatedAt ?? current.createdAt ?? '';

    return currentTime >= latestTime ? current : latest;
  }).id;
}

function* updateRewardSaga(
  action: PayloadAction<UpdateRewardPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const existingReward = yield select((state: RootStateT) =>
    selectRewardById(state, entity.id),
  );
  const session = yield* assertMultideviceSession();

  const finish = function* (reward: typeof entity) {
    yield put(updateRewardSuccess(reward));

    if (onSuccess) {
      yield call(onSuccess);
    }
  };

  if (entity.completedDate) {
    if (!session) {
      yield* finish(entity);
      return;
    }

    const allRewards: IReward[] = yield select(selectAllRewards);
    const redemptionId = resolveRedemptionIdForComplete(
      allRewards,
      entity,
    );

    try {
      const redemption = yield* callMultideviceApi(token =>
        completeRewardRedemption(
          token,
          session.familyId,
          redemptionId,
        ),
      );

      const mapped = mapServerRedemptionToLocal(redemption);

      yield* finish({
        ...mapped,
        completedDate: mapped.completedDate ?? entity.completedDate,
      });
      yield put(syncRewardsData());
    } catch (error) {
      throw error;
    }

    return;
  }

  if (!session) {
    yield* finish(entity);
    return;
  }

  if (
    entity.status === ERewardStatus.Approved &&
    existingReward?.status !== ERewardStatus.Approved
  ) {
    try {
      const redemption = yield* callMultideviceApi(token =>
        approveRewardRedemption(
          token,
          session.familyId,
          entity.id,
        ),
      );

      yield* finish({
        ...mapServerRedemptionToLocal(redemption),
        completedDate: entity.completedDate,
      });
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 409 &&
        existingReward?.status === ERewardStatus.Selected
      ) {
        yield* finish({
          ...entity,
          status: ERewardStatus.Approved,
        });
        return;
      }

      throw error;
    }

    return;
  }

  if (
    entity.status === ERewardStatus.Rejected &&
    existingReward?.status === ERewardStatus.Selected
  ) {
    const redemption = yield* callMultideviceApi(token =>
      rejectRewardRedemption(
        token,
        session.familyId,
        entity.id,
      ),
    );

    yield* finish(mapServerRedemptionToLocal(redemption));
    return;
  }

  yield* finish(entity);
}

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
