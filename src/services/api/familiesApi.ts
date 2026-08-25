import { apiFetch, parseApiJson } from './client';
import type {
  IFamilyDetails,
  IFamilySummary,
  ISignupFamilyPayload,
  ISignupFamilyResponse,
} from '~/types/IAuth';

export async function fetchMyFamilies(token: string) {
  const response = await apiFetch('/families/me', {
    token,
  });

  return parseApiJson<IFamilySummary[]>(response);
}

export async function fetchFamilyDetails(
  token: string,
  familyId: string,
) {
  const response = await apiFetch(
    `/families/${familyId}`,
    { token },
  );

  return parseApiJson<IFamilyDetails>(response);
}

export async function signupFamily(
  payload: ISignupFamilyPayload,
) {
  const response = await apiFetch('/auth/signup', {
    method: 'POST',
    body: payload,
  });

  return parseApiJson<ISignupFamilyResponse>(response);
}

export async function createFamily(
  token: string,
  payload: {
    name: string;
    parentProfile?: {
      name: string;
      avatar?: string;
      color?: string;
    };
  },
) {
  const response = await apiFetch('/families', {
    method: 'POST',
    token,
    body: payload,
  });

  return parseApiJson<{ id: string; name: string }>(
    response,
  );
}
