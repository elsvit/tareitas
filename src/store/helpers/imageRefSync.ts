import { call, put, select } from 'redux-saga/effects';

import { resolveImageRefForServer } from '~/services/imageSync';
import {
  fetchMediaAccessUrl,
  isObjectStoragePath,
  toAbsoluteUploadUrl,
} from '~/services/api/uploadsApi';
import { isRemoteImageRef } from '~/utils/imageRefs';
import {
  selectRewardImageUrls,
  selectTaskImageUrls,
  selectUserImageUrls,
  setRewardImageUrl,
  setTaskImageUrl,
  setUserImageUrl,
} from '~/store/images';
import type { ImageStoreKind } from '~/store/images/types';
import { selectAuthToken } from '~/store/settings/selectors';

function selectUrlsForKind(kind: ImageStoreKind) {
  switch (kind) {
    case 'task':
      return selectTaskImageUrls;
    case 'reward':
      return selectRewardImageUrls;
    case 'user':
      return selectUserImageUrls;
  }
}

function cacheResolvedImageUrl(
  kind: ImageStoreKind,
  resolvedId: string,
  localUri: string,
) {
  switch (kind) {
    case 'task':
      return setTaskImageUrl({ id: resolvedId, uri: localUri });
    case 'reward':
      return setRewardImageUrl({ id: resolvedId, uri: localUri });
    case 'user':
      return setUserImageUrl({ id: resolvedId, uri: localUri });
  }
}

export function* resolveAndCacheImageRef(
  value: string | undefined,
  kind: ImageStoreKind,
  familyId: string,
): Generator<any, string | undefined, any> {
  const localUrls: Record<string, string> = yield select(
    selectUrlsForKind(kind),
  );
  const resolved: string | undefined = yield call(
    resolveImageRefForServer,
    value,
    localUrls,
    familyId,
    undefined,
    kind,
  );

  if (
    resolved &&
    value &&
    resolved !== value &&
    localUrls[value]
  ) {
    yield put(
      cacheResolvedImageUrl(
        kind,
        resolved,
        localUrls[value],
      ),
    );
  } else if (resolved && isRemoteImageRef(resolved)) {
    const existingUri = localUrls[resolved];

    if (!existingUri?.startsWith('file:')) {
      let displayUri =
        existingUri ?? toAbsoluteUploadUrl(resolved);

      if (
        !displayUri &&
        isObjectStoragePath(resolved)
      ) {
        const authToken: string | null = yield select(
          selectAuthToken,
        );

        if (authToken) {
          displayUri = yield call(
            fetchMediaAccessUrl,
            familyId,
            authToken,
            resolved,
          );
        }
      }

      if (displayUri) {
        yield put(
          cacheResolvedImageUrl(
            kind,
            resolved,
            displayUri,
          ),
        );
      }
    }
  }

  return resolved;
}

export function* resolveAndCacheMemberAvatar(
  avatar: string | undefined,
  familyId: string,
): Generator<any, string | undefined, any> {
  return yield* resolveAndCacheImageRef(
    avatar,
    'user',
    familyId,
  );
}

export function* resolveAndCacheTaskPicture(
  picture: string | undefined,
  familyId: string,
): Generator<any, string | undefined, any> {
  return yield* resolveAndCacheImageRef(
    picture,
    'task',
    familyId,
  );
}

export function* resolveAndCacheRewardPicture(
  picture: string | undefined,
  familyId: string,
): Generator<any, string | undefined, any> {
  return yield* resolveAndCacheImageRef(
    picture,
    'reward',
    familyId,
  );
}
