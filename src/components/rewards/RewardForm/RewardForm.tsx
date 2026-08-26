import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
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
import { Select } from '~/components/ui/Select/Select';
import { SelectImageWithCustom } from '~/components/ui/SelectImage/SelectImageWithCustom';
import { SelectMulti } from '~/components/ui/SelectMulti';
import { getRewardImageOptions } from '~/constants/rewards';
import { t } from '~/services';
import { selectDedupedChildren } from '~/store/children/selectors';
import { removeRewardAssignment } from '~/store/rewardAssignment/slice';
import {
  normalizeRewardChildIdsForSave,
  rewardChildIdsForForm,
} from '~/store/rewardAssignment/childIds';
import { selectPreviousRewardTemplates } from '~/store/rewardAssignment/selectors';
import { selectAllRewardBase } from '~/store/rewardBase/selectors';
import { ERole } from '~/store/settings/enums';
import { selectCurrentRole } from '~/store/settings/selectors';
import { EFormMode } from '~/types/ECommon';
import {
  IRewardAssignment,
  RewardAssignmentFormProps,
} from '~/types/IReward';

import { styles } from './styles';
import { PreviousRewardSelect } from './PreviousRewardSelect';

type Props = {
  title?: string;
  mode: EFormMode;
  reward?: Partial<IRewardAssignment>;
  onSave?: (values: RewardAssignmentFormProps) => void;
  onValidityChange?: (valid: boolean) => void;
  showScreenHeader?: boolean;
  submitError?: string | null;
  isSubmitting?: boolean;
};

type FormValues = Omit<RewardAssignmentFormProps, 'reward' | 'childIds'> & {
  reward?: number | null;
  childIds: string[];
  baseRewardId?: string;
  previousRewardId?: string;
};

const requiredMessage = t('common.required') || 'Required';

const schema = z
  .object({
    title: z.string().trim().min(1, requiredMessage),
    reward: z.preprocess(
      value => {
        if (
          value === '' ||
          value === undefined ||
          value === null ||
          (typeof value === 'number' && Number.isNaN(value))
        ) {
          return Number.NaN;
        }

        return value;
      },
      z
        .number({ message: requiredMessage })
        .min(0, t('rewards.reward_positive') || 'Reward must be ≥ 0'),
    ),
    picture: z.string().trim().min(1, requiredMessage),
    childIds: z.array(z.string()),
  });

