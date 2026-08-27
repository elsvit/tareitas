import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subDays,
} from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import {
  findEarnedPeriod,
  isPeriodClosed,
} from '~/store/rewards/earnedRewardPeriodUtils';
import { normalizeTaskStatus } from '~/constants/tasks/taskStatus';
import { ERecurringEditScope } from '~/types/ECommon';
import { ETaskRepeatType, ETaskStatus } from '~/types/ETask';
import {
  ITaskAssignment,
  ITaskAssignmentChange,
  TaskAssignmentFormProps,
} from '~/types/ITask';
import { IEarnedRewardPeriods } from '~/types/IReward';
import { t } from '~/services';
import {
  createTaskId,
  isRepeatingAssignment,
  shouldShowAssignmentOnDate,
} from '~/utils/tasks/taskGeneration';

export const formatYearMonth = (date: string) => date.slice(0, 7);

export const getAssignmentChangeForDate = (
  assignment: ITaskAssignment,
  date: string,
): ITaskAssignmentChange | undefined => assignment.changes?.[date];

export const getAssignmentFieldsForDate = (
  assignment: ITaskAssignment,
  date: string,
  taskBaseReward?: number,
) => {
  const change = getAssignmentChangeForDate(assignment, date);

  return {
    title: change?.name ?? assignment.title,
    description: change?.description ?? assignment.description,
    reward: change?.reward ?? assignment.reward ?? taskBaseReward,
    picture: change?.picture ?? assignment.picture,
    time: change?.time ?? assignment.time,
    newTaskBonus: change?.newTaskBonus ?? assignment.newTaskBonus,
    newTaskDuration: change?.newTaskDuration ?? assignment.newTaskDuration,
  };
};

const buildBonusFields = (values: TaskAssignmentFormProps) => {
  const repeats =
    !!values.repeat && values.repeat.type !== ETaskRepeatType.None;

  if (
    !repeats ||
    values.newTaskBonus == null ||
    values.newTaskBonus <= 0
  ) {
    return {
      newTaskBonus: undefined,
      newTaskDuration: undefined,
    };
  }

  return {
    newTaskBonus: values.newTaskBonus,
    newTaskDuration: values.newTaskDuration,
  };
};

export const buildAssignmentFromFormValues = (
  values: TaskAssignmentFormProps,
  existing?: Partial<ITaskAssignment>,
): Omit<ITaskAssignment, 'id' | 'createdAt'> => {
  const bonusFields = buildBonusFields(values);

  return {
    childId: values.childId,
    title: values.title,
    description: values.description,
    reward: values.reward,
    picture: values.picture,
    color: values.color,
    startDate: values.startDate,
    endDate: values.endDate,
    time: values.time,
    isHabit: values.isHabit,
    repeat: values.repeat,
    subtasks: values.subtasks,
    ...bonusFields,
    updatedAt: new Date().toISOString(),
    changes: existing?.changes,
  };
};

const diffChangeEntry = (
  assignment: ITaskAssignment,
  date: string,
  values: TaskAssignmentFormProps,
): ITaskAssignmentChange | null => {
  const entry: ITaskAssignmentChange = {};
  const bonusFields = buildBonusFields(values);

  if (values.title !== assignment.title) {
    entry.name = values.title;
  }

  if ((values.description ?? '') !== (assignment.description ?? '')) {
    entry.description = values.description;
  }

  if (values.reward !== assignment.reward) {
    entry.reward = values.reward;
  }

  if ((values.picture ?? '') !== (assignment.picture ?? '')) {
    entry.picture = values.picture;
  }

  if (values.time !== assignment.time) {
    entry.time = values.time;
  }

  if (bonusFields.newTaskBonus !== assignment.newTaskBonus) {
    entry.newTaskBonus = bonusFields.newTaskBonus;
  }

  if (bonusFields.newTaskDuration !== assignment.newTaskDuration) {
    entry.newTaskDuration = bonusFields.newTaskDuration;
  }

  if (Object.keys(entry).length === 0) {
    return null;
  }

  return entry;
};

