import React, { FC, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import CrossIcon from '~/assets/svg/common/cross.svg';
import { BottomBanner, useBottomBannerScrollPadding } from '~/components/ads/BottomBanner';
import { ScreenHeader } from '~/components/blocks';
import { DeleteModal } from '~/components/modals';
import {
  Button,
  ButtonColors,
  Card,
  Space,
  Switch,
  Text,
  TextInput,
} from '~/components/ui';
import { IconButton } from '~/components/ui/IconButton';
import { SelectImageWithCustom } from '~/components/ui/SelectImage/SelectImageWithCustom';
import { SelectColor } from '~/components/ui/SelectColor';
import {
  DEFAULT_BASE_TASK_COLOR,
  getTaskImageOptions,
} from '~/constants/tasks';
import { t } from '~/services';
import { removeTaskBase } from '~/store/taskBase/slice';
import { userColors, Colors } from '~/styles';
import { EFormMode } from '~/types/ECommon';
import { ISubtask, ITaskBase, TaskBaseFormProps } from '~/types/ITask';
import { capitalizeFirst } from '~/utils/string';

import { selectIsParent } from '~/store/settings/selectors';
import { styles } from './styles';

type Props = {
  title?: string;
  mode: EFormMode;
  task?: Partial<ITaskBase>;
  onSave?: (task: TaskBaseFormProps) => void;
  onValidityChange?: (valid: boolean) => void;
  showScreenHeader?: boolean;
};

type FormValues = TaskBaseFormProps & {
  withSubtasks: boolean;
  subtasks: ISubtask[];
};

const COLOR_OPTIONS = Object.entries(userColors).map(([key, value]) => ({
  label: capitalizeFirst(key),
  value,
}));

const requiredMessage = t('common.required') || 'Required';

const schema = z
  .object({
    name: z.string().trim().min(1, requiredMessage),
    description: z.string().optional(),
    reward: z.preprocess(
      value => {
        if (
          value === '' ||
          value === undefined ||
          value === null ||
          (typeof value === 'number' && Number.isNaN(value))
        ) {
          return undefined;
        }

        return value;
      },
      z
        .number()
        .min(0, t('tasks.reward_positive') || 'Reward must be ≥ 0')
        .optional(),
    ),
    picture: z.string().trim().min(1, requiredMessage),
    color: z.string().trim().min(1, requiredMessage),
    withSubtasks: z.boolean(),
    subtasks: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    ),
  })
  .superRefine((values, ctx) => {
    if (!values.withSubtasks) {
      return;
    }

    const hasValidSubtask = values.subtasks.some(
      subtask => subtask.label.trim().length > 0,
    );

    if (!hasValidSubtask) {
      ctx.addIssue({
        code: 'custom',
        message: t('tasks.subtasks_required') || 'Add at least one subtask',
        path: ['subtasks'],
      });
    }
  });