export const RewardForm: FC<Props> = ({
  title,
  reward,
  mode,
  onSave,
  onValidityChange,
  showScreenHeader = true,
  submitError,
  isSubmitting = false,
}) => {
  const headerTitle =
    title ??
    (mode === EFormMode.Add ? t('rewards.add_reward') : t('rewards.edit_reward'));

  const dispatch = useDispatch();
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const children = useSelector(selectDedupedChildren);
  const baseRewards = useSelector(selectAllRewardBase);
  const previousRewards = useSelector(selectPreviousRewardTemplates);
  const rewardImageOptions = getRewardImageOptions();
  const isEditMode = mode === EFormMode.Edit;
  const isAddMode = mode === EFormMode.Add;
  const hasMultipleChildren = children.length > 1;
  const singleChild = children.length === 1 ? children[0] : undefined;

  const childOptions = useMemo(
    () =>
      children.map(child => ({
        label: child.name,
        value: child.id,
      })),
    [children],
  );

  const allChildIds = useMemo(
    () => childOptions.map(option => option.value),
    [childOptions],
  );

  const initialChildIds = rewardChildIdsForForm(reward?.childIds, allChildIds);
  const hasInitializedChildIds = useRef(false);

  const currentRole = useSelector(selectCurrentRole);
  const isAdmin = currentRole === ERole.admin;

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: reward?.title ?? '',
      reward: reward?.reward ?? null,
      picture: reward?.picture ?? '',
      childIds: initialChildIds,
      baseRewardId: '',
      previousRewardId: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const baseRewardOptions = useMemo(
    () =>
      baseRewards.map(item => ({
        label: item.title,
        value: item.id,
      })),
    [baseRewards],
  );

  useEffect(() => {
    hasInitializedChildIds.current = false;
  }, [reward?.id, mode]);

  useEffect(() => {
    if (hasInitializedChildIds.current || allChildIds.length === 0) {
      return;
    }

    setValue(
      'childIds',
      rewardChildIdsForForm(reward?.childIds, allChildIds),
      { shouldValidate: true },
    );
    hasInitializedChildIds.current = true;
  }, [allChildIds, mode, reward?.childIds, reward?.id, setValue]);

  const handleBaseRewardChange = (baseRewardId: string) => {
    setValue('baseRewardId', baseRewardId);
    setValue('previousRewardId', '');

    const baseReward = baseRewards.find(item => item.id === baseRewardId);

    if (!baseReward) {
      return;
    }

    setValue('title', baseReward.title, { shouldValidate: true });
    setValue('reward', baseReward.reward ?? null, { shouldValidate: true });
    setValue('picture', baseReward.picture ?? '', { shouldValidate: true });
  };

  const handlePreviousRewardChange = (previousReward: IRewardAssignment) => {
    setValue('previousRewardId', previousReward.id);
    setValue('baseRewardId', '');
    setValue('title', previousReward.title, { shouldValidate: true });
    setValue('reward', previousReward.reward ?? null, { shouldValidate: true });
    setValue('picture', previousReward.picture ?? '', { shouldValidate: true });
  };

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

        if (field) {
          setError(field, {
            type: 'manual',
            message: issue.message,
          });
        }
      });

      return;
    }

    onSave?.({
      title: parsed.data.title,
      reward: parsed.data.reward,
      picture: parsed.data.picture,
      childIds: normalizeRewardChildIdsForSave(
        parsed.data.childIds,
        allChildIds,
      ),
    });
  };

  const handleDelete = () => {
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!reward?.id) {
      return;
    }

    dispatch(removeRewardAssignment({ entity: reward.id }));

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
              <Text variant="titleMedium" style={styles.title}>
                {title}
              </Text>
            </View>
          )}

          <Card.Content>
            <Space size={3} />

            {childOptions.length > 0 && (
              <>
                {hasMultipleChildren ? (
                  <Controller
                    control={control}
                    name="childIds"
                    render={({ field: { value, onChange } }) => (
                      <>
                        <SelectMulti
                          label={t('users.childs')}
                          options={childOptions}
                          value={value}
                          onChange={onChange}
                        />
                        {!!errors.childIds && (
                          <Text style={styles.errorText}>
                            {errors.childIds.message}
                          </Text>
                        )}
                      </>
                    )}
                  />
                ) : singleChild ? (
                  <>
                    <Text variant="titleMedium" weight="bold">
                      {t('users.child')}
                    </Text>
                    <Space size={2} />
                    <Text>{singleChild.name}</Text>
                  </>
                ) : null}
                <Space size={3} />
              </>
            )}

            {baseRewardOptions.length > 0 && (
              <>
                <Controller
                  control={control}
                  name="baseRewardId"
                  render={({ field: { value } }) => (
                    <Select
                      label={t('rewards.base_reward_template')}
                      options={baseRewardOptions}
                      value={value}
                      onChange={handleBaseRewardChange}
                    />
                  )}
                />
                <Space size={3} />
              </>
            )}

            {isAddMode && previousRewards.length > 0 && (
              <>
                <Controller
                  control={control}
                  name="previousRewardId"
                  render={({ field: { value } }) => (
                    <PreviousRewardSelect
                      label={t('rewards.previous_reward_template')}
                      options={previousRewards}
                      value={value}
                      onChange={handlePreviousRewardChange}
                    />
                  )}
                />
                <Space size={3} />
              </>
            )}

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
                    <Text style={styles.errorText}>{errors.title.message}</Text>
                  )}
                </>
              )}
            />

            <Space size={3} />

            <Controller
              control={control}
              name="reward"
              render={({ field: { value, onChange } }) => (
                <>
                  <TextInput
                    label={`⭐ ${t('rewards.reward')}`}
                    value={
                      value != null && !Number.isNaN(value) ? String(value) : ''
                    }
                    onChangeText={text => {
                      if (text.trim() === '') {
                        onChange(null);
                        return;
                      }

                      if (!/^\d+$/.test(text)) {
                        return;
                      }

                      const parsed = Number(text);

                      if (!Number.isNaN(parsed) && parsed >= 0) {
                        onChange(parsed);
                      }
                    }}
                    keyboardType="numeric"
                    mode="outlined"
                  />
                  {!!errors.reward && (
                    <Text style={styles.errorText}>{errors.reward.message}</Text>
                  )}
                </>
              )}
            />

            <Space size={3} />

            <Controller
              control={control}
              name="picture"
              render={({ field: { value, onChange } }) => (
                <SelectImageWithCustom
                  kind="reward"
                  options={rewardImageOptions}
                  value={value}
                  onChange={onChange}
                  errorMessage={errors.picture?.message}
                />
              )}
            />

            <Space size={5} />

            {!!submitError && (
              <>
                <Text style={styles.errorText}>{submitError}</Text>
                <Space size={2} />
              </>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {t('button.save')}
            </Button>

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
