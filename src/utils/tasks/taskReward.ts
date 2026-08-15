import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';

import { ITaskAssignment } from '~/types/ITask';

type TaskRewardAssignment = Pick<
  ITaskAssignment,
  'reward' | 'startDate' | 'newTaskBonus' | 'newTaskDuration'
>;

export const getBaseTaskReward = (
  assignment: Pick<ITaskAssignment, 'reward'>,
  taskBaseReward?: number,
): number => assignment.reward ?? taskBaseReward ?? 0;

export const isNewTaskBonusActive = (
  assignment: TaskRewardAssignment,
  taskDate: string,
): boolean => {
  const bonus = assignment.newTaskBonus;

  if (bonus == null || bonus <= 0) {
    return false;
  }

  const duration = assignment.newTaskDuration;

  if (duration == null || duration <= 0) {
    return false;
  }

  const daysSinceStart = differenceInCalendarDays(
    parseISO(taskDate),
    parseISO(assignment.startDate),
  );

  return daysSinceStart >= 0 && daysSinceStart < duration;
};

export const getEffectiveTaskReward = (
  assignment: TaskRewardAssignment,
  taskDate: string,
  taskBaseReward?: number,
): number => {
  const baseReward = getBaseTaskReward(assignment, taskBaseReward);

  if (isNewTaskBonusActive(assignment, taskDate)) {
    return baseReward + (assignment.newTaskBonus ?? 0);
  }

  return baseReward;
};

export const getTaskRewardDisplayText = (
  baseReward: number | undefined,
  newTaskBonus: number | undefined,
  isBonusActive: boolean,
): string | null => {
  if (baseReward == null) {
    return null;
  }

  if (isBonusActive && newTaskBonus != null && newTaskBonus > 0) {
    return `${baseReward}+${newTaskBonus}`;
  }

  return String(baseReward);
};

export const getMaxNewTaskDurationDays = (
  startDate: string,
  endDate: string,
): number =>
  differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;

export const getNewTaskBonusLastDay = (
  startDate: string,
  duration: number,
): Date => addDays(parseISO(startDate), duration - 1);

export const isNewTaskDurationWithinEndDate = (
  startDate: string,
  endDate: string | undefined,
  duration: number,
): boolean => {
  if (!endDate) {
    return true;
  }

  if (duration <= 0) {
    return false;
  }

  const lastBonusDay = getNewTaskBonusLastDay(startDate, duration);

  return lastBonusDay <= parseISO(endDate);
};
