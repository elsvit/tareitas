import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from 'date-fns';

import type { IState } from '../types';
import { selectAllChildren } from '~/store/children/selectors';
import { selectAllTaskAssignment } from '~/store/taskAssignment/selectors';
import { selectAllTaskBase } from '~/store/taskBase/selectors';
import { selectTaskEntities } from '~/store/tasks/selectors';
import { ETaskStatus } from '~/types/ETask';
import { ERewardStatus } from '~/types/EReward';
import {
  IEarnedRewardPeriod,
  IEarnedRewardPeriodEntry,
  IEarnedRewardPeriods,
  IReward,
} from '~/types/IReward';
import { createTaskId, shouldShowAssignmentOnDate } from '~/utils/tasks/taskGeneration';
import { getEffectiveTaskReward } from '~/utils/tasks/taskReward';
import { getAssignmentFieldsForDate } from '~/utils/tasks/recurringTaskEdit';

import { selectAllRewardAssignment } from '../rewardAssignment/selectors';
import {
  createEarnedPeriodEntry,
  createEarnedPeriodForChild,
  findEarnedPeriod,
  getApprovedPeriodBalance,
  getChildBalanceFromPeriod,
  getLastClosedPeriod,
  hasChildEarnedPeriods,
  isPeriodClosed,
  normalizeEarnedRewardPeriods,
  sortEarnedPeriods,
  upsertChildEarnedPeriod,
} from './earnedRewardPeriodUtils';

export {
  createEarnedPeriodEntry,
  createEarnedPeriodForChild,
  findEarnedPeriod,
  getApprovedPeriodBalance,
  getChildBalanceFromPeriod,
  getLastApprovedMonth,
  getLastApprovedPeriod,
  getLastClosedPeriod,
  hasChildEarnedPeriods,
  hasEarnedPeriod,
  isPeriodClosed,
  normalizeEarnedRewardPeriods,
  sortEarnedPeriods,
  upsertChildEarnedPeriod,
} from './earnedRewardPeriodUtils';
export type { IEarnedRewardPeriodEntry } from '~/types/IReward';

const getAllRewards = (state: IState): IReward[] =>
  state.rewards.ids
    .map(id => state.rewards.entities[id])
    .filter((reward): reward is IReward => !!reward);

export const formatYearMonth = (date: Date) => format(date, 'yyyy-MM');

export const parseYearMonth = (yearMonth: string) =>
  parseISO(`${yearMonth}-01`);

export const getMonthsBetweenInclusive = (
  fromYearMonth: string,
  toYearMonth: string,
): string[] => {
  const months: string[] = [];
  let cursor = parseYearMonth(fromYearMonth);
  const end = parseYearMonth(toYearMonth);

  while (cursor <= end) {
    months.push(formatYearMonth(cursor));
    cursor = addMonths(cursor, 1);
  }

  return months;
};

export const getFirstTaskDateForChild = (
  state: IState,
  childId: string,
): string | null => {
  const assignmentIds = new Set(
    selectAllTaskAssignment(state)
      .filter(assignment => assignment.childId === childId)
      .map(assignment => assignment.id),
  );

  let earliest: string | null = null;

  for (const taskId of state.tasks.ids) {
    const task = state.tasks.entities[taskId];

    if (!task || !assignmentIds.has(task.assignmentId)) {
      continue;
    }

    if (!earliest || task.date < earliest) {
      earliest = task.date;
    }
  }

  return earliest;
};

export const getFirstTaskYearMonth = (
  state: IState,
  childId: string,
): string | null => {
  const firstTaskDate = getFirstTaskDateForChild(state, childId);

  if (!firstTaskDate) {
    return null;
  }

  return formatYearMonth(parseISO(firstTaskDate));
};

