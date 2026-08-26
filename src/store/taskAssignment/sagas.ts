import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeEvery } from 'redux-saga/effects';

import {
  createTaskAssignment as createTaskAssignmentApi,
  deleteTaskAssignment as deleteTaskAssignmentApi,
  mapServerTaskAssignmentToLocal,
  toCreateTaskAssignmentBody,
  toUpdateTaskAssignmentBody,
  updateTaskAssignment as updateTaskAssignmentApi,
} from '~/services/api/taskAssignmentsApi';
import { ApiError } from '~/services/api/client';
import {
  assertMultideviceSession,
  callMultideviceApi,
} from '~/store/helpers/multideviceSession';
import { resolveAndCacheTaskPicture } from '~/store/helpers/imageRefSync';
import {
  takeLatestWithFetchable,
  withFetchable,
} from '../helpers/fetchableHandler';
import {
  addTaskAssignment,
  addTaskAssignmentSuccess,
  addTaskAssignmentsBatch,
  removeTaskAssignment,
  removeTaskAssignmentSuccess,
  updateTaskAssignment,
  updateTaskAssignmentSuccess,
} from './slice';
import {
  AddTaskAssignmentPayload,
  AddTaskAssignmentsBatchPayload,
  RemoveTaskAssignmentPayload,
  UpdateTaskAssignmentPayload,
} from './types';

function* syncTaskAssignmentPicture(
  picture: string | undefined,
  familyId: string,
) {
  if (!picture) {
    return undefined;
  }

  return yield call(
    resolveAndCacheTaskPicture,
    picture,
    familyId,
  );
}

function* persistTaskAssignment(
  entity: AddTaskAssignmentPayload['entity'],
): Generator<any, void, any> {
  const session = yield* assertMultideviceSession();

  if (!session) {
    yield put(addTaskAssignmentSuccess(entity));
    return;
  }

  const resolvedPicture: string | undefined = yield* syncTaskAssignmentPicture(
    entity.picture,
    session.familyId,
  );
  const entityForServer = {
    ...entity,
    picture: resolvedPicture ?? entity.picture,
  };

  const serverAssignment = yield* callMultideviceApi(token =>
    createTaskAssignmentApi(
      token,
      session.familyId,
      toCreateTaskAssignmentBody(entityForServer),
    ),
  );

  yield put(
    addTaskAssignmentSuccess(
      mapServerTaskAssignmentToLocal(serverAssignment),
    ),
  );
}

function* addTaskAssignmentSaga(
  action: PayloadAction<AddTaskAssignmentPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;

  yield* persistTaskAssignment(entity);

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* addTaskAssignmentsBatchSaga(
  action: PayloadAction<AddTaskAssignmentsBatchPayload>,
): Generator<any, void, any> {
  const { entities, onSuccess } = action.payload;

  for (const entity of entities) {
    yield* persistTaskAssignment(entity);
  }

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* updateTaskAssignmentSaga(
  action: PayloadAction<UpdateTaskAssignmentPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();

  if (!session) {
    yield put(updateTaskAssignmentSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  const resolvedPicture: string | undefined = yield* syncTaskAssignmentPicture(
    entity.picture,
    session.familyId,
  );
  const entityForServer = {
    ...entity,
    picture: resolvedPicture ?? entity.picture,
  };

  try {
    const serverAssignment = yield* callMultideviceApi(token =>
      updateTaskAssignmentApi(
        token,
        session.familyId,
        entity.id,
        toUpdateTaskAssignmentBody(entityForServer),
      ),
    );

    yield put(
      updateTaskAssignmentSuccess(
        mapServerTaskAssignmentToLocal(serverAssignment),
      ),
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404
    ) {
      const serverAssignment = yield* callMultideviceApi(token =>
        createTaskAssignmentApi(
          token,
          session.familyId,
          toCreateTaskAssignmentBody(entityForServer),
        ),
      );

      yield put(
        updateTaskAssignmentSuccess(
          mapServerTaskAssignmentToLocal(serverAssignment),
        ),
      );
    } else {
      throw error;
    }
  }

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* removeTaskAssignmentSaga(
  action: PayloadAction<RemoveTaskAssignmentPayload>,
): Generator<any, void, any> {
  const { entity: id, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();

  if (!session) {
    yield put(removeTaskAssignmentSuccess(id));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  try {
    yield* callMultideviceApi(token =>
      deleteTaskAssignmentApi(token, session.familyId, id),
    );
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      error.status !== 404
    ) {
      throw error;
    }
  }

  yield put(removeTaskAssignmentSuccess(id));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

export default [
  takeLatestWithFetchable(
    addTaskAssignmentsBatch,
    addTaskAssignmentsBatchSaga,
  ),
  takeEvery(
    addTaskAssignment.type,
    withFetchable({
      saga: addTaskAssignmentSaga,
      actionType: addTaskAssignment,
    }) as any,
  ),
  takeLatestWithFetchable(updateTaskAssignment, updateTaskAssignmentSaga),
  takeLatestWithFetchable(removeTaskAssignment, removeTaskAssignmentSaga),
];
