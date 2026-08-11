import React, { FC, useEffect } from 'react';
import { ScrollView, View } from 'react-native';

import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { Button, Card, Select, Space, Text, TextInput } from '~/components/ui';
import { GesturePasswordIconButton } from '~/components/ui/GesturePasswordIconButton';
import { OTPInputIconButton } from '~/components/ui/OTPInputIconButton';
import { SelectColor } from '~/components/ui/SelectColor';
import { SelectImage } from '~/components/ui/SelectImage/SelectImage';
// import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
import { PARENT_AVATARS } from '~/assets/img/users/users';
import { t } from '~/services';
import { EFamilyRole, ERole } from '~/store/settings/enums';
import { userColors } from '~/styles';
import { IOptions, IParent, ParentFormProps } from '~/types';
import { EFormMode } from '~/types/ECommon';
import { capitalizeFirst } from '~/utils/string';

import { styles } from './styles';

// export const AVATAR_OPTIONS = [
//   { label: 'Man 1', value: 'man1' },
//   { label: 'Woman 1', value: 'woman1' },
//   { label: 'Seniora 1', value: 'seniora1' },
//   { label: 'Man 2', value: 'man2' },
//   { label: 'Woman 2', value: 'woman2' },
//   { label: 'Man 3', value: 'man3' },
//   { label: 'Man 4', value: 'man4' },
//   { label: 'Man 5', value: 'man5' },
//   { label: 'Man 6', value: 'man6' },
//   { label: 'Man 7', value: 'man7' },
//   { label: 'Man 8', value: 'man8' },
//   { label: 'Nanny 1', value: 'nanny1' },
//   { label: 'Nanny 2', value: 'nanny2' },
//   { label: 'Nanny 3', value: 'nanny3' },
//   { label: 'Nanny 4', value: 'nanny4' },
//   { label: 'Senior 1', value: 'senior1' },
//   { label: 'Senior 2', value: 'senior2' },
//   { label: 'Senior 3', value: 'senior3' },
//   { label: 'Senior 4', value: 'senior4' },
// ];

type Props = {
  title?: string;
  mode: EFormMode;
  parent?: Partial<IParent>;
  onSave?: (parent: ParentFormProps) => void;
  onValidityChange?: (isValid: boolean) => void;
};

type FormValues = {
  name: string;
  color: string;
  familyRole: EFamilyRole;
  role: ERole;
  avatar?: string;
  passwordPattern?: string;
};

const COLOR_OPTIONS = Object.entries(userColors).map(([key, value]) => ({
  label: capitalizeFirst(key),
  value,
}));

export const ParentForm: FC<Props> = ({
  mode,
  parent,
  title,
  onSave,
  onValidityChange,
}) => {
  // useI18nHeaderTitle(
  //   mode === EFormMode.Add ? 'users.add_parent' : 'users.edit_parent',
  // );

  const requiredMessage = t('common.required') || 'Required';

  const schema = z.object({
    name: z.string().trim().min(1, requiredMessage),
    color: z.string().trim().min(1, requiredMessage),
    familyRole: z.nativeEnum(EFamilyRole),
    role: z.nativeEnum(ERole),
    avatar: z.string().trim().min(1, requiredMessage),
    passwordPattern: z.string().trim().min(1, requiredMessage),
    // passwordPattern: z.string().trim().min(1, requiredMessage).optional(),
  });

  const FAMILY_ROLE_OPTIONS: IOptions<EFamilyRole>[] = [
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

  const {
    control,
    handleSubmit,
    setError,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: parent?.name ?? '',
      color: parent?.color ?? userColors.pink,
      familyRole: parent?.familyRole ?? EFamilyRole.mother,
      role: parent?.role ?? ERole.parent,
      avatar: parent?.avatar ?? '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    const sub = watch(() => {
      const values = getValues();
      const valid = schema.safeParse(values).success;
      onValidityChange?.(valid);
    });
    const initialValid = schema.safeParse(getValues()).success;
    onValidityChange?.(initialValid);
    return () => sub.unsubscribe();
  }, [watch, getValues, onValidityChange]);

  const onSubmit = (raw: FormValues) => {
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FormValues | undefined;

        if (field) {
          setError(field, {
            type: 'manual',
            message: issue.message,
          });
        }
      }

      return;
    }

    const data = parsed.data;

    const newParent: ParentFormProps = {
      name: data.name,
      color: data.color,
      familyRole: data.familyRole,
      role: data.role,
      avatar: data.avatar,
      passwordPattern: data.passwordPattern,
    };
    console.log('TEST_219 onSubmit', newParent);

    onSave?.(newParent);
  };

  return (
    <SafeAreaBackground>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          {title && (
            <View style={styles.titleContainer}>
              <Text variant="titleMedium">{title}</Text>
            </View>
          )}
          <Card.Content>
            {/* Name */}
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange } }) => (
                <>
                  <TextInput
                    label={t('users.name') || 'Name'}
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                  />
                  {!!errors.name && (
                    <Text style={styles.errorText}>{errors.name.message}</Text>
                  )}
                </>
              )}
            />

            <Space size={12} />

            {/* Family Role + Role */}
            <Controller
              control={control}
              name="familyRole"
              render={({ field: { value, onChange } }) => (
                <>
                  <Select
                    label={t('users.family_role') || 'Family role'}
                    value={value}
                    onChange={v => onChange(v as EFamilyRole)}
                    options={FAMILY_ROLE_OPTIONS}
                  />
                  {!!errors.familyRole && (
                    <Text style={styles.errorText}>
                      {errors.familyRole.message}
                    </Text>
                  )}
                </>
              )}
            />

            <Space size={12} />

            <Controller
              control={control}
              name="passwordPattern"
              render={({ field: { onChange } }) => (
                <>
                  <Text style={styles.label}>{t('users.password')}</Text>
                  <View style={styles.row}>
                    <OTPInputIconButton
                      title={t('users.parent_password')}
                      onChange={onChange}
                      maxLength={4}
                    />
                    <GesturePasswordIconButton
                      title={t('users.parent_password')}
                      onChange={onChange}
                      minLength={4}
                      style={styles.otpInput}
                    />
                  </View>
                  {!!errors.passwordPattern && (
                    <Text style={styles.errorText}>
                      {errors.passwordPattern?.message}
                    </Text>
                  )}
                </>
              )}
            />

            <Space size={12} />

            <Controller
              control={control}
              name="avatar"
              render={({ field: { value, onChange } }) => (
                <>
                  <SelectImage
                    options={PARENT_AVATARS}
                    value={value}
                    onChange={onChange}
                    errorMessage={
                      errors.avatar &&
                      (errors.avatar.message || requiredMessage)
                    }
                  />
                </>
              )}
            />

            <Space size={12} />

            {/* Color */}
            <Controller
              control={control}
              name="color"
              render={({ field: { value, onChange } }) => (
                <SelectColor
                  options={COLOR_OPTIONS}
                  value={value}
                  onChange={onChange}
                  errorMessage={errors.color?.message}
                />
              )}
            />

            <Space size={20} />

            {/* Save */}
            <Button mode="contained" onPress={handleSubmit(onSubmit)}>
              {t('button.save') || 'Save'}
            </Button>

            <Space size={20} />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaBackground>
  );
};
