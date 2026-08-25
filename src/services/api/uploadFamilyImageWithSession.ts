import { refreshAuthToken } from '~/services/api/authApi';
import { store } from '~/store/store';
import {
  selectAuthToken,
  selectRefreshToken,
} from '~/store/settings/selectors';
import { updateAuthTokens } from '~/store/settings/slice';

import { ApiError } from './client';
import {
  uploadFamilyImage,
  type UploadedImageResponse,
} from './uploadsApi';

async function resolveAuthToken(): Promise<string> {
  const state = store.getState();
  let authToken = selectAuthToken(state);
  const refreshToken = selectRefreshToken(state);

  if (authToken) {
    return authToken;
  }

  if (!refreshToken) {
    throw new ApiError('Session expired', 401);
  }

  const tokens = await refreshAuthToken(refreshToken);

  store.dispatch(
    updateAuthTokens({
      authToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }),
  );

  return tokens.accessToken;
}

export async function uploadFamilyImageWithSession(
  familyId: string,
  localUri: string,
): Promise<UploadedImageResponse> {
  let authToken = await resolveAuthToken();

  try {
    return await uploadFamilyImage(
      familyId,
      authToken,
      localUri,
    );
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      error.status !== 401
    ) {
      throw error;
    }

    const refreshToken = selectRefreshToken(
      store.getState(),
    );

    if (!refreshToken) {
      throw error;
    }

    const tokens = await refreshAuthToken(refreshToken);

    store.dispatch(
      updateAuthTokens({
        authToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }),
    );

    authToken = tokens.accessToken;

    return uploadFamilyImage(
      familyId,
      authToken,
      localUri,
    );
  }
}
