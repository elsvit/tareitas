import {
  IAuthTokens,
  ILoginPayload,
  IRegisterUserPayload,
} from '~/types/IAuth';

import { apiFetch, parseApiJson } from './client';

export async function registerUser(
  payload: IRegisterUserPayload,
) {
  const response = await apiFetch('/users', {
    method: 'POST',
    body: payload,
  });

  return parseApiJson(response);
}

export async function loginUser(
  payload: ILoginPayload,
): Promise<IAuthTokens> {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: payload,
  });

  return parseApiJson<IAuthTokens>(response);
}

export async function refreshAuthToken(
  refreshToken: string,
): Promise<Pick<IAuthTokens, 'accessToken' | 'refreshToken'>> {
  const response = await apiFetch('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });

  return parseApiJson(response);
}

export async function logoutUser(refreshToken: string) {
  const response = await apiFetch('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  });

  return parseApiJson(response);
}