export const sumApprovedTaskRewardsForMonth = (
  state: IState,
  childId: string,
  yearMonth: string,
): number => {
  const monthStart = startOfMonth(parseYearMonth(yearMonth));
  const monthEnd = endOfMonth(monthStart);
  const assignments = selectAllTaskAssignment(state).filter(
    assignment => assignment.childId === childId,
  );
  const taskEntities = selectTaskEntities(state);
  const taskBaseList = selectAllTaskBase(state);

  return eachDayOfInterval({ start: monthStart, end: monthEnd }).reduce(
    (total, day) => {
      const date = format(day, 'yyyy-MM-dd');

      return (
        total +
        assignments
          .filter(assignment => shouldShowAssignmentOnDate(assignment, date))
          .reduce((dayTotal, assignment) => {
            const taskId = createTaskId(assignment.id, date);
            const task = taskEntities[taskId];

            if (task?.status !== ETaskStatus.Approved) {
              return dayTotal;
            }

            const taskBase = assignment.picture
              ? taskBaseList.find(item => item.picture === assignment.picture)
              : undefined;
            const fieldsForDate = getAssignmentFieldsForDate(
              assignment,
              date,
              taskBase?.reward,
            );
            const effectiveAssignment = {
              ...assignment,
              reward: fieldsForDate.reward,
              newTaskBonus: fieldsForDate.newTaskBonus,
              newTaskDuration: fieldsForDate.newTaskDuration,
              startDate: assignment.startDate,
            };

            return (
              dayTotal +
              getEffectiveTaskReward(effectiveAssignment, date, taskBase?.reward)
            );
          }, 0)
      );
    },
    0,
  );
};

export const hasCompletedTasksInMonth = (
  state: IState,
  childId: string,
  yearMonth: string,
): boolean => {
  const monthStart = startOfMonth(parseYearMonth(yearMonth));
  const monthEnd = endOfMonth(monthStart);
  const assignments = selectAllTaskAssignment(state).filter(
    assignment => assignment.childId === childId,
  );
  const taskEntities = selectTaskEntities(state);

  return eachDayOfInterval({ start: monthStart, end: monthEnd }).some(day => {
    const date = format(day, 'yyyy-MM-dd');

    return assignments
      .filter(assignment => shouldShowAssignmentOnDate(assignment, date))
      .some(assignment => {
        const taskId = createTaskId(assignment.id, date);
        const task = taskEntities[taskId];

        return task?.status === ETaskStatus.Completed;
      });
  });
};

const allMonthsWithoutCompletedTasks = (
  state: IState,
  childId: string,
  fromYearMonth: string,
  toYearMonth: string,
): boolean => {
  if (fromYearMonth > toYearMonth) {
    return true;
  }

  return getMonthsBetweenInclusive(fromYearMonth, toYearMonth).every(
    month => !hasCompletedTasksInMonth(state, childId, month),
  );
};

export const buildPeriodApprovalUpdates = (
  state: IState,
  childId: string,
  targetYearMonth: string,
  periods: IEarnedRewardPeriods = normalizeEarnedRewardPeriods(
    state.rewards.earnedRewardPeriods,
  ),
): Array<{
  yearMonth: string;
  remainingRewardFromPreviousMonths: number;
  monthReward: number;
}> => {
  const firstTaskMonth = getFirstTaskYearMonth(state, childId);

  if (!firstTaskMonth || targetYearMonth < firstTaskMonth) {
    return [];
  }

  const lastClosedPeriod = getLastClosedPeriod(periods, childId);

  if (lastClosedPeriod && lastClosedPeriod.yearMonth >= targetYearMonth) {
    return [];
  }

  let runningBalance =
    lastClosedPeriod && lastClosedPeriod.yearMonth < targetYearMonth
      ? getApprovedPeriodBalance(lastClosedPeriod)
      : 0;

  const startMonth = lastClosedPeriod
    ? formatYearMonth(addMonths(parseYearMonth(lastClosedPeriod.yearMonth), 1))
    : firstTaskMonth;

  const monthsToUpdate = getMonthsBetweenInclusive(
    startMonth,
    targetYearMonth,
  ).filter(yearMonth => {
    const period = findEarnedPeriod(periods, childId, yearMonth);

    return (period?.remainingRewardFromPreviousMonths ?? null) === null;
  });

  return monthsToUpdate.map(yearMonth => {
    const period = findEarnedPeriod(periods, childId, yearMonth);
    const monthReward =
      period?.monthReward ??
      sumApprovedTaskRewardsForMonth(state, childId, yearMonth);
    const update = {
      yearMonth,
      remainingRewardFromPreviousMonths: runningBalance,
      monthReward,
    };

    runningBalance += monthReward;

    return update;
  });
};

