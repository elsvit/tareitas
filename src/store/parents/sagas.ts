import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select } from 'redux-saga/effects';

import {
  createParentMember,
  deleteParentMember,
  updateParentMember,
} from '~/services/api/membersApi';
import {
  mapServerParentToLocal,
  toCreateParentPayload,
  toUpdateParentPayload,
} from '~/services/api/memberMappers';
import { ERole } from '~/store/settings/enums';
import { selectIsMultidevice } from '~/store/settings/selectors';
import { assertMultideviceSession } from '~/store/helpers/multideviceSession';
import { takeLatestWithFetchable } from '../helpers/fetchableHandler';
import {
  addParent,
  addParentSuccess,
  removeParent,
  removeParentSuccess,
  updateParent,
  updateParentSuccess,
} from './slice';
import { AddParentPayload, RemoveParentPayload, UpdateParentPayload } from './types';

function* addParentSaga(
  action: PayloadAction<AddParentPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();

  if (!session) {
    yield put(addParentSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  const serverParent = yield call(
    createParentMember,
    session.authToken,
    session.familyId,
    toCreateParentPayload(entity),
  );

  const syncedEntity = mapServerParentToLocal(
    serverParent,
    session.currentUser,
    entity.passwordPattern,
    entity,
  );

  yield put(addParentSuccess(syncedEntity));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* updateParentSaga(
  action: PayloadAction<UpdateParentPayload>,
): Generator<any, void, any> {
  const { entity, onSuccess } = action.payload;
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    yield put(updateParentSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  if (entity.role === ERole.admin || entity.email?.trim()) {
    yield put(updateParentSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  const session = yield* assertMultideviceSession();

  if (!session) {
    yield put(updateParentSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  const serverParent = yield call(
    updateParentMember,
    session.authToken,
    session.familyId,
    entity.id,
    toUpdateParentPayload(entity),
  );

  yield put(
    updateParentSuccess(
      mapServerParentToLocal(
        serverParent,
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

function* removeParentSaga(
  action: PayloadAction<RemoveParentPayload>,
): Generator<any, void, any> {
  const { id, onSuccess } = action.payload;
  const session = yield* assertMultideviceSession();

  if (session) {
    yield call(
      deleteParentMember,
      session.authToken,
      session.familyId,
      id,
    );
  }

  yield put(removeParentSuccess(id));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

export default [
  takeLatestWithFetchable(addParent, addParentSaga),
  takeLatestWithFetchable(updateParent, updateParentSaga),
  takeLatestWithFetchable(removeParent, removeParentSaga),
];
