import React, { useEffect, useImperativeHandle, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';

import { ScreenHeader } from '~/components/blocks';
import { DeleteModal } from '~/components/modals';
import { Button, ButtonColors, Card, Select, Space, Text, TextInput } from '~/components/ui';
import { OTPInputIconButton } from '~/components/ui/OTPInputIconButton';
import { SelectColor } from '~/components/ui/SelectColor';
import { SelectImageWithCustom } from '~/components/ui/SelectImage/SelectImageWithCustom';
// import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
import { PARENT_AVATARS } from '~/assets/img/users/users';
import { t } from '~/services';
import { removeParent } from '~/store/parents/slice';
import { EFamilyRole, ERole } from '~/store/settings/enums';
import { selectCurrentRole } from '~/store/settings/selectors';
import { userColors } from '~/styles';
import { IOptions, IParent, ParentFormProps } from '~/types';
import { EFormMode } from '~/types/ECommon';
import { capitalizeFirst } from '~/utils/string';

import { styles } from './styles';
import type { UserFormHandle } from './types';

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
  showScreenHeader?: boolean;
  embedded?: boolean;
  showSubmitButton?: boolean;
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

export const ParentForm = React.forwardRef<UserFormHandle, Props>(function ParentForm(
  {
    mode,
    parent,
    title,
    onSave,
    onValidityChange,
    showScreenHeader = true,
    embedded = false,
    showSubmitButton = true,
  },
  ref,
) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const currentRole = useSelector(selectCurrentRole);
  const isAdmin = currentRole === ERole.admin;
  const isEditMode = mode === EFormMode.Edit;

  const headerTitle =
    title ??
    (mode === EFormMode.Add ? t('users.add_parent') : t('users.edit_parent'));

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
      passwordPattern: parent?.passwordPattern ?? '',
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

    onSave?.(newParent);
  };

  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit(onSubmit)();
    },
  }));

  const handleDelete = () => {
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!parent?.id) {
      return;
    }

    dispatch(removeParent({ id: parent.id }));

    if (router.canGoBack()) {
      router.back();
    }
  };

  const formBody = (
    <Card>
      {title && !showScreenHeader && !embedded && (
        <View style={styles.titleContainer}>
          <Text variant="titleMedium" style={styles.title}>{title}</Text>
        </View>
      )}
      <Card.Content>
      <Space size={8} />
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
                    {/* <GesturePasswordIconButton
                      title={t('users.parent_password')}
                      onChange={onChange}
                      minLength={4}
                      style={styles.otpInput}
                    /> */}
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
                <SelectImageWithCustom
                  kind="user"
                  options={PARENT_AVATARS}
                  value={value}
                  onChange={onChange}
                  label={t('users.avatar')}
                  errorMessage={errors.avatar?.message}
                />
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

            {showSubmitButton && (
              <Button mode="contained" onPress={handleSubmit(onSubmit)}>
                {t('button.save') || 'Save'}
              </Button>
            )}

            {isEditMode && isAdmin && (
              <>
                <Space size={12} />
                <Button
                  mode="contained"
                  bgColor={ButtonColors.Red}
                  onPress={handleDelete}
                >
                  {t('button.delete')}
                </Button>
              </>
            )}

            <Space size={20} />
          </Card.Content>
        </Card>
  );

  return (
    <>
      {showScreenHeader && (
        <ScreenHeader
          hasBackButton
          title={headerTitle}
          containerStyle={styles.screenHeader}
        />
      )}
      {embedded ? (
        formBody
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {formBody}
        </ScrollView>
      )}

      <DeleteModal
        isVisible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title={t('users.delete')}
        message={t('users.delete_confirm')}
      />
    </>
  );
});
