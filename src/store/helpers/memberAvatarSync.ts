import { call, put, select } from 'redux-saga/effects';

import { resolveImageRefForServer } from '~/services/imageSync';
import { selectUserImageUrls, setUserImageUrl } from '~/store/images';

export function* resolveAndCacheMemberAvatar(
  avatar: string | undefined,
  familyId: string,
  authToken: string,
): Generator<any, string | undefined, any> {
  const userUrls: Record<string, string> = yield select(
    selectUserImageUrls,
  );
  const resolvedAvatar: string | undefined = yield call(
    resolveImageRefForServer,
    avatar,
    userUrls,
    familyId,
    authToken,
  );

  if (
    resolvedAvatar &&
    avatar &&
    resolvedAvatar !== avatar &&
    userUrls[avatar]
  ) {
    yield put(
      setUserImageUrl({
        id: resolvedAvatar,
        uri: userUrls[avatar],
      }),
    );
  }

  return resolvedAvatar;
}
