import { API_CONFIG } from '~/services/api/config';
import { getApiLang } from '~/services/api/lang';
import { ApiError } from '~/services/api/client';
import { isBuiltinAvatarId } from '~/services/imageSync';
import { t } from '~/services';
import type { ISignupFamilyPayload } from '~/types/IAuth';

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
