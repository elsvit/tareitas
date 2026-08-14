import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { AssignmentTaskForm } from '~/components/tasks/TaskForm/AssignmentTaskForm';
import { ALL_WEEK_DAYS } from '~/components/tasks/WeekDaySelector';
import { t } from '~/services';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import { addTaskAssignment } from '~/store/taskAssignment/slice';
import {
  generateTasksForDate,
} from '~/store/tasks/slice';
import { EFormMode } from '~/types/ECommon';
import { ETaskRepeatType } from '~/types/ETask';
import { ITaskAssignment, TaskAssignmentFormProps } from '~/types/ITask';

const parseIsHabitParam = (value: unknown) =>
  value === true || value === 'true';

export default function TaskAssignmentAdd() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { params } = useRoute<
    RouteProp<Record<string, { date?: string; isHabit?: string | boolean }>, string>
  >();

  const selectedDate = params?.date;
  const isHabit = parseIsHabitParam(params?.isHabit);
  const assignments = useSelector(selectAllTaskAssignment);

  const handleSave = (valuesList: TaskAssignmentFormProps[]) => {
    if (valuesList.length === 0) {
      return;
    }

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

    newAssignments.forEach(newAssignment => {
      dispatch(
        addTaskAssignment({
          entity: newAssignment,
        }),
      );
    });

    dispatch(
      generateTasksForDate({
        date: calendarDate,
        assignments: [...assignments, ...newAssignments],
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <AssignmentTaskForm
      mode={EFormMode.Add}
      defaultDate={selectedDate}
      isHabit={isHabit}
      title={isHabit ? t('habits.add_habit') : undefined}
      onSave={handleSave}
    />
  );
}
