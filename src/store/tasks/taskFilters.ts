import { eachDayOfInterval, format, parseISO, subDays } from 'date-fns';

import { RootStateT } from '~/store';
import { selectChildById } from '~/store/children/selectors';
import { selectAllTaskBase } from '~/store/taskBase/selectors';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import { selectTaskAssignmentById } from '~/store/taskAssignment/selectors';
import { ITaskFilters } from '~/store/tasks/types';
import { ETaskStatus } from '~/types/ETask';

import {
  ScheduledTaskItem,
  buildTaskListItemViewFromParts,
  selectTaskEntities,
} from './selectors';
import { createTaskId, shouldShowAssignmentOnDate } from '~/utils/tasks/taskGeneration';

export type TaskFilterSection = {
  date: string;
  data: ScheduledTaskItem[];
};

export const PAST_COMPLETED_SEARCH_DAYS = 60;
export const PAST_COMPLETED_SEARCH_CHUNK = 100;

const matchesHabitFilter = (
  assignment: { isHabit?: boolean } | undefined,
  isHabit: boolean,
) => (isHabit ? assignment?.isHabit === true : !assignment?.isHabit);

const matchesStatusFilter = (
  status: ETaskStatus,
  statuses?: ETaskStatus[],
) => !statuses?.length || statuses.includes(status);

export const getScheduledItemsForDate = (
  state: RootStateT,
  date: string,
  options: {
    childId?: string;
    isHabit?: boolean;
  } = {},
): ScheduledTaskItem[] => {
  const assignments = selectAllTaskAssignment(state);
  const taskEntities = selectTaskEntities(state);
  const isHabit = options.isHabit ?? false;

  return assignments
    .filter(assignment => shouldShowAssignmentOnDate(assignment, date))
    .filter(
      assignment => !options.childId || assignment.childId === options.childId,
    )
    .filter(assignment => matchesHabitFilter(assignment, isHabit))
    .map(assignment => {
      const id = createTaskId(assignment.id, date);

      return {
        id,
        assignmentId: assignment.id,
        date,
        task: taskEntities[id] ?? null,
      };
    })
    .sort((a, b) => {
      const assignmentA = assignments.find(item => item.id === a.assignmentId);
      const assignmentB = assignments.find(item => item.id === b.assignmentId);

      return (assignmentA?.time ?? '').localeCompare(assignmentB?.time ?? '');
    });
};

const getItemStatus = (
  state: RootStateT,
  item: ScheduledTaskItem,
): ETaskStatus | null => {
  const assignment = selectTaskAssignmentById(item.assignmentId)(state);

  if (!assignment) {
    return null;
  }

  const child = selectChildById(state, assignment.childId);
  const taskBaseList = selectAllTaskBase(state);
  const view = buildTaskListItemViewFromParts(
    item.id,
    item.assignmentId,
    item.date,
    item.task,
    assignment,
    child,
    taskBaseList,
  );

  return view?.status ?? null;
};

export const filterScheduledItemsByStatus = (
  state: RootStateT,
  items: ScheduledTaskItem[],
  statuses?: ETaskStatus[],
): ScheduledTaskItem[] =>
  items.filter(item => {
    const status = getItemStatus(state, item);

    return status != null && matchesStatusFilter(status, statuses);
  });

export const getFilteredTaskSections = (
  state: RootStateT,
  filters: ITaskFilters,
): TaskFilterSection[] => {
  const dates = eachDayOfInterval({
    start: parseISO(filters.startDate),
    end: parseISO(filters.endDate),
  });

  return dates
    .map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const items = filterScheduledItemsByStatus(
        state,
        getScheduledItemsForDate(state, dateStr, {
          childId: filters.childId,
          isHabit: filters.isHabit,
        }),
        filters.status,
      );

      if (items.length === 0) {
        return null;
      }

      return {
        date: dateStr,
        data: items,
      };
    })
    .filter((section): section is TaskFilterSection => section != null)
    .reverse();
};

export const hasCompletedTasksInPast = (
  state: RootStateT,
  options: {
    isHabit: boolean;
    childId?: string;
  },
  maxDays = PAST_COMPLETED_SEARCH_DAYS,
  maxExamined = PAST_COMPLETED_SEARCH_CHUNK,
): boolean => {
  let examined = 0;
  const today = new Date();

  // Start at 1: only past days count — today's completed tasks must not show the button.
  for (let daysAgo = 1; daysAgo <= maxDays; daysAgo += 1) {
    const targetDate = format(subDays(today, daysAgo), 'yyyy-MM-dd');
    const items = getScheduledItemsForDate(state, targetDate, {
      childId: options.childId,
      isHabit: options.isHabit,
    });

    for (const item of items) {
      examined += 1;

      if (examined > maxExamined) {
        return false;
      }

      const status = getItemStatus(state, item);

      if (status === ETaskStatus.Completed) {
        return true;
      }
    }
  }

  return false;
};