export const applyOnlyThisTaskChange = (
  assignment: ITaskAssignment,
  date: string,
  values: TaskAssignmentFormProps,
): ITaskAssignment => {
  const changeEntry = diffChangeEntry(assignment, date, values);
  const nextChanges = { ...(assignment.changes ?? {}) };

  if (!changeEntry) {
    delete nextChanges[date];
  } else {
    nextChanges[date] = changeEntry;
  }

  return {
    ...assignment,
    changes: Object.keys(nextChanges).length > 0 ? nextChanges : undefined,
    updatedAt: new Date().toISOString(),
  };
};

export const splitAssignmentForFollowing = (
  assignment: ITaskAssignment,
  date: string,
  values: TaskAssignmentFormProps,
): { first: ITaskAssignment | null; second: ITaskAssignment } => {
  const bonusFields = buildBonusFields(values);
  const splitDate = parseISO(date);
  const assignmentStart = parseISO(assignment.startDate);

  if (splitDate <= assignmentStart) {
    return {
      first: null,
      second: {
        ...assignment,
        ...buildAssignmentFromFormValues(values, assignment),
        id: assignment.id,
        createdAt: assignment.createdAt,
        changes: undefined,
      },
    };
  }

  const previousDay = format(subDays(splitDate, 1), 'yyyy-MM-dd');
  const keptChanges = Object.fromEntries(
    Object.entries(assignment.changes ?? {}).filter(([changeDate]) => changeDate < date),
  );

  const first: ITaskAssignment = {
    ...assignment,
    endDate: previousDay,
    changes: Object.keys(keptChanges).length > 0 ? keptChanges : undefined,
    updatedAt: new Date().toISOString(),
  };

  const second: ITaskAssignment = {
    ...assignment,
    ...buildAssignmentFromFormValues(values, assignment),
    id: uuidv4(),
    startDate: date,
    createdAt: new Date().toISOString(),
    changes: undefined,
  };

  return { first, second };
};

export const getClosedYearMonthsForAssignment = (
  assignment: ITaskAssignment,
  periods: IEarnedRewardPeriods,
): string[] => {
  const closedMonths = new Set<string>();
  const rangeEnd = assignment.endDate ?? format(new Date(), 'yyyy-MM-dd');
  let cursor = startOfMonth(parseISO(assignment.startDate));
  const end = endOfMonth(parseISO(rangeEnd));

  while (cursor <= end) {
    const yearMonth = format(cursor, 'yyyy-MM');
    const period = findEarnedPeriod(periods, assignment.childId, yearMonth);

    if (period && isPeriodClosed(period)) {
      const monthStart = cursor;
      const monthEnd = endOfMonth(cursor);
      const hasOccurrence = eachDayOfInterval({
        start: monthStart,
        end: monthEnd > parseISO(rangeEnd) ? parseISO(rangeEnd) : monthEnd,
      }).some(day => {
        const dayStr = format(day, 'yyyy-MM-dd');

        return (
          day >= parseISO(assignment.startDate) &&
          shouldShowAssignmentOnDate(assignment, dayStr)
        );
      });

      if (hasOccurrence) {
        closedMonths.add(yearMonth);
      }
    }

    cursor = addMonths(cursor, 1);
  }

  return [...closedMonths];
};

export const validateAllTasksRecurringEdit = (
  original: ITaskAssignment,
  updated: TaskAssignmentFormProps,
  periods: IEarnedRewardPeriods,
): string | null => {
  if (!isRepeatingAssignment(original)) {
    return null;
  }

  const closedMonths = getClosedYearMonthsForAssignment(original, periods);

  if (closedMonths.length === 0) {
    return null;
  }

  const bonusFields = buildBonusFields(updated);
  const rewardChanged = updated.reward !== original.reward;
  const startChanged = updated.startDate !== original.startDate;
  const bonusChanged =
    bonusFields.newTaskBonus !== original.newTaskBonus ||
    bonusFields.newTaskDuration !== original.newTaskDuration;

  if (rewardChanged || startChanged || bonusChanged) {
    return (
      t('tasks.cannot_edit_approved_period_fields') ||
      'Cannot change start date, reward, or bonus for tasks in approved months'
    );
  }

  return null;
};

