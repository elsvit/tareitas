import { v4 as uuidv4 } from 'uuid';

import { API_CONFIG } from '~/services/api/config';
import { getApiLang } from '~/services/api/lang';
import { ApiError } from '~/services/api/client';
import {
  updateChildMember,
  updateMyMemberProfile,
} from '~/services/api/membersApi';
import {
  isBuiltinAvatarId,
  resolveImageRefForServer,
} from '~/services/imageSync';
import { t } from '~/services';
import type { ISignupFamilyPayload } from '~/types/IAuth';
import type { ChildFormProps } from '~/types/IChild';
import type { ParentFormProps } from '~/types/IParent';

export function sanitizeSignupAvatar(
  avatar: string | undefined,
): string | undefined {
  if (!avatar || !isBuiltinAvatarId(avatar)) {
    return undefined;
  }

  return avatar;
}

export type SignupProfileInput = {
  email?: string;
  pin: string;
  name: string;
  color?: string;
  avatar?: string;
  username?: string;
};

export function createPlaceholderChildSignupData(): SignupProfileInput & {
  username: string;
} {
  const suffix = uuidv4().replace(/-/g, '').slice(0, 10);

  return {
    username: `ob${suffix}`,
    pin: String(Math.floor(1000 + Math.random() * 9000)),
    name: 'Child',
  };
}

export function buildSignupFamilyPayload(input: {
  familyName: string;
  admin: SignupProfileInput & { email: string };
  child: SignupProfileInput & { username: string };
}): ISignupFamilyPayload {
  return {
    familyName: input.familyName,
    lang: getApiLang(),
    admin: {
      email: input.admin.email,
      pin: input.admin.pin,
      name: input.admin.name,
      color: input.admin.color,
      avatar: sanitizeSignupAvatar(input.admin.avatar),
    },
    child: {
      username: input.child.username,
      pin: input.child.pin,
      name: input.child.name,
      color: input.child.color,
      avatar: sanitizeSignupAvatar(input.child.avatar),
    },
  };
}

function isDuplicateSignupError(error: ApiError): boolean {
  const message = error.message.toLowerCase();

  if (
    message.includes('already in use') ||
    message.includes('ya está en uso') ||
    message.includes('ya esta en uso')
  ) {
    return true;
  }

  if (
    typeof error.body === 'object' &&
    error.body !== null &&
    'errorCode' in error.body &&
    typeof error.body.errorCode === 'string'
  ) {
    const code = error.body.errorCode.toUpperCase();

    return (
      code.includes('ALREADY') ||
      code.includes('DUPLICATE') ||
      code.includes('CONFLICT') ||
      code === 'USER_ALREADY_EXISTS'
    );
  }

  return error.status === 409;
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('network request failed') ||
    message.includes('failed to fetch') ||
    message.includes('network error')
  );
}

export function formatOnboardingSignupError(error: unknown): string {
  if (error instanceof ApiError) {
    if (isDuplicateSignupError(error)) {
      return t('onboarding.sign_up.error_already_exists');
    }

    return error.message || t('onboarding.sign_up.error_generic');
  }

  if (isNetworkError(error)) {
    return t('onboarding.sign_up.error_network', {
      apiUrl: API_CONFIG.baseUrl,
    });
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return t('onboarding.sign_up.error_generic');
}

export async function syncOnboardingAdminProfile(
  accessToken: string,
  familyId: string,
  admin: ParentFormProps,
  localUserUrls: Record<string, string>,
) {
  const avatar = await resolveImageRefForServer(
    admin.avatar,
    localUserUrls,
    familyId,
    accessToken,
    'user',
  );

  return updateMyMemberProfile(accessToken, familyId, {
    name: admin.name.trim(),
    color: admin.color,
    avatar,
    familyRole: admin.familyRole,
  });
}

export async function syncOnboardingChildProfile(
  accessToken: string,
  familyId: string,
  childUserId: string,
  child: ChildFormProps,
  credentials: { username: string; pin: string },
  localUserUrls: Record<string, string>,
) {
  const avatar = await resolveImageRefForServer(
    child.avatar,
    localUserUrls,
    familyId,
    accessToken,
    'user',
  );

  return updateChildMember(accessToken, familyId, childUserId, {
    name: child.name.trim(),
    username: credentials.username,
    pin: credentials.pin,
    color: child.color,
    avatar,
    birthday: child.birthday,
    reward: child.reward,
  });
}
