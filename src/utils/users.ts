import { t } from '~/services';
import { ERole } from '~/store/settings/enums';
import { IOptions } from '~/types';

export {
  FAMILY_ROLE_OPTIONS,
  getFamilyRoleLabel,
  isKnownFamilyRole,
  parseFamilyRoleFormValues,
  resolveFamilyRoleValue,
} from '~/utils/users/familyRole';

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