export const shouldPromptRecurringEditScope = (
  assignment: ITaskAssignment | undefined,
  editDate?: string,
): boolean =>
  !!assignment &&
  !!editDate &&
  isRepeatingAssignment(assignment);

export type ApplyRecurringEditParams = {
  assignment: ITaskAssignment;
  editDate: string;
  values: TaskAssignmentFormProps;
  scope: ERecurringEditScope;
  periods: IEarnedRewardPeriods;
};

export type ApplyRecurringEditResult =
  | {
      ok: true;
      updates: ITaskAssignment[];
      removes?: string[];
    }
  | { ok: false; error: string };

export type TaskInstanceRef = {
  id: string;
  assignmentId: string;
  date: string;
  status?: ETaskStatus | string | null;
};

export const getTaskInstanceStatus = (
  assignmentId: string,
  date: string,
  tasks: TaskInstanceRef[],
): ETaskStatus => {
  const task = tasks.find(
    item => item.assignmentId === assignmentId && item.date === date,
  );

  return normalizeTaskStatus(task?.status);
};

export const canDeleteTaskInstance = (
  assignmentId: string,
  date: string,
  tasks: TaskInstanceRef[],
): boolean =>
  getTaskInstanceStatus(assignmentId, date, tasks) === ETaskStatus.Pending;

export const getNonPendingTasksForAssignment = (
  assignmentId: string,
  tasks: TaskInstanceRef[],
  fromDate?: string,
): TaskInstanceRef[] =>
  tasks.filter(
    task =>
      task.assignmentId === assignmentId &&
      (!fromDate || task.date >= fromDate) &&
      normalizeTaskStatus(task.status) !== ETaskStatus.Pending,
  );

export const validateTaskDeleteAllowed = (
  assignment: ITaskAssignment,
  editDate: string | undefined,
  scope: ERecurringEditScope | undefined,
  tasks: TaskInstanceRef[],
): string | null => {
  const deleteError =
    t('tasks.delete_only_pending') ||
    'Only pending tasks can be deleted.';

  if (
    scope &&
    editDate &&
    shouldPromptRecurringEditScope(assignment, editDate)
  ) {
    if (scope === ERecurringEditScope.OnlyThis) {
      return canDeleteTaskInstance(assignment.id, editDate, tasks)
        ? null
        : deleteError;
    }

    if (scope === ERecurringEditScope.ThisAndFollowing) {
      return getNonPendingTasksForAssignment(
        assignment.id,
        tasks,
        editDate,
      ).length > 0
        ? deleteError
        : null;
    }

    return getNonPendingTasksForAssignment(assignment.id, tasks).length > 0
      ? deleteError
      : null;
  }

  const date = editDate ?? assignment.startDate;

  if (!canDeleteTaskInstance(assignment.id, date, tasks)) {
    return deleteError;
  }

  return getNonPendingTasksForAssignment(assignment.id, tasks).length > 0
    ? deleteError
    : null;
};

export type ApplyRecurringDeleteParams = {
  assignment: ITaskAssignment;
  editDate: string;
  scope: ERecurringEditScope;
};

export type ApplyRecurringDeleteResult =
  | {
      ok: true;
      updates?: ITaskAssignment[];
      removes?: string[];
      taskIdsToRemove: string[];
    }
  | { ok: false; error: string };

export const applyOnlyThisTaskDelete = (
  assignment: ITaskAssignment,
  date: string,
): ITaskAssignment => {
  const nextChanges = { ...(assignment.changes ?? {}) };

  nextChanges[date] = {
    ...nextChanges[date],
    excluded: true,
  };

  return {
    ...assignment,
    changes: nextChanges,
    updatedAt: new Date().toISOString(),
  };
};

