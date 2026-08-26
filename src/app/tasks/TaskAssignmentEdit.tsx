import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AssignmentTaskForm } from '~/components/tasks/TaskForm/AssignmentTaskForm';
import { t } from '~/services';
import { RootStateT } from '~/store';
import { ECommonActions } from '~/store/common/types';
import { EStateName } from '~/store/enums';
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState(false);

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

  const saveError = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return (
      common[ECommonActions.ERROR][updateTaskAssignment.type]?.message ??
      common[ECommonActions.ERROR][addTaskAssignment.type]?.message ??
      null
    );
  });

  const isSaving = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return (
      common[ECommonActions.LOADING][updateTaskAssignment.type] ||
      common[ECommonActions.LOADING][addTaskAssignment.type] ||
      false
    );
  });

  useEffect(() => {
    if (saveError) {
      setSubmitError(saveError);
      setPendingNavigation(false);
    }
  }, [saveError]);

  useEffect(() => {
    if (pendingNavigation && !isSaving && !saveError) {
      setPendingNavigation(false);

      if (router.canGoBack()) {
        router.back();
      }
    }
  }, [pendingNavigation, isSaving, saveError, router]);

  const finishSave = () => {
    setSubmitError(null);
    setPendingNavigation(true);
  };

  const handleSave = (
    valuesList: TaskAssignmentFormProps[],
    scope?: ERecurringEditScope,
  ): string | null => {
    const values = valuesList[0];

    if (!values || !assignment || isSaving) {
      return null;
    }

    setSubmitError(null);

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

      let remaining = result.updates.length;

      if (remaining === 0) {
        finishSave();
        return null;
      }

      result.updates.forEach(entity => {
        const onSuccess = () => {
          remaining -= 1;

          if (remaining === 0) {
            finishSave();
          }
        };

        if (entity.id === assignment.id) {
          dispatch(updateTaskAssignment({ entity, onSuccess }));
        } else {
          dispatch(addTaskAssignment({ entity, onSuccess }));
        }
      });

      return null;
    }

    dispatch(
      updateTaskAssignment({
        entity: {
          id,
          updatedAt: new Date().toISOString(),
          ...values,
        } as ITaskAssignment,
        onSuccess: finishSave,
      }),
    );

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
      submitError={submitError}
      isSubmitting={isSaving}
    />
  );
}
