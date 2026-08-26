import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { AssignmentTaskForm } from '~/components/tasks/TaskForm/AssignmentTaskForm';
import { ALL_WEEK_DAYS } from '~/components/tasks/WeekDaySelector';
import { t } from '~/services';
import { RootStateT } from '~/store';
import { ECommonActions } from '~/store/common/types';
import { EStateName } from '~/store/enums';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import {
  addTaskAssignmentsBatch,
} from '~/store/taskAssignment/slice';
import {
  generateTasksForDate,
} from '~/store/tasks/slice';
import { selectUsesCloudSync } from '~/store/settings/selectors';
import { syncTaskAssignments } from '~/store/settings/slice';
import { store } from '~/store/store';
import { EFormMode } from '~/types/ECommon';
import { ETaskRepeatType } from '~/types/ETask';
import { ITaskAssignment, TaskAssignmentFormProps } from '~/types/ITask';

const parseIsHabitParam = (value: unknown) =>
  value === true || value === 'true';

export default function TaskAssignmentAdd() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { params } = useRoute<
    RouteProp<Record<string, { date?: string; isHabit?: string | boolean }>, string>
  >();

  const selectedDate = params?.date;
  const isHabit = parseIsHabitParam(params?.isHabit);

  const saveError = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return (
      common[ECommonActions.ERROR][addTaskAssignmentsBatch.type]?.message ??
      null
    );
  });

  const isSaving = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return common[ECommonActions.LOADING][addTaskAssignmentsBatch.type] ?? false;
  });

  const isMultidevice = useSelector(selectUsesCloudSync);

  useEffect(() => {
    if (saveError) {
      setSubmitError(saveError);
    }
  }, [saveError]);

  const handleSave = (valuesList: TaskAssignmentFormProps[]) => {
    if (valuesList.length === 0 || isSaving) {
      return null;
    }

    setSubmitError(null);

    const calendarDate = selectedDate ?? valuesList[0].startDate;
    const newAssignments = valuesList.map(values => {
      const id = uuidv4();

      const habitValues = isHabit
        ? {
          ...values,
          isHabit: true,
          endDate:
            values.endDate?.trim() && values.endDate !== values.startDate
              ? values.endDate
              : undefined,
          repeat: {
            type: ETaskRepeatType.Week,
            weekDays: ALL_WEEK_DAYS,
          },
        }
        : values;

      return {
        id,
        createdAt: new Date().toISOString(),
        ...habitValues,
      } as ITaskAssignment;
    });

    dispatch(
      addTaskAssignmentsBatch({
        entities: newAssignments,
        onSuccess: () => {
          if (isMultidevice) {
            dispatch(syncTaskAssignments());
          } else {
            const assignments = selectAllTaskAssignment(store.getState());

            dispatch(
              generateTasksForDate({
                date: calendarDate,
                assignments,
              }),
            );
          }

          if (router.canGoBack()) {
            router.back();
          }
        },
      }),
    );

    return null;
  };

  return (
    <AssignmentTaskForm
      mode={EFormMode.Add}
      defaultDate={selectedDate}
      isHabit={isHabit}
      title={isHabit ? t('habits.add_habit') : undefined}
      onSave={handleSave}
      submitError={submitError}
      isSubmitting={isSaving}
    />
  );
}
