import { PayloadAction } from '@reduxjs/toolkit';
import { call, put } from 'redux-saga/effects';

import {
  createChildMember,
  deleteChildMember,
  updateChildMember,
} from '~/services/api/membersApi';
import {
  mapServerChildToLocal,
  toCreateChildPayload,
  toUpdateChildPayload,
} from '~/services/api/memberMappers';
import { assertMultideviceSession } from '~/store/helpers/multideviceSession';
import { takeLatestWithFetchable } from '../helpers/fetchableHandler';
import {
  addChild,
  addChildSuccess,
  removeChild,
  removeChildSuccess,
  updateChild,
  updateChildSuccess,
} from './slice';
import { AddChildrenPayload, RemoveChildrenPayload, UpdateChildrenPayload } from './types';

function* addChildrenSaga(
  action: PayloadAction<AddChildrenPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();

  if (!session) {
    yield put(addChildSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  const serverChild = yield call(
    createChildMember,
    session.authToken,
    session.familyId,
    toCreateChildPayload(entity),
  );

  const syncedEntity = mapServerChildToLocal(
    serverChild,
    session.currentUser,
    entity.passwordPattern,
    entity,
  );

  yield put(addChildSuccess(syncedEntity));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* updateChildrenSaga(
  action: PayloadAction<UpdateChildrenPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();

  if (!session) {
    yield put(updateChildSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  const serverChild = yield call(
    updateChildMember,
    session.authToken,
    session.familyId,
    entity.id,
    toUpdateChildPayload(entity),
  );

  yield put(
    updateChildSuccess(
      mapServerChildToLocal(
        serverChild,
        session.currentUser,
        entity.passwordPattern,
        entity,
      ),
    ),
  );

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* removeChildrenSaga(
  action: PayloadAction<RemoveChildrenPayload>,
): Generator<any, void, any> {
  const { id, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();

  if (session) {
    yield call(
      deleteChildMember,
      session.authToken,
      session.familyId,
      id,
    );
  }

  yield put(removeChildSuccess(id));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

export default [
  takeLatestWithFetchable(addChild, addChildrenSaga),
  takeLatestWithFetchable(updateChild, updateChildrenSaga),
  takeLatestWithFetchable(removeChild, removeChildrenSaga),
];
