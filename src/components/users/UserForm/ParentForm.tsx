import React, { useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';

import { ScreenHeader } from '~/components/blocks';
import { DeleteModal } from '~/components/modals';
import { Button, ButtonColors, Card, SelectOrEdit, Space, Text, TextInput } from '~/components/ui';
import { OTPInputIconButton } from '~/components/ui/OTPInputIconButton';
import { SelectColor } from '~/components/ui/SelectColor';
import { SelectImageWithCustom } from '~/components/ui/SelectImage/SelectImageWithCustom';
// import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
import { PARENT_AVATARS } from '~/assets/img/users/users';
import { t } from '~/services';
import { removeParent } from '~/store/parents/slice';
import { EFamilyRole, ERole } from '~/store/settings/enums';
import { selectCurrentRole, selectLang } from '~/store/settings/selectors';
import { userColors } from '~/styles';
import { IParent, ParentFormProps } from '~/types';
import { EFormMode } from '~/types/ECommon';
import { capitalizeFirst } from '~/utils/string';
import {
  getFamilyRoleOptions,
  parseFamilyRoleFormValues,
  resolveFamilyRoleValue,
} from '~/utils/users/familyRole';
import { sanitizeUsernameInput, usernameSchema } from '~/utils/users/username';

import { styles } from './styles';
import type { UserFormHandle } from './types';

type Props = {
  title?: string;
  mode: EFormMode;
  parent?: Partial<IParent>;
  onSave?: (parent: ParentFormProps) => void;
  onValidityChange?: (isValid: boolean) => void;
  showScreenHeader?: boolean;
  embedded?: boolean;
  showSubmitButton?: boolean;
  fieldsBeforeName?: React.ReactNode;
  showUniqueUsername?: boolean;
  submitError?: string | null;
  isSubmitting?: boolean;
};

type FormValues = {
  name: string;
  username?: string;
  color: string;
  familyRolePreset: EFamilyRole;
  customFamilyRole: string;
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
    fieldsBeforeName,
    showUniqueUsername = false,
    submitError = null,
    isSubmitting = false,
  },
  ref,
) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const currentRole = useSelector(selectCurrentRole);
  const lang = useSelector(selectLang);
  const familyRoleOptions = useMemo(
    () => getFamilyRoleOptions(),
    [lang],
  );
  const isAdmin = currentRole === ERole.admin;
  const isEditMode = mode === EFormMode.Edit;
  const isParentAdmin = parent?.role === ERole.admin;
  const parentEmail = parent?.email?.trim() ?? '';
  const showReadOnlyEmail =
    isEditMode && isParentAdmin && parentEmail.length > 0;
  const showUsernameField =
    !isParentAdmin &&
    (showUniqueUsername ||
      (isEditMode && Boolean(parent?.username?.trim())));

  const headerTitle =
    title ??
    (mode === EFormMode.Add ? t('users.add_parent') : t('users.edit_parent'));

  const requiredMessage = t('common.required') || 'Required';
  const usernameInvalidMessage =
    t('users.username_invalid') ||
    'Use only letters A–Z, numbers, underscore (_) and hyphen (-)';

  const schema = useMemo(
    () =>
      z
        .object({
          ...(showUsernameField
            ? {
                username: usernameSchema({
                  requiredMessage,
                  invalidMessage: usernameInvalidMessage,
                }),
              }
            : {}),
          name: z.string().trim().min(1, requiredMessage),
          color: z.string().trim().min(1, requiredMessage),
          familyRolePreset: z.nativeEnum(EFamilyRole),
          customFamilyRole: z.string().trim(),
          role: z.nativeEnum(ERole),
          avatar: z.string().trim().min(1, requiredMessage),
          passwordPattern: isEditMode
            ? z.string().trim().optional()
            : z.string().trim().min(1, requiredMessage),
        })
        .superRefine((data, ctx) => {
          if (
            data.familyRolePreset === EFamilyRole.other &&
            !data.customFamilyRole.trim()
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: requiredMessage,
              path: ['customFamilyRole'],
            });
          }
        }),
    [isEditMode, requiredMessage, showUsernameField, usernameInvalidMessage],
  );

  const initialFamilyRole = parseFamilyRoleFormValues(parent?.familyRole);

  const {
    control,
    handleSubmit,
    setError,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      username: parent?.username ?? '',
      name: parent?.name ?? '',
      color: parent?.color ?? userColors.pink,
      familyRolePreset: initialFamilyRole.preset,
      customFamilyRole: initialFamilyRole.customRole,
      role: parent?.role ?? ERole.parent,
      avatar: parent?.avatar ?? '',
      passwordPattern: parent?.passwordPattern ?? '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    const nextFamilyRole = parseFamilyRoleFormValues(parent?.familyRole);
    const currentAvatar = getValues('avatar');

    reset({
      username: parent?.username ?? '',
      name: parent?.name ?? '',
      color: parent?.color ?? userColors.pink,
      familyRolePreset: nextFamilyRole.preset,
      customFamilyRole: nextFamilyRole.customRole,
      role: parent?.role ?? ERole.parent,
      avatar: parent?.avatar?.trim()
        ? parent.avatar
        : currentAvatar ?? '',
      passwordPattern: parent?.passwordPattern ?? '',
    });
  }, [
    parent?.id,
    parent?.username,
    parent?.name,
    parent?.color,
    parent?.familyRole,
    parent?.role,
    parent?.avatar,
    parent?.passwordPattern,
    getValues,
    reset,
  ]);

  useEffect(() => {
    const sub = watch(() => {
      const values = getValues();
      const valid = schema.safeParse(values).success;
      onValidityChange?.(valid);
    });
    const initialValid = schema.safeParse(getValues()).success;
    onValidityChange?.(initialValid);
    return () => sub.unsubscribe();
  }, [watch, getValues, onValidityChange, schema]);

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
      familyRole: resolveFamilyRoleValue(
        data.familyRolePreset,
        data.customFamilyRole,
      ),
      role: data.role,
      avatar: data.avatar,
      passwordPattern: data.passwordPattern?.trim()
        ? data.passwordPattern.trim()
        : parent?.passwordPattern,
      ...(parentEmail ? { email: parentEmail } : {}),
      ...(showUsernameField && typeof data.username === 'string'
        ? { username: data.username.trim() }
        : parent?.username?.trim()
          ? { username: parent.username.trim() }
          : {}),
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

    dispatch(
      removeParent({
        id: parent.id,
        onSuccess: () => {
          if (router.canGoBack()) {
            router.back();
          }
        },
      }),
    );
  };

  const formBody = (
    <Card>
      {title && !showScreenHeader && !embedded && (
        <View style={styles.titleContainer}>
          <Text variant="titleMedium" style={styles.title}>{title}</Text>
        </View>
      )}
      <Card.Content>
      <Space size={3} />
            {fieldsBeforeName ? (
              <>
                {fieldsBeforeName}
                <Space size={3} />
              </>
            ) : null}
            {showReadOnlyEmail ? (
              <>
                <TextInput
                  label={t('onboarding.sign_up.admin_email')}
                  value={parentEmail}
                  editable={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  mode="outlined"
                />
                <Space size={3} />
              </>
            ) : null}
            {showUsernameField ? (
              <>
                <Controller
                  control={control}
                  name="username"
                  render={({ field: { value, onChange } }) => (
                    <>
                      <TextInput
                        label={t('users.unique_username')}
                        value={value ?? ''}
                        onChangeText={text => onChange(sanitizeUsernameInput(text))}
                        autoCapitalize="none"
                        mode="outlined"
                      />
                      {!!errors.username && (
                        <Text style={styles.errorText}>
                          {errors.username.message}
                        </Text>
                      )}
                    </>
                  )}
                />
                <Space size={3} />
              </>
            ) : null}
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

            <Space size={3} />

            {/* Family Role */}
            <Controller
              control={control}
              name="familyRolePreset"
              render={({ field: { value: preset, onChange: onPresetChange } }) => (
                <Controller
                  control={control}
                  name="customFamilyRole"
                  render={({
                    field: { value: customRole, onChange: onCustomRoleChange },
                  }) => {
                    const familyRoleText =
                      preset !== EFamilyRole.other
                        ? familyRoleOptions.find(
                            option => option.value === preset,
                          )?.label ?? ''
                        : customRole;

                    return (
                      <SelectOrEdit
                        label={t('users.family_role') || 'Family role'}
                        options={familyRoleOptions}
                        text={familyRoleText}
                        onTextChange={text => {
                          onCustomRoleChange(text);
                          if (preset !== EFamilyRole.other) {
                            onPresetChange(EFamilyRole.other);
                          }
                        }}
                        selectedValue={preset}
                        onSelect={value => {
                          onPresetChange(value);
                          if (value === EFamilyRole.other) {
                            onCustomRoleChange(
                              preset === EFamilyRole.other ? customRole : '',
                            );
                          } else {
                            onCustomRoleChange('');
                          }
                        }}
                        error={
                          errors.customFamilyRole?.message ??
                          errors.familyRolePreset?.message
                        }
                      />
                    );
                  }}
                />
              )}
            />

            <Space size={3} />

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

            <Space size={3} />

            <Controller
              control={control}
              name="avatar"
              render={({ field: { value, onChange, onBlur } }) => (
                <SelectImageWithCustom
                  kind="user"
                  options={PARENT_AVATARS}
                  value={value}
                  onChange={nextValue => {
                    onChange(nextValue);
                    onBlur();
                  }}
                  label={t('users.avatar')}
                  errorMessage={errors.avatar?.message}
                  loadedPhotosAutoRows
                  showLoadedPhotosLabel={false}
                  loadPhotoButtonBelowLoadedPhotos
                />
              )}
            />

            <Space size={3} />

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

            <Space size={4} />

            {showSubmitButton && (
              <Button
                mode="contained"
                loading={isSubmitting}
                disabled={isSubmitting}
                onPress={handleSubmit(onSubmit)}
              >
                {t('button.save') || 'Save'}
              </Button>
            )}

            {submitError ? (
              <>
                <Space size={2} />
                <Text style={styles.errorText}>{submitError}</Text>
              </>
            ) : null}

            {isEditMode && isAdmin && !showReadOnlyEmail && (
              <>
                <Space size={3} />
                <Button
                  mode="contained"
                  bgColor={ButtonColors.Red}
                  onPress={handleDelete}
                >
                  {t('button.delete')}
                </Button>
              </>
            )}

            <Space size={4} />
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
