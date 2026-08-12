import React, { FC, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';

import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { DeleteModal } from '~/components/modals';
import { WeekDaySelector } from '~/components/tasks/WeekDaySelector';
import {
  Button,
  ButtonColors,
  Card,
  Space,
  Switch,
  Text,
  TextInput,
} from '~/components/ui';
import { Select } from '~/components/ui/Select/Select';
import { SelectColor } from '~/components/ui/SelectColor';
import { SelectImage } from '~/components/ui/SelectImage/SelectImage';
import { getTaskImageOptions } from '~/constants/tasks';
import { t } from '~/services';
import { selectAllChildren } from '~/store/children/selectors';
import { ERole } from '~/store/settings/enums';
import { selectCurrentRole } from '~/store/settings/selectors';
import { removeTaskAssignment } from '~/store/taskAssignment/slice';
import { selectAllTaskBase } from '~/store/taskBase/selectors';
import { userColors } from '~/styles';
import { EFormMode, WeekDay } from '~/types/ECommon';
import { ETaskRepeatType } from '~/types/ETask';
import { ITaskAssignment, TaskAssignmentFormProps } from '~/types/ITask';
import { capitalizeFirst } from '~/utils/string';

import { styles } from './styles';

type Props = {
  title?: string;
  mode: EFormMode;
  assignment?: Partial<ITaskAssignment>;
  defaultDate?: string;
  isHabit?: boolean;
  onSave?: (assignment: TaskAssignmentFormProps) => void;
  onValidityChange?: (valid: boolean) => void;
};

type FormValues = {
  childId: string;
  title: string;
  description?: string;
  reward?: number;
  picture?: string;
  color: string;
  startDate: string;
  endDate?: string;
  time: string;
  repeats: boolean;
  weekDays: WeekDay[];
  baseTaskId?: string;
};

const COLOR_OPTIONS = Object.entries(userColors).map(([key, value]) => ({
  label: capitalizeFirst(key),
  value,
}));

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const requiredMessage = t('common.required') || 'Required';

const buildSchema = (repeats: boolean) =>
  z
    .object({
      childId: z.string().trim().min(1, requiredMessage),
      title: z.string().trim().min(1, requiredMessage),
      description: z.string().optional(),
      reward: z.coerce
        .number()
        .min(0, t('tasks.reward_positive') || 'Reward must be ≥ 0')
        .optional(),
      picture: z.string().optional(),
      color: z.string().trim().min(1, requiredMessage),
      startDate: z
        .string()
        .trim()
        .regex(DATE_PATTERN, t('tasks.invalid_date') || 'Invalid date'),
      endDate: z.string().optional(),
      time: z
        .string()
        .trim()
        .regex(TIME_PATTERN, t('tasks.invalid_time') || 'Invalid time'),
      repeats: z.boolean(),
      weekDays: z.array(z.nativeEnum(WeekDay)),
      baseTaskId: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (values.repeats) {
        if (!values.endDate || !DATE_PATTERN.test(values.endDate)) {
          ctx.addIssue({
            code: 'custom',
            message: t('tasks.invalid_date') || 'Invalid date',
            path: ['endDate'],
          });
        }

        if (values.weekDays.length === 0) {
          ctx.addIssue({
            code: 'custom',
            message: t('tasks.week_days.required') || 'Select at least one day',
            path: ['weekDays'],
          });
        }
      }
    });

export const AssignmentTaskForm: FC<Props> = ({
  title,
  assignment,
  mode,
  defaultDate,
  isHabit,
  onSave,
  onValidityChange,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const children = useSelector(selectAllChildren);
  const baseTasks = useSelector(selectAllTaskBase);
  const currentRole = useSelector(selectCurrentRole);
  const isAdmin = currentRole === ERole.admin;
  const isEditMode = mode === EFormMode.Edit;

  const today = format(new Date(), 'yyyy-MM-dd');
  const initialDate = defaultDate ?? assignment?.startDate ?? today;

  const isRepeating =
    !!assignment?.repeat &&
    assignment.repeat.type !== ETaskRepeatType.None;

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
      childId: assignment?.childId ?? children[0]?.id ?? '',
      title: assignment?.title ?? '',
      description: assignment?.description ?? '',
      reward: assignment?.reward ?? 0,
      picture: assignment?.picture ?? '',
      color: assignment?.color ?? userColors.blue600,
      startDate: initialDate,
      endDate: assignment?.endDate ?? initialDate,
      time: assignment?.time ?? '09:00',
      repeats: isHabit || isRepeating,
      weekDays:
        assignment?.repeat?.weekDays ??
        (isHabit
          ? [
              WeekDay.Mon,
              WeekDay.Tue,
              WeekDay.Wed,
              WeekDay.Thu,
              WeekDay.Fri,
              WeekDay.Sat,
              WeekDay.Sun,
            ]
          : []),
      baseTaskId: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const repeats = watch('repeats');
  const selectedColor = watch('color');

  const childOptions = useMemo(
    () =>
      children.map(child => ({
        label: child.name,
        value: child.id,
      })),
    [children],
  );

  const baseTaskOptions = useMemo(
    () =>
      baseTasks.map(task => ({
        label: task.name,
        value: task.id,
      })),
    [baseTasks],
  );

  const taskImageOptions = getTaskImageOptions();

  useEffect(() => {
    const sub = watch(() => {
      const valid = buildSchema(getValues().repeats).safeParse(getValues())
        .success;
      onValidityChange?.(valid);
    });

    onValidityChange?.(
      buildSchema(getValues().repeats).safeParse(getValues()).success,
    );

    return () => sub.unsubscribe();
  }, [watch, getValues, onValidityChange]);

  const handleBaseTaskChange = (baseTaskId: string) => {
    setValue('baseTaskId', baseTaskId);

    const baseTask = baseTasks.find(item => item.id === baseTaskId);

    if (!baseTask) {
      return;
    }

    setValue('title', baseTask.name, { shouldValidate: true });
    setValue('description', baseTask.description ?? '', {
      shouldValidate: true,
    });
    setValue('reward', baseTask.reward ?? 0, { shouldValidate: true });
    setValue('picture', baseTask.picture ?? '', { shouldValidate: true });
  };

  const onSubmit = (values: FormValues) => {
    const parsed = buildSchema(values.repeats).safeParse(values);

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

    const payload: TaskAssignmentFormProps = {
      childId: parsed.data.childId,
      title: parsed.data.title,
      description: parsed.data.description,
      reward: parsed.data.reward,
      picture: parsed.data.picture,
      color: parsed.data.color,
      startDate: parsed.data.startDate,
      time: parsed.data.time,
      isHabit,
      repeat: parsed.data.repeats
        ? {
            type: ETaskRepeatType.Week,
            weekDays: parsed.data.weekDays,
          }
        : {
            type: ETaskRepeatType.None,
          },
      endDate: parsed.data.repeats ? parsed.data.endDate : undefined,
    };

    onSave?.(payload);
  };

  const handleConfirmDelete = () => {
    if (!assignment?.id) {
      return;
    }

    dispatch(removeTaskAssignment({ entity: assignment.id }));

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
            {childOptions.length > 0 && (
              <>
                <Controller
                  control={control}
                  name="childId"
                  render={({ field: { value, onChange } }) => (
                    <>
                      <Select
                        label={t('tasks.child')}
                        options={childOptions}
                        value={value}
                        onChange={onChange}
                      />
                      {!!errors.childId && (
                        <Text style={styles.errorText}>
                          {errors.childId.message}
                        </Text>
                      )}
                    </>
                  )}
                />
                <Space size={12} />
              </>
            )}

            {baseTaskOptions.length > 0 && (
              <>
                <Controller
                  control={control}
                  name="baseTaskId"
                  render={({ field: { value } }) => (
                    <Select
                      label={t('tasks.base_task_template')}
                      options={baseTaskOptions}
                      value={value}
                      onChange={handleBaseTaskChange}
                    />
                  )}
                />
                <Space size={12} />
              </>
            )}

            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange } }) => (
                <>
                  <TextInput
                    label={t('tasks.name')}
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                  />
                  {!!errors.title && (
                    <Text style={styles.errorText}>{errors.title.message}</Text>
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
                    value={String(value ?? 0)}
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
                  value={value ?? ''}
                  onChange={onChange}
                />
              )}
            />

            <Space size={16} />

            <View style={styles.switchRow}>
              <Text style={styles.label}>{t('tasks.repeats')}</Text>
              <Controller
                control={control}
                name="repeats"
                render={({ field: { value, onChange } }) => (
                  <Switch value={value} onValueChange={onChange} />
                )}
              />
            </View>

            <Space size={12} />

            <Controller
              control={control}
              name="startDate"
              render={({ field: { value, onChange } }) => (
                <>
                  <TextInput
                    label={t('tasks.start_date')}
                    value={value}
                    onChangeText={onChange}
                    placeholder="YYYY-MM-DD"
                    mode="outlined"
                  />
                  {!!errors.startDate && (
                    <Text style={styles.errorText}>
                      {errors.startDate.message}
                    </Text>
                  )}
                </>
              )}
            />

            <Space size={12} />

            {repeats && (
              <>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field: { value, onChange } }) => (
                    <>
                      <TextInput
                        label={t('tasks.end_date')}
                        value={value}
                        onChangeText={onChange}
                        placeholder="YYYY-MM-DD"
                        mode="outlined"
                      />
                      {!!errors.endDate && (
                        <Text style={styles.errorText}>
                          {errors.endDate.message}
                        </Text>
                      )}
                    </>
                  )}
                />
                <Space size={12} />
              </>
            )}

            <Controller
              control={control}
              name="time"
              render={({ field: { value, onChange } }) => (
                <>
                  <TextInput
                    label={t('tasks.time')}
                    value={value}
                    onChangeText={onChange}
                    placeholder="HH:mm"
                    mode="outlined"
                  />
                  {!!errors.time && (
                    <Text style={styles.errorText}>{errors.time.message}</Text>
                  )}
                </>
              )}
            />

            <Space size={12} />

            <Controller
              control={control}
              name="color"
              render={({ field: { value, onChange } }) => (
                <SelectColor
                  options={COLOR_OPTIONS}
                  value={value}
                  onChange={onChange}
                />
              )}
            />

            {repeats && (
              <>
                <Space size={12} />
                <Controller
                  control={control}
                  name="weekDays"
                  render={({ field: { value, onChange } }) => (
                    <>
                      <WeekDaySelector
                        value={value}
                        onChange={onChange}
                        color={selectedColor}
                      />
                      {!!errors.weekDays && (
                        <Text style={styles.errorText}>
                          {errors.weekDays.message}
                        </Text>
                      )}
                    </>
                  )}
                />
              </>
            )}

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
                  onPress={() => setIsDeleteModalVisible(true)}
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
