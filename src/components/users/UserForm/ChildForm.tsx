import React from 'react';
import { ScrollView, View } from 'react-native';

import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import {
  Button,
  Card,
  Space,
  Text,
  TextInput,
} from '~/components/ui';
import { SelectColor } from '~/components/ui/SelectColor';
// import { useI18nHeaderTitle } from '~/hooks/useI18nHeaderTitle';
// import { CHILDREN_AVATARS } from '~/assets/img/users/users';
import { CHILDREN_AVATARS } from '~/assets/img/users/users';
import { SelectImage } from '~/components/ui/SelectImage';
import { t } from '~/services';
import { ERole } from '~/store/settings/enums';
import { userColors } from '~/styles';
import { ChildFormProps } from '~/types';
import { EFormMode } from '~/types/ECommon';
import { capitalizeFirst } from '~/utils/string';

import { GesturePasswordIconButton } from '~/components/ui/GesturePasswordIconButton';
import { OTPInputIconButton } from '~/components/ui/OTPInputIconButton';
import { styles } from './styles';

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
  child?: ChildFormProps;
  onSave?: (child: ChildFormProps) => void;
  onValidityChange?: (isValid: boolean) => void;
};

type FormValues = {
  name: string;
  color: string;
  role: ERole;
  avatar: string;
  passwordPattern?: string;
};

const COLOR_OPTIONS = Object.entries(userColors).map(([key, value]) => ({
  label: capitalizeFirst(key),
  value,
}));

export const ChildForm: React.FC<Props> = ({
  mode,
  child,
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
    role: z.nativeEnum(ERole),
    avatar: z.string().trim().min(1, requiredMessage),
    passwordPattern: z.string().trim().optional(),
  });

  const {
    control,
    handleSubmit,
    setError,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
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

    const newChild: ChildFormProps = {
      name: data.name,
      color: data.color,
      // role: ERole.child,
      avatar: data.avatar,
      passwordPattern: data.passwordPattern,
    };

    onSave?.(newChild);
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

            <Controller
              control={control}
              name="passwordPattern"
              render={({ field: { onChange } }) => (
                <>
                  <Text style={styles.label}>{t('users.password')}</Text>
                  <View style={styles.row}>
                    <OTPInputIconButton
                      title={t('users.child_password')}
                      onChange={onChange}
                      maxLength={4}
                    />
                    <GesturePasswordIconButton
                      title={t('users.child_password')}
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
                    options={CHILDREN_AVATARS}
                    value={value}
                    onChange={onChange}
                    errorMessage={errors.avatar?.message}
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
                  // errorMessage={errors.color?.message}
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
