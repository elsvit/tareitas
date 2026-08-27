import { RouteProp, useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
  removeTaskAssignment,
  updateTaskAssignment,
} from '~/store/taskAssignment/slice';
import { selectAllTasks } from '~/store/tasks/selectors';
import { removeTask } from '~/store/tasks/slice';
import { EFormMode, ERecurringEditScope } from '~/types/ECommon';
import { ITaskAssignment, TaskAssignmentFormProps } from '~/types/ITask';
import {
  applyRecurringTaskDelete,
  applyRecurringTaskEdit,
  canDeleteTaskInstance,
  collectPendingTaskIdsForAssignment,
  validateTaskDeleteAllowed,
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
  const allTasks = useSelector(selectAllTasks);
  const isHabit = assignment?.isHabit ?? isHabitFromRoute;

  const canDelete = useMemo(() => {
    if (!assignment) {
      return false;
    }

    const date = editDate ?? assignment.startDate;

    return canDeleteTaskInstance(assignment.id, date, allTasks);
  }, [allTasks, assignment, editDate]);

  const saveError = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return (
      common[ECommonActions.ERROR][updateTaskAssignment.type]?.message ??
      common[ECommonActions.ERROR][addTaskAssignment.type]?.message ??
      common[ECommonActions.ERROR][removeTaskAssignment.type]?.message ??
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

  const isDeleting = useSelector((state: RootStateT) => {
    const common = state[EStateName.common];

    return (
      common[ECommonActions.LOADING][removeTaskAssignment.type] ||
      common[ECommonActions.LOADING][updateTaskAssignment.type] ||
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
    if (pendingNavigation && !isSaving && !isDeleting && !saveError) {
      setPendingNavigation(false);

      if (router.canGoBack()) {
        router.back();
      }
    }
  }, [pendingNavigation, isSaving, isDeleting, saveError, router]);

  const finishSave = () => {
    setSubmitError(null);
    setPendingNavigation(true);
  };

  const removeTaskInstances = (taskIds: string[]) => {
    for (const taskId of taskIds) {
      dispatch(removeTask({ entity: taskId }));
    }
  };

  const runAssignmentMutations = (
    updates: ITaskAssignment[],
    removes: string[],
    onComplete: () => void,
  ) => {
    let remaining = updates.length + removes.length;

    if (remaining === 0) {
      onComplete();
      return;
    }

    const handleSuccess = () => {
      remaining -= 1;

      if (remaining === 0) {
        onComplete();
      }
    };

    for (const entity of updates) {
      if (assignment && entity.id === assignment.id) {
        dispatch(
          updateTaskAssignment({
            entity,
            onSuccess: handleSuccess,
          }),
        );
      } else {
        dispatch(
          addTaskAssignment({
            entity,
            onSuccess: handleSuccess,
          }),
        );
      }
    }

    for (const assignmentId of removes) {
      dispatch(
        removeTaskAssignment({
          entity: assignmentId,
          onSuccess: handleSuccess,
        }),
      );
    }
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

      runAssignmentMutations(result.updates, result.removes ?? [], finishSave);

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

  const handleDelete = (scope?: ERecurringEditScope) => {
    if (!assignment || isDeleting) {
      return;
    }

    setSubmitError(null);

    const validationError = validateTaskDeleteAllowed(
      assignment,
      editDate,
      scope,
      allTasks,
    );

    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    if (
      shouldPromptRecurringEditScope(assignment, editDate) &&
      scope &&
      editDate
    ) {
      const result = applyRecurringTaskDelete(
        {
          assignment,
          editDate,
          scope,
        },
        allTasks,
      );

      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }

      removeTaskInstances(result.taskIdsToRemove);
      runAssignmentMutations(
        result.updates ?? [],
        result.removes ?? [],
        finishSave,
      );
      return;
    }

    removeTaskInstances(
      collectPendingTaskIdsForAssignment(assignment.id, allTasks),
    );

    dispatch(
      removeTaskAssignment({
        entity: assignment.id,
        onSuccess: finishSave,
      }),
    );
  };

  return (
    <AssignmentTaskForm
      mode={EFormMode.Edit}
      assignment={assignment}
      editDate={editDate}
      isHabit={isHabit}
      title={isHabit ? t('habits.edit_habit') : undefined}
      onSave={handleSave}
      onDelete={handleDelete}
      canDelete={canDelete}
      submitError={submitError}
      isSubmitting={isSaving}
      isDeleting={isDeleting}
    />
  );
}
