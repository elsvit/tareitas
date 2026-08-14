import React, { FC, useEffect, useState } from 'react';
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
import { SelectImageWithCustom } from '~/components/ui/SelectImage/SelectImageWithCustom';
import { getRewardImageOptions } from '~/constants/rewards';
import { t } from '~/services';
import { removeRewardBase } from '~/store/rewardBase/slice';
import { ERole } from '~/store/settings/enums';
import { selectCurrentRole } from '~/store/settings/selectors';
import { EFormMode } from '~/types/ECommon';
import { IRewardBase, RewardBaseFormProps } from '~/types/IReward';

import { styles } from './styles';

type Props = {
  title?: string;
  mode: EFormMode;
  reward?: Partial<IRewardBase>;
  onSave?: (values: RewardBaseFormProps) => void;
  onValidityChange?: (valid: boolean) => void;
  showScreenHeader?: boolean;
};

type FormValues = RewardBaseFormProps;

const requiredMessage = t('common.required') || 'Required';

const schema = z.object({
  title: z.string().trim().min(1, requiredMessage),
  reward: z.coerce
    .number()
    .min(0, t('rewards.reward_positive') || 'Reward must be ≥ 0'),
  picture: z.string().trim().min(1, requiredMessage),
});

export const BaseRewardForm: FC<Props> = ({
  title,
  reward,
  mode,
  onSave,
  onValidityChange,
  showScreenHeader = true,
}) => {
  const headerTitle =
    title ??
    (mode === EFormMode.Add ? t('rewards.add_reward') : t('rewards.edit_reward'));

  const dispatch = useDispatch();
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: reward?.title ?? '',
      reward: reward?.reward ?? 0,
      picture: reward?.picture ?? '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const rewardImageOptions = getRewardImageOptions();
  const isEditMode = mode === EFormMode.Edit;

  const currentRole = useSelector(selectCurrentRole);
  const isAdmin = currentRole === ERole.admin;

  useEffect(() => {
    const sub = watch(() => {
      const valid = schema.safeParse(getValues()).success;
      onValidityChange?.(valid);
    });

    onValidityChange?.(schema.safeParse(getValues()).success);

    return () => sub.unsubscribe();
  }, [watch, getValues, onValidityChange]);

  const onSubmit = (values: FormValues) => {
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof FormValues;

        setError(field, {
          type: 'manual',
          message: issue.message,
        });
      });

      return;
    }

    onSave?.(parsed.data);
  };

  const handleDelete = () => {
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!reward?.id) {
      return;
    }

    dispatch(removeRewardBase({ id: reward.id }));

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <>
      {showScreenHeader && (
        <ScreenHeader
          hasBackButton
          title={headerTitle}
          containerStyle={styles.screenHeader}
        />
      )}
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          {!!title && !showScreenHeader && (
            <View style={styles.titleContainer}>
              <Text variant="titleMedium" style={styles.title}>{title}</Text>
            </View>
          )}

          <Card.Content>
            <Space size={8} />

            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange } }) => (
                <>
                  <TextInput
                    label={t('common.title')}
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                    numberOfLines={4}
                    multiline
                  />
                  {!!errors.title && (
                    <Text style={styles.errorText}>
                      {errors.title.message}
                    </Text>
                  )}
                </>
              )}
            />

            <Space size={12} />

            <Controller
              control={control}
              name="reward"
              render={({ field: { value, onChange } }) => (
                <>
                  <TextInput
                    label={`⭐ ${t('rewards.reward')}`}
                    value={String(value)}
                    onChangeText={text => onChange(Number(text))}
                    keyboardType="numeric"
                    mode="outlined"
                  />
                  {!!errors.reward && (
                    <Text style={styles.errorText}>
                      {errors.reward.message}
                    </Text>
                  )}
                </>
              )}
            />

            <Space size={12} />

            <Controller
              control={control}
              name="picture"
              render={({ field: { value, onChange } }) => (
                <SelectImageWithCustom
                  kind="reward"
                  options={rewardImageOptions}
                  value={value}
                  onChange={onChange}
                />
              )}
            />

            <Space size={24} />

            <Button mode="contained" onPress={handleSubmit(onSubmit)}>
              {t('button.save')}
            </Button>

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
      </ScrollView>

      <DeleteModal
        isVisible={isDeleteModalVisible}
        title={t('rewards.delete_reward')}
        message={t('rewards.delete_reward_confirm')}
        onRequestClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};
