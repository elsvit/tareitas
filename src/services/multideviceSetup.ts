import {
  fetchFamilyDetails,
  fetchMyFamilies,
  loginUser,
  signupFamily,
} from '~/services/api';
import { ApiError } from '~/services/api/client';
import type {
  IAuthUser,
  IFamilyDetails,
  ILoginPayload,
  ISignupFamilyPayload,
} from '~/types/IAuth';

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  familyId: string;
  user: IAuthUser;
  family: IFamilyDetails;
};

async function resolveFamilyDetails(
  accessToken: string,
  familyId: string | null,
): Promise<{ familyId: string; family: IFamilyDetails }> {
  if (familyId) {
    const family = await fetchFamilyDetails(
      accessToken,
      familyId,
    );

    return { familyId, family };
  }

  const families = await fetchMyFamilies(accessToken);

  if (families.length === 0) {
    throw new ApiError('NO_FAMILY', 404);
  }

  const resolvedFamilyId = families[0].family.id;
  const family = await fetchFamilyDetails(
    accessToken,
    resolvedFamilyId,
  );

  return {
    familyId: resolvedFamilyId,
    family,
  };
}

export async function loginAndLoadFamily(
  payload: ILoginPayload,
): Promise<LoginResult> {
  const auth = await loginUser(payload);
  const { familyId, family } =
    await resolveFamilyDetails(
      auth.accessToken,
      auth.user.familyId,
    );

  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    familyId,
    user: {
      ...auth.user,
      familyId: auth.user.familyId ?? familyId,
    },
    family,
  };
}

export async function signupAndLoadFamily(
  payload: ISignupFamilyPayload,
): Promise<LoginResult> {
  const result = await signupFamily(payload);

  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    familyId: result.family.id,
    user: {
      ...result.user,
      familyId: result.user.familyId ?? result.family.id,
    },
    family: result.family,
  };
}