export const findApprovableMonthPeriod = (
  state: IState,
  childId: string,
  periods: IEarnedRewardPeriods = normalizeEarnedRewardPeriods(
    state.rewards.earnedRewardPeriods,
  ),
): string | null => {
  const firstTaskMonth = getFirstTaskYearMonth(state, childId);

  if (!firstTaskMonth) {
    return null;
  }

  const currentYearMonth = formatYearMonth(new Date());
  const lastClosedPeriod = getLastClosedPeriod(periods, childId);
  const scanStartMonth = lastClosedPeriod
    ? formatYearMonth(addMonths(parseYearMonth(lastClosedPeriod.yearMonth), 1))
    : firstTaskMonth;

  if (scanStartMonth > currentYearMonth) {
    return null;
  }

  const monthsToScan = getMonthsBetweenInclusive(
    scanStartMonth,
    currentYearMonth,
  );

  let latestCleanOpenMonth: string | null = null;
  let latestCleanOpenMonthWithReward: string | null = null;

  for (const yearMonth of monthsToScan) {
    if (hasCompletedTasksInMonth(state, childId, yearMonth)) {
      const monthBefore = formatYearMonth(
        addMonths(parseYearMonth(yearMonth), -1),
      );

      if (
        allMonthsWithoutCompletedTasks(
          state,
          childId,
          firstTaskMonth,
          monthBefore,
        )
      ) {
        return yearMonth;
      }

      break;
    }

    const period = findEarnedPeriod(periods, childId, yearMonth);

    if ((period?.remainingRewardFromPreviousMonths ?? null) !== null) {
      continue;
    }

    if (
      allMonthsWithoutCompletedTasks(state, childId, firstTaskMonth, yearMonth)
    ) {
      latestCleanOpenMonth = yearMonth;

      if ((period?.monthReward ?? 0) > 0) {
        latestCleanOpenMonthWithReward = yearMonth;
      }
    }
  }

  return latestCleanOpenMonthWithReward ?? latestCleanOpenMonth;
};

export const syncEarnedRewardPeriodsFromState = (
  state: IState,
): IEarnedRewardPeriods => {
  const existingPeriods = normalizeEarnedRewardPeriods(
    state.rewards.earnedRewardPeriods,
  );
  const nextPeriods: IEarnedRewardPeriods = existingPeriods.map(period => ({
    ...period,
  }));
  const currentYearMonth = formatYearMonth(new Date());

  selectAllChildren(state).forEach(child => {
    const firstTaskMonth = getFirstTaskYearMonth(state, child.id);

    if (!firstTaskMonth) {
      return;
    }

    const months = getMonthsBetweenInclusive(firstTaskMonth, currentYearMonth);

    months.forEach((yearMonth, index) => {
      const existingBalance = getChildBalanceFromPeriod(
        nextPeriods.find(period => period.yearMonth === yearMonth),
        child.id,
      );
      const monthReward = sumApprovedTaskRewardsForMonth(
        state,
        child.id,
        yearMonth,
      );

      let remainingRewardFromPreviousMonths =
        existingBalance?.remainingRewardFromPreviousMonths ?? null;

      if (remainingRewardFromPreviousMonths === null && index === 0) {
        remainingRewardFromPreviousMonths = 0;
      }

      upsertChildEarnedPeriod(nextPeriods, child.id, yearMonth, {
        remainingRewardFromPreviousMonths,
        monthReward,
      });
    });
  });

  return sortEarnedPeriods(nextPeriods);
};

