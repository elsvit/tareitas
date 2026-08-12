import React, { FC, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';

import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { DeleteModal } from '~/components/modals';
import {
  Button,
  ButtonColors,
  Card,
  Space,
  Text,
  TextInput,
} from '~/components/ui';
import { SelectImage } from '~/components/ui/SelectImage/SelectImage';
import { getTaskImageOptions } from '~/constants/tasks';
import { t } from '~/services';
import { removeTaskBase } from '~/store/taskBase/slice';
import { EFormMode } from '~/types/ECommon';
import { ITaskBase, TaskBaseFormProps } from '~/types/ITask';

import { ERole } from '~/store/settings/enums';
import { selectCurrentRole } from '~/store/settings/selectors';
import { styles } from './styles';

type Props = {
  title?: string;
  mode: EFormMode;
  task?: Partial<ITaskBase>;
  onSave?: (task: TaskBaseFormProps) => void;
  onValidityChange?: (valid: boolean) => void;
};

type FormValues = TaskBaseFormProps;

const requiredMessage = t('common.required') || 'Required';

const schema = z.object({
  name: z.string().trim().min(1, requiredMessage),
  description: z.string().optional(),
  reward: z.coerce
    .number()
    .min(0, t('tasks.reward_positive') || 'Reward must be ≥ 0'),
  picture: z.string().trim().min(1, requiredMessage),
});

export const BaseTaskForm: FC<Props> = ({
  title,
  task,
  mode,
  onSave,
  onValidityChange,
}) => {
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
      name: task?.name ?? '',
      description: task?.description ?? '',
      reward: task?.reward ?? 0,
      picture: task?.picture ?? '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });


  const taskImageOptions = getTaskImageOptions();
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
    if (!task?.id) {
      return;
    }

    dispatch(removeTaskBase({ id: task.id }));

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaBackground>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          {!!title && (
            <View style={styles.titleContainer}>
              <Text variant="titleMedium">{title}</Text>
            </View>
          )}

          <Card.Content>

            <Controller
              control={control}
              name="name"
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
                  {!!errors.name && (
                    <Text style={styles.errorText}>
                      {errors.name.message}
                    </Text>
                  )}
                </>
              )}
            />

            <Space size={12} />

            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  label={t('tasks.description')}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  mode="outlined"
                />
              )}
            />

            <Space size={12} />

            <Controller
              control={control}
              name="reward"
              render={({ field: { value, onChange } }) => (
                <>
                  <TextInput
                    label={t('tasks.reward')}
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
                <SelectImage
                  options={taskImageOptions}
                  value={value}
                  onChange={onChange}
                // errorMessage={
                //   // errors?.avatar?.message || requiredMessage
                // }
                />

              )}
            />

            <Space size={24} />

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
            >
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
        onRequestClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </SafeAreaBackground>
  );
};