import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select } from 'redux-saga/effects';

import {
  createTaskInstance,
  mapServerTaskToLocal,
  toCreateTaskBody,
  toUpdateTaskBody,
  updateTaskInstance,
} from '~/services/api/tasksApi';
import {
  selectAuthToken,
  selectFamilyId,
  selectIsMultidevice,
} from '~/store/settings/selectors';
import { takeLatestWithFetchable } from '../helpers/fetchableHandler';
import {
  addTask,
  addTaskSuccess,
  removeTask,
  removeTaskSuccess,
  updateTask,
  updateTaskSuccess,
} from './slice';
import { AddTasksPayload, RemoveTasksPayload, UpdateTasksPayload } from './types';

function* addTasksSaga(
  action: PayloadAction<AddTasksPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    yield put(addTaskSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  const authToken: string | null = yield select(selectAuthToken);
  const familyId: string | null = yield select(selectFamilyId);

  if (!authToken || !familyId) {
    throw new Error('Missing multidevice session');
  }

  const serverTask = yield call(
    createTaskInstance,
    authToken,
    familyId,
    toCreateTaskBody(entity),
  );

  yield put(addTaskSuccess(mapServerTaskToLocal(serverTask)));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* updateTasksSaga(
  action: PayloadAction<UpdateTasksPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    yield put(updateTaskSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  const authToken: string | null = yield select(selectAuthToken);
  const familyId: string | null = yield select(selectFamilyId);

  if (!authToken || !familyId) {
    throw new Error('Missing multidevice session');
  }

  const serverTask = yield call(
    updateTaskInstance,
    authToken,
    familyId,
    entity.id,
    toUpdateTaskBody(entity),
  );

  yield put(updateTaskSuccess(mapServerTaskToLocal(serverTask)));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* removeTasksSaga(
  action: PayloadAction<RemoveTasksPayload>,
): Generator<any, void, any> {
  const { entity: id, onSuccess } = action.payload;
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    yield put(removeTaskSuccess(id));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  // Task delete API is optional for generated instances; keep local-only removal.
  yield put(removeTaskSuccess(id));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

export default [
  takeLatestWithFetchable(addTask, addTasksSaga),
  takeLatestWithFetchable(updateTask, updateTasksSaga),
  takeLatestWithFetchable(removeTask, removeTasksSaga),
];