export const applyFollowingTasksDelete = (
  assignment: ITaskAssignment,
  date: string,
): { update?: ITaskAssignment; remove?: string } => {
  const splitDate = parseISO(date);
  const assignmentStart = parseISO(assignment.startDate);

  if (splitDate <= assignmentStart) {
    return { remove: assignment.id };
  }

  const previousDay = format(subDays(splitDate, 1), 'yyyy-MM-dd');
  const keptChanges = Object.fromEntries(
    Object.entries(assignment.changes ?? {}).filter(
      ([changeDate]) => changeDate < date,
    ),
  );

  return {
    update: {
      ...assignment,
      endDate: previousDay,
      changes: Object.keys(keptChanges).length > 0 ? keptChanges : undefined,
      updatedAt: new Date().toISOString(),
    },
  };
};

export const collectPendingTaskIdsForAssignment = (
  assignmentId: string,
  tasks: TaskInstanceRef[],
  fromDate?: string,
): string[] =>
  tasks
    .filter(
      task =>
        task.assignmentId === assignmentId &&
        (!fromDate || task.date >= fromDate) &&
        normalizeTaskStatus(task.status) === ETaskStatus.Pending,
    )
    .map(task => task.id);

export const collectTaskIdsForAssignment = (
  assignmentId: string,
  tasks: Array<{ id: string; assignmentId: string; date: string }>,
  fromDate?: string,
): string[] => collectPendingTaskIdsForAssignment(assignmentId, tasks, fromDate);

export const applyRecurringTaskDelete = (
  params: ApplyRecurringDeleteParams,
  tasks: TaskInstanceRef[],
): ApplyRecurringDeleteResult => {
  const { assignment, editDate, scope } = params;

  const validationError = validateTaskDeleteAllowed(
    assignment,
    editDate,
    scope,
    tasks,
  );

  if (validationError) {
    return { ok: false, error: validationError };
  }

  if (scope === ERecurringEditScope.OnlyThis) {
    return {
      ok: true,
      updates: [applyOnlyThisTaskDelete(assignment, editDate)],
      taskIdsToRemove: [createTaskId(assignment.id, editDate)],
    };
  }

  if (scope === ERecurringEditScope.ThisAndFollowing) {
    const result = applyFollowingTasksDelete(assignment, editDate);

    if (result.remove) {
      return {
        ok: true,
        removes: [result.remove],
        taskIdsToRemove: collectPendingTaskIdsForAssignment(
          assignment.id,
          tasks,
          editDate,
        ),
      };
    }

    return {
      ok: true,
      updates: result.update ? [result.update] : [],
      taskIdsToRemove: collectPendingTaskIdsForAssignment(
        assignment.id,
        tasks,
        editDate,
      ),
    };
  }

  return {
    ok: true,
    removes: [assignment.id],
    taskIdsToRemove: collectPendingTaskIdsForAssignment(assignment.id, tasks),
  };
};

export const applyRecurringTaskEdit = (
  params: ApplyRecurringEditParams,
): ApplyRecurringEditResult => {
  const { assignment, editDate, values, scope, periods } = params;

  if (scope === ERecurringEditScope.OnlyThis) {
    return {
      ok: true,
      updates: [applyOnlyThisTaskChange(assignment, editDate, values)],
    };
  }

  if (scope === ERecurringEditScope.ThisAndFollowing) {
    const { first, second } = splitAssignmentForFollowing(
      assignment,
      editDate,
      values,
    );

    return {
      ok: true,
      updates: first ? [first, second] : [second],
    };
  }

  const validationError = validateAllTasksRecurringEdit(
    assignment,
    values,
    periods,
  );

  if (validationError) {
    return { ok: false, error: validationError };
  }

  return {
    ok: true,
    updates: [
      {
        ...assignment,
        ...buildAssignmentFromFormValues(values, assignment),
        id: assignment.id,
        createdAt: assignment.createdAt,
      },
    ],
  };
};

