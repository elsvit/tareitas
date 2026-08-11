import { PayloadAction } from '@reduxjs/toolkit';
import { call, put } from 'redux-saga/effects';

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

function* addChildrenSaga(action: PayloadAction<AddChildrenPayload>) {
  const { entity, onSuccess } = action.payload;

  // Immediately reflect entity in the store
  yield put(addChildSuccess(entity));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* updateChildrenSaga(action: PayloadAction<UpdateChildrenPayload>) {
  const { entity, onSuccess } = action.payload;

  // Upsert user into the store
  yield put(updateChildSuccess(entity));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* removeChildrenSaga(action: PayloadAction<RemoveChildrenPayload>) {
  const { id, onSuccess } = action.payload;

  // Remove user by id from the store
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
