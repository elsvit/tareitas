import { loginUser } from '~/services/api/authApi';
import { ERole } from '~/store/settings/enums';
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

export function userRequiresPasswordOnSwitch(
  user: SwitchableUser,
  isMultidevice: boolean,
  isChildPasswordObligatory: boolean,
): boolean {
  if (user.passwordPattern?.trim()) {
    return true;
  }

  if (isMultidevice && (user.email?.trim() || user.username?.trim())) {
    return true;
  }

  if (user.role === ERole.child && isChildPasswordObligatory) {
    return true;
  }

  return false;
}

export async function verifyUserSwitchPassword(
  user: SwitchableUser,
  input: string,
): Promise<boolean> {
  if (user.passwordPattern?.trim()) {
    if (isPinPassword(user.passwordPattern)) {
      return verifyPassword(user.passwordPattern, input);
    }

    return verifyPassword(user.passwordPattern, input);
  }

  const email = user.email?.trim();
  const username = user.username?.trim();

  if (email) {
    try {
      await loginUser({ email, pin: input });
      return true;
    } catch {
      return false;
    }
  }

  if (username) {
    try {
      await loginUser({ username, pin: input });
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
