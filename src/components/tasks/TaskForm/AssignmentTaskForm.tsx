import React, { FC, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import CrossIcon from '~/assets/svg/common/cross.svg';
import bgImgSrc from '~/assets/img/bg.png';
import { SafeAreaBackground } from '~/components/blocks/SafeAreaBackground';
import { ScreenHeader } from '~/components/blocks';
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
import { IconButton } from '~/components/ui/IconButton';
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
import { Colors, userColors } from '~/styles';
import { EFormMode, WeekDay } from '~/types/ECommon';
import { ETaskRepeatType } from '~/types/ETask';
import { ISubtask, ITaskAssignment, TaskAssignmentFormProps } from '~/types/ITask';
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
  showScreenHeader?: boolean;
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
  withSubtasks: boolean;
  subtasks: ISubtask[];
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
          .min(0, t('tasks.reward_positive') || 'Reward must be ≥ 0'),
      ),
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
      withSubtasks: z.boolean(),
      subtasks: z.array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      ),
    })
    .superRefine((values, ctx) => {
      if (values.withSubtasks) {
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
      }

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
  showScreenHeader = true,
}) => {
  const headerTitle =
    title ??
    (mode === EFormMode.Add ? t('tasks.add_task') : t('tasks.edit_task'));

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
      withSubtasks: (assignment?.subtasks?.length ?? 0) > 0,
      subtasks:
        assignment?.subtasks?.map(subtask => ({
          value: subtask.value,
          label: subtask.label,
        })) ?? [],
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const repeats = watch('repeats');
  const withSubtasks = watch('withSubtasks');
  const selectedColor = watch('color');

  const { fields: subtaskFields, append, remove } = useFieldArray({
    control,
    name: 'subtasks',
  });

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
      subtasks: parsed.data.withSubtasks
        ? parsed.data.subtasks
          .filter(subtask => subtask.label.trim().length > 0)
          .map(subtask => ({
            value: subtask.value || uuidv4(),
            label: subtask.label.trim(),
          }))
        : undefined,
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
    <SafeAreaBackground hasTopInsets={showScreenHeader} bgImg={bgImgSrc}>
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
                    label={t('common.title')}
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
                    value={
                      value != null && !Number.isNaN(value) ? String(value) : ''
                    }
                    onChangeText={text => {
                      if (text.trim() === '') {
                        onChange(undefined);
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
              <Text style={styles.switchLabel}>{t('tasks.with_subtasks')}</Text>
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
                <Space size={12} />
                {subtaskFields.map((field, index) => (
                  <View key={field.id} style={styles.subtaskFieldRow}>
                    <Controller
                      control={control}
                      name={`subtasks.${index}.label`}
                      render={({ field: { value, onChange } }) => (
                        <TextInput
                          label={t('tasks.subtask_label')}
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
                <Space size={8} />
                <Button
                  mode="outlined"
                  onPress={() => append({ value: uuidv4(), label: '' })}
                >
                  {t('tasks.add_subtask')}
                </Button>
                {!!errors.subtasks && (
                  <Text style={styles.errorText}>
                    {errors.subtasks.message as string}
                  </Text>
                )}
              </>
            )}

            <Space size={16} />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{t('tasks.repeats')}</Text>
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
