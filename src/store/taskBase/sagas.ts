import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select } from 'redux-saga/effects';

import { syncCatalogSaga } from '~/store/catalog/sagas';
import {
  assertMultideviceSession,
} from '~/store/helpers/multideviceSession';
import { resolveAndCacheTaskPicture } from '~/store/helpers/imageRefSync';
import {
  selectIsMultidevice,
} from '~/store/settings/selectors';
import {
  markCatalogDirty,
  queueRemovedTaskBaseId,
} from '~/store/settings/slice';
import { takeLatestWithFetchable } from '../helpers/fetchableHandler';
import {
  addTaskBase,
  addTaskBaseSuccess,
  removeTaskBase,
  removeTaskBaseSuccess,
  updateTaskBase,
  updateTaskBaseSuccess,
} from './slice';
import {
  AddTaskBasePayload,
  RemoveTaskBasePayload,
  UpdateTaskBasePayload,
} from './types';
import type { ITaskBase } from '~/types/ITask';

function* syncCatalogIfMultidevice(): Generator<any, void, any> {
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    return;
  }

  yield put(markCatalogDirty());
  yield call(syncCatalogSaga);
}

function* resolveTaskEntityPictures(
  entity: ITaskBase,
): Generator<any, ITaskBase, any> {
  const session = yield* assertMultideviceSession();

  if (!session || !entity.picture) {
    return entity;
  }

  const resolvedPicture: string | undefined = yield call(
    resolveAndCacheTaskPicture,
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

function* addTaskBaseSaga(
  action: PayloadAction<AddTaskBasePayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    yield put(addTaskBaseSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  try {
    const entityForSync: ITaskBase = yield* resolveTaskEntityPictures(
      entity,
    );
    yield put(addTaskBaseSuccess(entityForSync));
    yield call(syncCatalogIfMultidevice);
  } catch (error) {
    yield put(removeTaskBaseSuccess(entity.id));
    throw error;
  }

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* updateTaskBaseSaga(
  action: PayloadAction<UpdateTaskBasePayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    yield put(updateTaskBaseSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  const entityForSync: ITaskBase = yield* resolveTaskEntityPictures(
    entity,
  );
  yield put(updateTaskBaseSuccess(entityForSync));
  yield call(syncCatalogIfMultidevice);

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* removeTaskBaseSaga(
  action: PayloadAction<RemoveTaskBasePayload>,
): Generator<any, void, any> {
  const { id, onSuccess } = action.payload;
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    yield put(removeTaskBaseSuccess(id));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  yield put(queueRemovedTaskBaseId(id));
  yield call(syncCatalogIfMultidevice);

  if (onSuccess) {
    yield call(onSuccess);
  }
}

export default [
  takeLatestWithFetchable(addTaskBase, addTaskBaseSaga),
  takeLatestWithFetchable(updateTaskBase, updateTaskBaseSaga),
  takeLatestWithFetchable(removeTaskBase, removeTaskBaseSaga),
];
