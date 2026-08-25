import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select } from 'redux-saga/effects';

import { syncCatalogSaga } from '~/store/catalog/sagas';
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

function* syncCatalogIfMultidevice(): Generator<any, void, any> {
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    return;
  }

  yield put(markCatalogDirty());
  yield call(syncCatalogSaga);
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
    yield put(addRewardBaseSuccess(entity));
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

  yield put(updateRewardBaseSuccess(entity));
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
