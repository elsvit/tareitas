import React, { useImperativeHandle, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';

import { ScreenHeader } from '~/components/blocks';
import { DeleteModal } from '~/components/modals';
import {
  Button,
  ButtonColors,
  Card,
  Space,
  Text,
  TextInput,
} from '~/components/ui';
import { SelectColor } from '~/components/ui/SelectColor';
// import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
// import { CHILDREN_AVATARS } from '~/assets/img/users/users';
import { CHILDREN_AVATARS } from '~/assets/img/users/users';
import { SelectImageWithCustom } from '~/components/ui/SelectImage';
import { t } from '~/services';
import { removeChild } from '~/store/children/slice';
import { ERole } from '~/store/settings/enums';
import {
  selectCurrentRole,
  selectIsChildPasswordObligatory,
  selectIsMultidevice,
} from '~/store/settings/selectors';
import { userColors } from '~/styles';
import { ChildFormProps, IChild } from '~/types';
import { EFormMode } from '~/types/ECommon';
import { capitalizeFirst } from '~/utils/string';

import { OTPInputIconButton } from '~/components/ui/OTPInputIconButton';
import { styles } from './styles';
import type { UserFormHandle } from './types';

// export const AVATAR_OPTIONS = [
//   { label: 'Girl 1', value: 'girl1' },
//   { label: 'Boy 1', value: 'boy1' },
//   { label: 'Boy 2', value: 'boy2' },
//   { label: 'Boy 3', value: 'boy3' },
//   { label: 'Boy 4', value: 'boy4' },
//   { label: 'Woman 1', value: 'woman1' },
//   { label: 'Woman 2', value: 'woman2' },
//   { label: 'Man 3', value: 'man3' },
//   { label: 'Man 4', value: 'man4' },
//   { label: 'Man 5', value: 'man5' },
//   { label: 'Man 6', value: 'man6' },
//   { label: 'Man 7', value: 'man7' },
//   { label: 'Man 8', value: 'man8' },
// ];

type Props = {
  title?: string;
  mode: EFormMode;
  child?: Partial<IChild>;
  onSave?: (child: ChildFormProps) => void;
  onValidityChange?: (isValid: boolean) => void;
  showScreenHeader?: boolean;
  embedded?: boolean;
  showSubmitButton?: boolean;
  fieldsBeforeName?: React.ReactNode;
  showUniqueUsername?: boolean;
  submitError?: string | null;
};

type FormValues = {
  name: string;
  username?: string;
  color: string;
  role: ERole;
  avatar: string;
  passwordPattern?: string;
};

const COLOR_OPTIONS = Object.entries(userColors).map(([key, value]) => ({
  label: capitalizeFirst(key),
  value,
}));

export const ChildForm = React.forwardRef<UserFormHandle, Props>(function ChildForm(
  {
    mode,
    child,
    title,
    onSave,
    onValidityChange,
    showScreenHeader = true,
    embedded = false,
    showSubmitButton = true,
    fieldsBeforeName,
    showUniqueUsername = false,
    submitError = null,
  },
  ref,
) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const currentRole = useSelector(selectCurrentRole);
  const isMultidevice = useSelector(selectIsMultidevice);
  const isChildPasswordObligatory = useSelector(selectIsChildPasswordObligatory);
  const isAdmin = currentRole === ERole.admin;
  const isEditMode = mode === EFormMode.Edit;
  const childUsername = child?.username?.trim() ?? '';
  const showUsernameField =
    showUniqueUsername ||
    (isEditMode && (isMultidevice || childUsername.length > 0));

  const headerTitle =
    title ??
    (mode === EFormMode.Add ? t('users.add_child') : t('users.edit_child'));

  const requiredMessage = t('common.required') || 'Required';

  const schema = useMemo(
    () =>
      z.object({
        ...(showUsernameField
          ? {
              username: z.string().trim().min(1, requiredMessage),
            }
          : {}),
        name: z.string().trim().min(1, requiredMessage),
        color: z.string().trim().min(1, requiredMessage),
        role: z.nativeEnum(ERole),
        avatar: z.string().trim().min(1, requiredMessage),
        passwordPattern: isChildPasswordObligatory
          ? z.string().trim().min(4, requiredMessage)
          : z.string().trim().optional(),
      }),
    [isChildPasswordObligatory, requiredMessage, showUsernameField],
  );

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
      username: child?.username ?? '',
      name: child?.name ?? '',
      color: child?.color ?? userColors.blue600,
      role: ERole.child,
      avatar: child?.avatar ?? '',
      passwordPattern: child?.passwordPattern ?? '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  React.useEffect(() => {
    reset({
      username: child?.username ?? '',
      name: child?.name ?? '',
      color: child?.color ?? userColors.blue600,
      role: ERole.child,
      avatar: child?.avatar ?? '',
      passwordPattern: child?.passwordPattern ?? '',
    });
  }, [
    child?.id,
    child?.username,
    child?.name,
    child?.color,
    child?.avatar,
    child?.passwordPattern,
    reset,
  ]);

  React.useEffect(() => {
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

    const newChild: ChildFormProps = {
      name: data.name,
      color: data.color,
      // role: ERole.child,
      avatar: data.avatar,
      passwordPattern: data.passwordPattern,
      ...(showUsernameField && typeof data.username === 'string'
        ? { username: data.username.trim() }
        : childUsername
          ? { username: childUsername }
          : {}),
    };

    onSave?.(newChild);
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
    if (!child?.id) {
      return;
    }

    dispatch(
      removeChild({
        id: child.id,
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
                        onChangeText={onChange}
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

            <Controller
              control={control}
              name="passwordPattern"
              render={({ field: { onChange } }) => (
                <>
                  <Text style={styles.label}>
                    {t('users.password')}
                    {isChildPasswordObligatory ? ' *' : ''}
                  </Text>
                  <View style={styles.row}>
                    <OTPInputIconButton
                      title={t('users.child_password')}
                      onChange={onChange}
                      maxLength={4}
                    />
                    {/* <GesturePasswordIconButton
                      title={t('users.child_password')}
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
              render={({ field: { value, onChange } }) => (
                <SelectImageWithCustom
                  kind="user"
                  options={CHILDREN_AVATARS}
                  value={value}
                  onChange={onChange}
                  label={t('users.avatar')}
                  errorMessage={errors.avatar?.message}
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
                  // errorMessage={errors.color?.message}
                />
              )}
            />

            <Space size={4} />

            {showSubmitButton && (
              <Button mode="contained" onPress={handleSubmit(onSubmit)}>
                {t('button.save') || 'Save'}
              </Button>
            )}

            {submitError ? (
              <>
                <Space size={2} />
                <Text style={styles.errorText}>{submitError}</Text>
              </>
            ) : null}

            {isEditMode && isAdmin && (
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
