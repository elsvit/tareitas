import { loginUser } from '~/services/api/authApi';
import { ERole } from '~/store/settings/enums';
import type { IAuthTokens } from '~/types/IAuth';
import {
  isPinPassword,
  verifyPassword,
} from '~/utils/users/passwordPattern';

export type SwitchableUser = {
  id: string;
  role: ERole;
  name: string;
  email?: string;
  username?: string;
  passwordPattern?: string;
};

export type SwitchPasswordResult =
  | { ok: true; kind: 'local' }
  | { ok: true; kind: 'cloud'; auth: IAuthTokens }
  | { ok: false };

export function userRequiresPasswordOnSwitch(
  user: SwitchableUser,
  isMultidevice: boolean,
  isChildPasswordObligatory: boolean,
  options: {
    hasAuthSession?: boolean;
    requireLogin?: boolean;
  } = {},
): boolean {
  const hasAuthSession = options.hasAuthSession ?? true;
  const requireLogin = options.requireLogin ?? false;

  if (user.passwordPattern?.trim()) {
    return true;
  }

  if (isMultidevice && (user.email?.trim() || user.username?.trim())) {
    return true;
  }

  if (
    isMultidevice &&
    (requireLogin || !hasAuthSession) &&
    user.role !== ERole.child
  ) {
    return true;
  }

  if (user.role === ERole.child && isChildPasswordObligatory) {
    return true;
  }

  return false;
}

export function userNeedsCloudReauthOnSwitch(
  user: SwitchableUser,
  isMultidevice: boolean,
  options: {
    hasAuthSession?: boolean;
    requireLogin?: boolean;
  } = {},
): boolean {
  if (!isMultidevice) {
    return false;
  }

  const hasAuthSession = options.hasAuthSession ?? true;
  const requireLogin = options.requireLogin ?? false;

  if (!requireLogin && hasAuthSession) {
    return false;
  }

  return userCanReauthenticateOnSwitch(user);
}

export function userCanReauthenticateOnSwitch(
  user: SwitchableUser,
): boolean {
  return Boolean(
    user.passwordPattern?.trim() ||
      user.email?.trim() ||
      user.username?.trim(),
  );
}

async function verifyCloudSwitchPassword(
  user: SwitchableUser,
  input: string,
): Promise<SwitchPasswordResult> {
  const email = user.email?.trim();
  const username = user.username?.trim();

  if (email) {
    try {
      const auth = await loginUser({ email, pin: input });

      return { ok: true, kind: 'cloud', auth };
    } catch {
      return { ok: false };
    }
  }

  if (username) {
    try {
      const auth = await loginUser({ username, pin: input });

      return { ok: true, kind: 'cloud', auth };
    } catch {
      return { ok: false };
    }
  }

  return { ok: false };
}

export async function verifyUserSwitchPassword(
  user: SwitchableUser,
  input: string,
  options: {
    preferCloudAuth?: boolean;
  } = {},
): Promise<SwitchPasswordResult> {
  if (options.preferCloudAuth) {
    const cloudResult = await verifyCloudSwitchPassword(user, input);

    if (cloudResult.ok) {
      return cloudResult;
    }
  }

  if (user.passwordPattern?.trim()) {
    const isValid = verifyPassword(user.passwordPattern, input);

    return isValid ? { ok: true, kind: 'local' } : { ok: false };
  }

  return verifyCloudSwitchPassword(user, input);
}
