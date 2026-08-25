import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select } from 'redux-saga/effects';

import { syncCatalogSaga } from '~/store/catalog/sagas';
import {
  assertMultideviceSession,
} from '~/store/helpers/multideviceSession';
import { resolveAndCacheRewardPicture } from '~/store/helpers/imageRefSync';
import {
  selectIsMultidevice,
} from '~/store/settings/selectors';
import {
  markCatalogDirty,
  queueRemovedRewardBaseId,
} from '~/store/settings/slice';
import { takeLatestWithFetchable } from '../helpers/fetchableHandler';
import {
  addRewardBase,
  addRewardBaseSuccess,
  removeRewardBase,
  removeRewardBaseSuccess,
  updateRewardBase,
  updateRewardBaseSuccess,
} from './slice';
import {
  AddRewardBasePayload,
  RemoveRewardBasePayload,
  UpdateRewardBasePayload,
} from './types';
import type { IRewardBase } from '~/types/IReward';

function* syncCatalogIfMultidevice(): Generator<any, void, any> {
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    return;
  }

  yield put(markCatalogDirty());
  yield call(syncCatalogSaga);
}

function* resolveRewardEntityPictures(
  entity: IRewardBase,
): Generator<any, IRewardBase, any> {
  const session = yield* assertMultideviceSession();

  if (!session || !entity.picture) {
    return entity;
  }

  const resolvedPicture: string | undefined = yield call(
    resolveAndCacheRewardPicture,
    entity.picture,
    session.familyId,
  );

  if (!resolvedPicture || resolvedPicture === entity.picture) {
    return entity;
  }

  return {
    ...entity,
    picture: resolvedPicture,
  };
}

function* addRewardBaseSaga(
  action: PayloadAction<AddRewardBasePayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    yield put(addRewardBaseSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  try {
    const entityForSync: IRewardBase = yield* resolveRewardEntityPictures(
      entity,
    );
    yield put(addRewardBaseSuccess(entityForSync));
    yield call(syncCatalogIfMultidevice);
  } catch (error) {
    yield put(removeRewardBaseSuccess(entity.id));
    throw error;
  }

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* updateRewardBaseSaga(
  action: PayloadAction<UpdateRewardBasePayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    yield put(updateRewardBaseSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  const entityForSync: IRewardBase = yield* resolveRewardEntityPictures(
    entity,
  );
  yield put(updateRewardBaseSuccess(entityForSync));
  yield call(syncCatalogIfMultidevice);

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* removeRewardBaseSaga(
  action: PayloadAction<RemoveRewardBasePayload>,
): Generator<any, void, any> {
  const { id, onSuccess } = action.payload;
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    yield put(removeRewardBaseSuccess(id));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  yield put(queueRemovedRewardBaseId(id));
  yield call(syncCatalogIfMultidevice);

  if (onSuccess) {
    yield call(onSuccess);
  }
}

export default [
  takeLatestWithFetchable(addRewardBase, addRewardBaseSaga),
  takeLatestWithFetchable(updateRewardBase, updateRewardBaseSaga),
  takeLatestWithFetchable(removeRewardBase, removeRewardBaseSaga),
];
