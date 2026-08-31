import { t } from '~/services';
import { EFamilyRole } from '~/store/settings/enums';
import { IOptions } from '~/types';

export const FAMILY_ROLE_OPTIONS: IOptions<EFamilyRole>[] = [
  {
    value: EFamilyRole.mother,
    label: t('users.familyRole.mother'),
  },
  {
    value: EFamilyRole.father,
    label: t('users.familyRole.father'),
  },
  {
    value: EFamilyRole.grandmother,
    label: t('users.familyRole.grandmother'),
  },
  {
    value: EFamilyRole.grandfather,
    label: t('users.familyRole.grandfather'),
  },
  {
    value: EFamilyRole.sister,
    label: t('users.familyRole.sister'),
  },
  {
    value: EFamilyRole.brother,
    label: t('users.familyRole.brother'),
  },
  {
    value: EFamilyRole.nanny,
    label: t('users.familyRole.nanny'),
  },
  {
    value: EFamilyRole.aunt,
    label: t('users.familyRole.aunt'),
  },
  {
    value: EFamilyRole.uncle,
    label: t('users.familyRole.uncle'),
  },
  {
    value: EFamilyRole.reviewer,
    label: t('users.familyRole.reviewer'),
  },
  {
    value: EFamilyRole.reviewee,
    label: t('users.familyRole.reviewee'),
  },
  {
    value: EFamilyRole.other,
    label: t('common.other'),
  },
];

export const isKnownFamilyRole = (
  value?: string,
): value is EFamilyRole =>
  !!value &&
  (Object.values(EFamilyRole) as string[]).includes(value);

export const parseFamilyRoleFormValues = (
  familyRole?: string,
): { preset: EFamilyRole; customRole: string } => {
  if (!familyRole?.trim()) {
    return {
      preset: EFamilyRole.mother,
      customRole: '',
    };
  }

  if (isKnownFamilyRole(familyRole)) {
    return {
      preset: familyRole,
      customRole: '',
    };
  }

  return {
    preset: EFamilyRole.other,
    customRole: familyRole.trim(),
  };
};

export const resolveFamilyRoleValue = (
  preset: EFamilyRole,
  customRole: string,
): string => {
  if (preset === EFamilyRole.other) {
    return customRole.trim();
  }

  return preset;
};

export const getFamilyRoleLabel = (familyRole?: string): string => {
  if (!familyRole?.trim()) {
    return '';
  }

  if (
    isKnownFamilyRole(familyRole) &&
    familyRole !== EFamilyRole.other
  ) {
    const option = FAMILY_ROLE_OPTIONS.find(
      item => item.value === familyRole,
    );

    return option?.label ?? familyRole;
  }

  if (familyRole === EFamilyRole.other) {
    return t('common.other');
  }

  return familyRole.trim();
};
