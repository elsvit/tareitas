import { t } from '~/services';
import { ERole } from '~/store/settings/enums';
import { IOptions } from '~/types';

export {
  getFamilyRoleLabel,
  getFamilyRoleOptions,
  isKnownFamilyRole,
  parseFamilyRoleFormValues,
  resolveFamilyRoleValue,
} from '~/utils/users/familyRole';
export {
  sanitizeUsernameInput,
  usernameSchema,
  USERNAME_PATTERN,
} from '~/utils/users/username';

export const ROLE_OPTIONS: IOptions<ERole>[] = [
  {
    value: ERole.admin,
    label: t('users.admin') || 'Admin',
  },
  {
    value: ERole.parent,
    label: t('users.parent') || 'Parent',
  },
  {
    value: ERole.child,
    label: t('users.child') || 'Child',
  },
];
