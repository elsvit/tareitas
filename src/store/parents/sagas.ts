import { PayloadAction } from '@reduxjs/toolkit';
import { call, put } from 'redux-saga/effects';

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

function* addParentSaga(action: PayloadAction<AddParentPayload>) {
  const { entity, onSuccess } = action.payload;

  // Immediately reflect entity in the store
  yield put(addParentSuccess(entity));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* updateParentSaga(action: PayloadAction<UpdateParentPayload>) {
  const { entity, onSuccess } = action.payload;

  // Upsert parent into the store
  yield put(updateParentSuccess(entity));

  if (onSuccess) {
    yield call(onSuccess);
  }
}

function* removeParentSaga(action: PayloadAction<RemoveParentPayload>) {
  const { id, onSuccess } = action.payload;
  yield put(removeParentSuccess(id));
  // Remove user by id from the store
  if (onSuccess) {
    yield call(onSuccess);
  }
}

export default [
  takeLatestWithFetchable(addParent, addParentSaga),
  takeLatestWithFetchable(updateParent, updateParentSaga),
  takeLatestWithFetchable(removeParent, removeParentSaga),
];
