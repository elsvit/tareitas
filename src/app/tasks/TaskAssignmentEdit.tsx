import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';

import { AssignmentTaskForm } from '~/components/tasks/TaskForm/AssignmentTaskForm';
import { t } from '~/services';
import { selectEarnedRewardPeriods } from '~/store/rewards/selectors';
import { selectTaskAssignmentById } from '~/store/taskAssignment/selectors';
import {
  addTaskAssignment,
  updateTaskAssignment,
} from '~/store/taskAssignment/slice';
import { EFormMode, ERecurringEditScope } from '~/types/ECommon';
import { ITaskAssignment, TaskAssignmentFormProps } from '~/types/ITask';
import {
  applyRecurringTaskEdit,
  shouldPromptRecurringEditScope,
} from '~/utils/tasks/recurringTaskEdit';

export default function TaskAssignmentEdit() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { params } = useRoute<
    RouteProp<
      Record<string, { id: string; isHabit?: string; date?: string }>,
      string
    >
  >();
  const { id } = params;
  const editDate = params?.date;
  const isHabitFromRoute = params?.isHabit === 'true';

  const assignment = useSelector(selectTaskAssignmentById(id));
  const earnedRewardPeriods = useSelector(selectEarnedRewardPeriods);
  const isHabit = assignment?.isHabit ?? isHabitFromRoute;

  const handleSave = (
    valuesList: TaskAssignmentFormProps[],
    scope?: ERecurringEditScope,
  ): string | null => {
    const values = valuesList[0];

    if (!values || !assignment) {
      return null;
    }

    if (
      shouldPromptRecurringEditScope(assignment, editDate) &&
      scope &&
      editDate
    ) {
      const result = applyRecurringTaskEdit({
        assignment,
        editDate,
        values,
        scope,
        periods: earnedRewardPeriods,
      });

      if (!result.ok) {
        return result.error;
      }

      result.updates.forEach(entity => {
        if (entity.id === assignment.id) {
          dispatch(updateTaskAssignment({ entity }));
        } else {
          dispatch(addTaskAssignment({ entity }));
        }
      });

      if (router.canGoBack()) {
        router.back();
      }

      return null;
    }

    dispatch(
      updateTaskAssignment({
        entity: {
          id,
          updatedAt: new Date().toISOString(),
          ...values,
        } as ITaskAssignment,
      }),
    );

    if (router.canGoBack()) {
      router.back();
    }

    return null;
  };

  return (
    <AssignmentTaskForm
      mode={EFormMode.Edit}
      assignment={assignment}
      editDate={editDate}
      isHabit={isHabit}
      title={isHabit ? t('habits.edit_habit') : undefined}
      onSave={handleSave}
    />
  );
}
