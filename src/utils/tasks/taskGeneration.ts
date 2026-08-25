import { getISODay, isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import { v5 as uuidv5 } from 'uuid';

import { TASK_ID_NAMESPACE } from '~/constants/catalog';
import { WeekDay } from '~/types/ECommon';
import { ETaskRepeatType, ETaskStatus } from '~/types/ETask';
import { ITask, ITaskAssignment } from '~/types/ITask';

export { TASK_ID_NAMESPACE } from '~/constants/catalog';

export const createTaskId = (assignmentId: string, date: string) =>
  uuidv5(`${assignmentId}:${date.slice(0, 10)}`, TASK_ID_NAMESPACE);

export const isRepeatingAssignment = (assignment: ITaskAssignment) =>
  !!assignment.repeat &&
  assignment.repeat.type !== ETaskRepeatType.None;

export const shouldShowAssignmentOnDate = (
  assignment: ITaskAssignment,
  date: string,
): boolean => {
  const targetDate = parseISO(date);
  const startDate = parseISO(assignment.startDate);

  if (isBefore(targetDate, startDate)) {
    return false;
  }

  if (assignment.endDate) {
    const endDate = parseISO(assignment.endDate);

    if (isAfter(targetDate, endDate)) {
      return false;
    }
  }

  if (!isRepeatingAssignment(assignment)) {
    return isEqual(targetDate, startDate);
  }

  const weekDays = assignment.repeat?.weekDays ?? [];

  if (weekDays.length === 0) {
    return true;
  }

  return weekDays.includes(getISODay(targetDate) as WeekDay);
};

export const createTaskFromAssignment = (
  assignment: ITaskAssignment,
  date: string,
): ITask => ({
  id: createTaskId(assignment.id, date),
  assignmentId: assignment.id,
  date,
  status: ETaskStatus.Pending,
  createdAt: new Date().toISOString(),
});

export const generateTasksForDate = (
  assignments: ITaskAssignment[],
  date: string,
  existingTaskIds: string[],
): ITask[] => {
  const existingIds = new Set(existingTaskIds);

  return assignments
    .filter(assignment => shouldShowAssignmentOnDate(assignment, date))
    .map(assignment => createTaskFromAssignment(assignment, date))
    .filter(task => !existingIds.has(task.id));
};
