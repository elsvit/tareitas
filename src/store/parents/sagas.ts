import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select } from 'redux-saga/effects';

import {
  createParentMember,
  deleteParentMember,
  updateMyMemberProfile,
  updateParentMember,
} from '~/services/api/membersApi';
import {
  mapServerParentToLocal,
  toCreateParentPayload,
  toUpdateParentPayload,
} from '~/services/api/memberMappers';
import { ERole } from '~/store/settings/enums';
import { selectIsMultidevice } from '~/store/settings/selectors';
import {
  assertMultideviceSession,
  callMultideviceApi,
} from '~/store/helpers/multideviceSession';
import { resolveAndCacheMemberAvatar } from '~/store/helpers/imageRefSync';
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

function* syncParentAvatar(
  avatar: string | undefined,
  familyId: string,
) {
  return yield call(
    resolveAndCacheMemberAvatar,
    avatar,
    familyId,
  );
}

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

  const resolvedAvatar: string | undefined = yield* syncParentAvatar(
    entity.avatar,
    session.familyId,
  );
  const entityForServer = {
    ...entity,
    avatar: resolvedAvatar,
  };

  const serverParent = yield* callMultideviceApi(token =>
    createParentMember(
      token,
      session.familyId,
      toCreateParentPayload(entityForServer),
    ),
  );

  const syncedEntity = mapServerParentToLocal(
    serverParent,
    session.currentUser,
    entity.passwordPattern,
    entityForServer,
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

  const session = yield* assertMultideviceSession();

  if (!session) {
    yield put(updateParentSuccess(entity));

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  const resolvedAvatar: string | undefined = yield* syncParentAvatar(
    entity.avatar,
    session.familyId,
  );
  const entityForServer = {
    ...entity,
    avatar: resolvedAvatar,
  };

  if (entity.role === ERole.admin) {
    const profile = yield* callMultideviceApi(token =>
      updateMyMemberProfile(token, session.familyId, {
        name: entityForServer.name.trim(),
        color: entityForServer.color,
        avatar: entityForServer.avatar,
      }),
    );

    yield put(
      updateParentSuccess({
        ...entityForServer,
        name: profile.name,
        color: profile.color ?? entityForServer.color,
        avatar: profile.avatar ?? entityForServer.avatar,
        role: ERole.admin,
      }),
    );

    if (onSuccess) {
      yield call(onSuccess);
    }

    return;
  }

  const serverParent = yield* callMultideviceApi(token =>
    updateParentMember(
      token,
      session.familyId,
      entity.id,
      toUpdateParentPayload(entityForServer),
    ),
  );

  yield put(
    updateParentSuccess(
      mapServerParentToLocal(
        serverParent,
        session.currentUser,
        entity.passwordPattern,
        entityForServer,
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
    yield* callMultideviceApi(token =>
      deleteParentMember(
        token,
        session.familyId,
        id,
      ),
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
