import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select } from 'redux-saga/effects';

import { deleteImageFromDevice } from '~/components/ui/ImageLoader/ImageLoader.utils';
import {
  deleteFamilyImage as deleteFamilyImageApi,
  listFamilyImages,
  toAbsoluteUploadUrl,
} from '~/services/api/uploadsApi';
import { isRemoteImageRef } from '~/services/imageSync';
import {
  assertMultideviceSession,
  callMultideviceApi,
} from '~/store/helpers/multideviceSession';
import { takeLatestWithFetchable } from '~/store/helpers/fetchableHandler';
import { selectIsMultidevice } from '~/store/settings/selectors';
import type { IState } from '~/store/types';

import {
  deleteFamilyImage,
  mergeFamilyImagesFromServer,
  removeRewardImageUrl,
  removeTaskImageUrl,
  removeUserImageUrl,
} from './slice';
import type { ImageStoreKind } from './types';

export type DeleteFamilyImagePayload = {
  kind: ImageStoreKind;
  path: string;
  uri: string;
};

export function* syncFamilyImagesFromServerSaga(): Generator<
  any,
  void,
  any
> {
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (!isMultidevice) {
    return;
  }

  const session = yield* assertMultideviceSession();

  if (!session) {
    return;
  }

  const { images } = yield* callMultideviceApi(token =>
    listFamilyImages(token, session.familyId),
  );

  const state: IState = yield select(
    (currentState: IState) => currentState,
  );

  const merged = images.map(image => {
    const remoteUri =
      toAbsoluteUploadUrl(image.path) ?? image.path;
    const existing =
      image.kind === 'task'
        ? state.images.taskUrls[image.path]
        : image.kind === 'reward'
          ? state.images.rewardUrls[image.path]
          : state.images.userUrls[image.path];

    return {
      kind: image.kind,
      path: image.path,
      uri: existing?.startsWith('file:') ? existing : remoteUri,
    };
  });

  yield put(mergeFamilyImagesFromServer(merged));
}

function* deleteFamilyImageSaga(
  action: PayloadAction<DeleteFamilyImagePayload>,
): Generator<any, void, any> {
  const { kind, path, uri } = action.payload;
  const isMultidevice: boolean = yield select(selectIsMultidevice);

  if (isMultidevice && isRemoteImageRef(path)) {
    const session = yield* assertMultideviceSession();

    if (session) {
      yield* callMultideviceApi(token =>
        deleteFamilyImageApi(token, session.familyId, path),
      );
    }
  }

  if (kind === 'task') {
    yield put(removeTaskImageUrl(path));
  } else if (kind === 'reward') {
    yield put(removeRewardImageUrl(path));
  } else {
    yield put(removeUserImageUrl(path));
  }

  if (uri.startsWith('file:')) {
    yield call(deleteImageFromDevice, uri);
  }
}

export default [
  takeLatestWithFetchable(
    deleteFamilyImage,
    deleteFamilyImageSaga,
  ),
];
