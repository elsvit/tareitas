import { t, type TranslationKey } from '~/services';
import { EFamilyRole } from '~/store/settings/enums';
import { IOptions } from '~/types';

const FAMILY_ROLE_ORDER: EFamilyRole[] = [
  EFamilyRole.mother,
  EFamilyRole.father,
  EFamilyRole.grandmother,
  EFamilyRole.grandfather,
  EFamilyRole.sister,
  EFamilyRole.brother,
  EFamilyRole.nanny,
  EFamilyRole.aunt,
  EFamilyRole.uncle,
  EFamilyRole.reviewer,
  EFamilyRole.reviewee,
  EFamilyRole.other,
];

const FAMILY_ROLE_LABEL_KEYS: Record<
  Exclude<EFamilyRole, EFamilyRole.other>,
  TranslationKey
> = {
  [EFamilyRole.aunt]: 'users.familyRole.aunt',
  [EFamilyRole.brother]: 'users.familyRole.brother',
  [EFamilyRole.father]: 'users.familyRole.father',
  [EFamilyRole.grandfather]: 'users.familyRole.grandfather',
  [EFamilyRole.grandmother]: 'users.familyRole.grandmother',
  [EFamilyRole.mother]: 'users.familyRole.mother',
  [EFamilyRole.nanny]: 'users.familyRole.nanny',
  [EFamilyRole.reviewee]: 'users.familyRole.reviewee',
  [EFamilyRole.reviewer]: 'users.familyRole.reviewer',
  [EFamilyRole.sister]: 'users.familyRole.sister',
  [EFamilyRole.uncle]: 'users.familyRole.uncle',
};

export const getFamilyRoleOptions = (): IOptions<EFamilyRole>[] =>
  FAMILY_ROLE_ORDER.map(value => ({
    value,
    label:
      value === EFamilyRole.other
        ? t('common.other')
        : t(FAMILY_ROLE_LABEL_KEYS[value]),
  }));

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

  if (familyRole === EFamilyRole.other) {
    return t('common.other');
  }

  if (
    isKnownFamilyRole(familyRole) &&
    familyRole !== EFamilyRole.other
  ) {
    return t(FAMILY_ROLE_LABEL_KEYS[familyRole]);
  }

  return familyRole.trim();
};
