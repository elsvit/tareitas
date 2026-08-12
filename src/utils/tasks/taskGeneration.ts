import { getISODay, isAfter, isBefore, isEqual, parseISO } from 'date-fns';

import { WeekDay } from '~/types/ECommon';
import { ETaskRepeatType, ETaskStatus } from '~/types/ETask';
import { ITask, ITaskAssignment } from '~/types/ITask';

export const createTaskId = (assignmentId: string, date: string) =>
  `${assignmentId}_${date}`;

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