export const BaseTaskForm: FC<Props> = ({
  title,
  task,
  mode,
  onSave,
  onValidityChange,
  showScreenHeader = true,
}) => {
  const headerTitle =
    title ??
    (mode === EFormMode.Add ? t('tasks.add_base_task') : t('tasks.edit_base_task'));

  const dispatch = useDispatch();
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const bottomBannerScrollPadding = useBottomBannerScrollPadding();

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
      reward: task?.reward,
      picture: task?.picture ?? '',
      color: task?.color ?? DEFAULT_BASE_TASK_COLOR,
      withSubtasks: (task?.subtasks?.length ?? 0) > 0,
      subtasks:
        task?.subtasks?.map(subtask => ({
          value: subtask.value,
          label: subtask.label,
        })) ?? [],
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });


  const withSubtasks = watch('withSubtasks');
  const { fields: subtaskFields, append, remove } = useFieldArray({
    control,
    name: 'subtasks',
  });

  const taskImageOptions = getTaskImageOptions();
  const isEditMode = mode === EFormMode.Edit;

  const canManageBaseTasks = useSelector(selectIsParent);

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

    onSave?.({
      name: parsed.data.name,
      description: parsed.data.description,
      reward: parsed.data.reward,
      picture: parsed.data.picture,
      color: parsed.data.color,
      subtasks: parsed.data.withSubtasks
        ? parsed.data.subtasks
            .filter(subtask => subtask.label.trim().length > 0)
            .map(subtask => ({
              value: subtask.value || uuidv4(),
              label: subtask.label.trim(),
            }))
        : undefined,
    });

    if (router.canGoBack()) {
      router.back();
    }
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
    <>
      {showScreenHeader && (
        <ScreenHeader
          hasBackButton
          title={headerTitle}
          containerStyle={styles.screenHeader}
        />
      )}
      <View style={styles.formRoot}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            bottomBannerScrollPadding > 0 && {
              paddingBottom: bottomBannerScrollPadding,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
        <Card>
          {!!title && !showScreenHeader && (
            <View style={styles.titleContainer}>
              <Text variant="titleMedium" style={styles.title}>{title}</Text>
            </View>
          )}

          <Card.Content>
            <Space size={3} />
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

            <Space size={3} />

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

            <Space size={3} />

            <Controller
              control={control}
              name="reward"
              render={({ field: { value, onChange } }) => (
                <>
                  <TextInput
                    label={t('tasks.reward')}
                    value={value == null ? '' : String(value)}
                    onChangeText={text => {
                      if (text.trim() === '') {
                        onChange(undefined);
                        return;
                      }

                      onChange(Number(text));
                    }}
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

            <Space size={4} />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t('tasks.subtasks')}</Text>
              <Controller
                control={control}
                name="withSubtasks"
                render={({ field: { value, onChange } }) => (
                  <Switch
                    value={value}
                    onValueChange={nextValue => {
                      onChange(nextValue);

                      if (nextValue && subtaskFields.length === 0) {
                        append({ value: uuidv4(), label: '' });
                      }
                    }}
                  />
                )}
              />
            </View>

            {withSubtasks && (
              <>
                <Space size={4} />
                <View style={styles.subtasksContainer}>
                  {subtaskFields.map((field, index) => (
                    <View key={field.id} style={styles.subtaskFieldRow}>
                      <Controller
                        control={control}
                        name={`subtasks.${index}.label`}
                        render={({ field: { value, onChange } }) => (
                          <TextInput
                            label={`${t('tasks.subtask_label')} ${index + 1}`}
                            value={value}
                            onChangeText={onChange}
                            mode="outlined"
                            multiline
                            numberOfLines={2}
                            style={styles.subtaskInput}
                          />
                        )}
                      />
                      <View style={styles.subtaskRemoveWrap}>
                        <IconButton
                          onPress={() => remove(index)}
                          disabled={subtaskFields.length === 1}
                          accessibilityLabel={t('button.delete')}
                          size={56}
                          borderRadius={12}
                          style={styles.subtaskRemoveButton}
                          Icon={
                            <CrossIcon
                              width={22}
                              height={22}
                              fill={Colors.grey700}
                            />
                          }
                        />
                      </View>
                    </View>
                  ))}
                  <Space size={3} />
                  <Button
                    mode="contained"
                    onPress={() => append({ value: uuidv4(), label: '' })}
                  >
                    {t('tasks.add_subtask')}
                  </Button>
                  {!!errors.subtasks && (
                    <Text style={styles.errorText}>
                      {errors.subtasks.message as string}
                    </Text>
                  )}
                </View>
              </>
            )}

            <Space size={3} />

            <Controller
              control={control}
              name="color"
              render={({ field: { value, onChange } }) => (
                <>
                  <SelectColor
                    options={COLOR_OPTIONS}
                    value={value ?? DEFAULT_BASE_TASK_COLOR}
                    onChange={onChange}
                    errorMessage={errors.color?.message}
                  />
                </>
              )}
            />

            <Space size={3} />

            <Controller
              control={control}
              name="picture"
              render={({ field: { value, onChange } }) => (
                <SelectImageWithCustom
                  kind="task"
                  options={taskImageOptions}
                  value={value}
                  onChange={onChange}
                />
              )}
            />

            <Space size={5} />

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
            >
              {t('button.save')}
            </Button>
            {isEditMode && canManageBaseTasks && (
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

        <BottomBanner />
      </View>

      <DeleteModal
        isVisible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};