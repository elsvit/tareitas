import { format } from 'date-fns';

import { t } from '~/services';
import {
  findEarnedPeriod,
  getLastApprovedMonth,
  isPeriodClosed,
} from '~/store/rewards/earnedRewardPeriodUtils';
import { IEarnedRewardPeriods } from '~/types/IReward';

const getYearMonthFromDate = (date: string) => date.slice(0, 7);

export const getEarliestAllowedTaskYearMonth = (
  periods: IEarnedRewardPeriods,
  childId: string,
): string | null => {
  const currentYearMonth = format(new Date(), 'yyyy-MM');
  const currentPeriod = findEarnedPeriod(periods, childId, currentYearMonth);

  if (!currentPeriod || !isPeriodClosed(currentPeriod)) {
    return null;
  }

  return getLastApprovedMonth(periods, childId);
};

const isDateAllowed = (
  date: string | undefined,
  earliestYearMonth: string | null,
  originalDate: string | undefined,
  isEditMode: boolean,
): boolean => {
  if (!date || !earliestYearMonth) {
    return true;
  }

  if (isEditMode && originalDate && date === originalDate) {
    return true;
  }

  return getYearMonthFromDate(date) >= earliestYearMonth;
};

export const validateTaskAssignmentDates = (params: {
  periods: IEarnedRewardPeriods;
  childIds: string[];
  childNamesById: Record<string, string>;
  startDate: string;
  endDate?: string;
  repeats: boolean;
  isEditMode?: boolean;
  originalStartDate?: string;
  originalEndDate?: string;
}): string | null => {
  const {
    periods,
    childIds,
    childNamesById,
    startDate,
    endDate,
    repeats,
    isEditMode = false,
    originalStartDate,
    originalEndDate,
  } = params;

  for (const childId of childIds) {
    const earliestYearMonth = getEarliestAllowedTaskYearMonth(periods, childId);

    if (!earliestYearMonth) {
      continue;
    }

    const childName = childNamesById[childId] ?? '';

    if (
      !isDateAllowed(startDate, earliestYearMonth, originalStartDate, isEditMode)
    ) {
      return (
        t('tasks.task_date_before_closed_period', {
          month: earliestYearMonth,
          childName,
        }) ||
        `Tasks for ${childName} must start in ${earliestYearMonth} or later`
      );
    }

    if (
      repeats &&
      endDate &&
      !isDateAllowed(endDate, earliestYearMonth, originalEndDate, isEditMode)
    ) {
      return (
        t('tasks.task_end_date_before_closed_period', {
          month: earliestYearMonth,
          childName,
        }) ||
        `Task end date for ${childName} must be in ${earliestYearMonth} or later`
      );
    }
  }

  return null;
};
