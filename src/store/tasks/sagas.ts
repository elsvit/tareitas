import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select } from 'redux-saga/effects';

import {
  approveTaskInstance,
  createTaskInstance,
  getTaskInstance,
  mapServerTaskToLocal,
  rejectTaskInstance,
  toCreateTaskBody,
  toUpdateTaskBody,
  unapproveTaskInstance,
  updateTaskInstance,
} from '~/services/api/tasksApi';
import { ApiError } from '~/services/api/client';
import {
  assertMultideviceSession,
  callMultideviceApi,
  type MultideviceSession,
} from '~/store/helpers/multideviceSession';
import { takeLatestWithFetchable } from '../helpers/fetchableHandler';
import { RootStateT } from '~/store';
import {
  addTask,
  addTaskSuccess,
  removeTask,
  removeTaskSuccess,
  updateTask,
  updateTaskSuccess,
} from './slice';
import { selectTaskById } from './selectors';
import { AddTasksPayload, RemoveTasksPayload, UpdateTasksPayload } from './types';
import { ETaskStatus } from '~/types/ETask';
import type { ITask } from '~/types/ITask';

function* upsertTaskInstanceOnServer(
  session: MultideviceSession,
  entity: ITask,
  preferUpdate: boolean,
): Generator<any, ReturnType<typeof mapServerTaskToLocal>, any> {
  const saveUpdate = () =>
    callMultideviceApi((token: string) =>
      updateTaskInstance(
        token,
        session.familyId,
        entity.id,
        toUpdateTaskBody(entity),
      ),
    );

  const saveCreate = () =>
    callMultideviceApi((token: string) =>
      createTaskInstance(
        token,
        session.familyId,
        toCreateTaskBody(entity),
      ),
    );

  if (preferUpdate) {
    try {
      const serverTask = yield* saveUpdate();

      return mapServerTaskToLocal(serverTask);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) {
        throw error;
      }
    }
  }

  try {
    const serverTask = yield* saveCreate();

    return mapServerTaskToLocal(serverTask);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 409
    ) {
      const serverTask = yield* saveUpdate();

      return mapServerTaskToLocal(serverTask);
    }

    throw error;
  }
}

function* fetchTaskFromServer(
  session: MultideviceSession,
  taskId: string,
): Generator<any, ReturnType<typeof mapServerTaskToLocal>, any> {
  const serverTask = yield* callMultideviceApi((token: string) =>
    getTaskInstance(token, session.familyId, taskId),
  );

  return mapServerTaskToLocal(serverTask);
}

function* ensureCompletedTaskOnServer(
  session: MultideviceSession,
  entity: ITask,
  preferUpdate: boolean,
): Generator<any, ReturnType<typeof mapServerTaskToLocal>, any> {
  return yield* upsertTaskInstanceOnServer(
    session,
    {
      ...entity,
      status: ETaskStatus.Completed,
    },
    preferUpdate,
  );
}

function* runTaskReviewAction(
  session: MultideviceSession,
  entity: ITask,
  preferUpdate: boolean,
  action: 'approve' | 'reject',
): Generator<any, ReturnType<typeof mapServerTaskToLocal>, any> {
  const callReview = () =>
    callMultideviceApi((token: string) =>
      action === 'approve'
        ? approveTaskInstance(token, session.familyId, entity.id)
        : rejectTaskInstance(token, session.familyId, entity.id),
    );

  const targetStatus =
    action === 'approve' ? ETaskStatus.Approved : ETaskStatus.Rejected;

  try {
    const serverTask = yield* callReview();

    return mapServerTaskToLocal(serverTask);
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }

    if (error.status === 404) {
      yield* ensureCompletedTaskOnServer(session, entity, preferUpdate);
      const serverTask = yield* callReview();

      return mapServerTaskToLocal(serverTask);
    }

    if (error.status !== 409 && error.status !== 403) {
      throw error;
    }

    let serverTask: ReturnType<typeof mapServerTaskToLocal>;

    try {
      serverTask = yield* fetchTaskFromServer(session, entity.id);
    } catch (fetchError) {
      if (
        fetchError instanceof ApiError &&
        fetchError.status === 404
      ) {
        yield* ensureCompletedTaskOnServer(session, entity, preferUpdate);
        const createdTask = yield* callReview();

        return mapServerTaskToLocal(createdTask);
      }

      throw fetchError;
    }

    if (serverTask.status === targetStatus) {
      return serverTask;
    }

    if (serverTask.status === ETaskStatus.Approved) {
      if (action === 'approve') {
        return serverTask;
      }

      throw error;
    }

    if (serverTask.status !== ETaskStatus.Completed) {
      serverTask = yield* ensureCompletedTaskOnServer(
        session,
        entity,
        true,
      );
    }

    const reviewedTask = yield* callReview();

    return mapServerTaskToLocal(reviewedTask);
  }
}

function* unapproveTaskOnServer(
  session: MultideviceSession,
  entity: ITask,
): Generator<any, ReturnType<typeof mapServerTaskToLocal>, any> {
  try {
    const serverTask = yield* callMultideviceApi((token: string) =>
      unapproveTaskInstance(token, session.familyId, entity.id),
    );

    return mapServerTaskToLocal(serverTask);
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }

    if (error.status === 409) {
      const serverTask = yield* fetchTaskFromServer(session, entity.id);

      if (serverTask.status === ETaskStatus.Completed) {
        return serverTask;
      }
    }

    throw error;
  }
}

function* persistTaskOnServer(
  session: MultideviceSession,
  entity: ITask,
  preferUpdate: boolean,
  previousTask?: ITask,
): Generator<any, ReturnType<typeof mapServerTaskToLocal>, any> {
  if (
    previousTask?.status === ETaskStatus.Approved &&
    entity.status === ETaskStatus.Completed
  ) {
    return yield* unapproveTaskOnServer(session, entity);
  }

  if (entity.status === ETaskStatus.Approved) {
    return yield* runTaskReviewAction(
      session,
      entity,
      preferUpdate,
      'approve',
    );
  }

  if (entity.status === ETaskStatus.Rejected) {
    return yield* runTaskReviewAction(
      session,
      entity,
      preferUpdate,
      'reject',
    );
  }

  return yield* upsertTaskInstanceOnServer(
    session,
    entity,
    preferUpdate,
  );
}

function* syncTaskToServer(
  entity: AddTasksPayload['entity'],
  preferUpdate: boolean,
  previousTask?: ITask,
): Generator<any, void, any> {
  const session = yield* assertMultideviceSession();

  if (!session) {
    yield put(
      preferUpdate
        ? updateTaskSuccess(entity)
        : addTaskSuccess(entity),
    );
    return;
  }

  const localTask = yield* persistTaskOnServer(
    session,
    entity,
    preferUpdate,
    previousTask,
  );

  yield put(updateTaskSuccess(localTask));
}

function* addTasksSaga(
  action: PayloadAction<AddTasksPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;

  yield* syncTaskToServer(entity, false);

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* updateTasksSaga(
  action: PayloadAction<UpdateTasksPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const existingTask: ITask | undefined = yield select((state: RootStateT) =>
    selectTaskById(state, entity.id),
  );

  yield* syncTaskToServer(entity, Boolean(existingTask), existingTask);

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* removeTasksSaga(
  action: PayloadAction<RemoveTasksPayload>,
): Generator<any, void, any> {
  const { entity: id, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();

  if (!session) {
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