export const sumReservedRewardCosts = (
  state: IState,
  childId: string,
): number => {
  const assignments = selectAllRewardAssignment(state);
  const assignmentMap = new Map(assignments.map(item => [item.id, item]));

  return getAllRewards(state)
    .filter(
      reward =>
        reward.childId === childId &&
        !reward.completedDate &&
        (reward.status === ERewardStatus.Selected ||
          reward.status === ERewardStatus.Approved),
    )
    .reduce((total, reward) => {
      const assignment = assignmentMap.get(reward.rewardAssignmentId);

      return total + (assignment?.reward ?? 0);
    }, 0);
};

export const getChildCurrentRewardBalance = (
  state: IState,
  childId: string,
): number => {
  const earnedRewardPeriods = normalizeEarnedRewardPeriods(
    state.rewards.earnedRewardPeriods,
  );
  const firstTaskMonth = getFirstTaskYearMonth(state, childId);

  if (!firstTaskMonth) {
    return 0 - sumReservedRewardCosts(state, childId);
  }

  const lastClosedPeriod = getLastClosedPeriod(earnedRewardPeriods, childId);
  const currentYearMonth = formatYearMonth(new Date());

  if (!lastClosedPeriod) {
    const firstPeriod = findEarnedPeriod(
      earnedRewardPeriods,
      childId,
      firstTaskMonth,
    );
    const base = firstPeriod?.monthReward ?? 0;
    const openMonthsStart = formatYearMonth(
      addMonths(parseYearMonth(firstTaskMonth), 1),
    );
    const openMonthsReward = getMonthsBetweenInclusive(
      openMonthsStart,
      currentYearMonth,
    ).reduce((total, yearMonth) => {
      const period = findEarnedPeriod(earnedRewardPeriods, childId, yearMonth);

      return total + (period?.monthReward ?? 0);
    }, 0);

    return base + openMonthsReward - sumReservedRewardCosts(state, childId);
  }

  const openMonthsStart = formatYearMonth(
    addMonths(parseYearMonth(lastClosedPeriod.yearMonth), 1),
  );
  const openMonthsReward = getMonthsBetweenInclusive(
    openMonthsStart,
    currentYearMonth,
  ).reduce((total, yearMonth) => {
    const period = findEarnedPeriod(earnedRewardPeriods, childId, yearMonth);

    return total + (period?.monthReward ?? 0);
  }, 0);

  return (
    getApprovedPeriodBalance(lastClosedPeriod) +
    openMonthsReward -
    sumReservedRewardCosts(state, childId)
  );
};

export const findActiveRewardInstance = (
  rewards: IReward[],
  rewardAssignmentId: string,
  childId: string,
): IReward | undefined => {
  const activeStatuses = new Set<ERewardStatus>([
    ERewardStatus.Selected,
    ERewardStatus.Approved,
    ERewardStatus.Rejected,
  ]);

  const matches = rewards.filter(
    reward =>
      reward.rewardAssignmentId === rewardAssignmentId &&
      reward.childId === childId &&
      !reward.completedDate &&
      !!reward.status &&
      activeStatuses.has(reward.status),
  );

  if (matches.length === 0) {
    return undefined;
  }

  return matches.reduce((latest, current) => {
    const latestTime = latest.updatedAt ?? latest.createdAt ?? '';
    const currentTime = current.updatedAt ?? current.createdAt ?? '';

    return currentTime >= latestTime ? current : latest;
  });
};

export const canChildAffordReward = (
  state: IState,
  childId: string,
  rewardCost: number,
): boolean => getChildCurrentRewardBalance(state, childId) >= rewardCost;
