import { addMonths, format, parseISO, startOfMonth } from 'date-fns';

import { t } from '~/services';
import { getLastApprovedMonth } from '~/store/rewards/earnedRewardPeriodUtils';
import { IEarnedRewardPeriods } from '~/types/IReward';

export type TaskAssignmentDateValidationError = {
  field: 'startDate' | 'endDate';
  message: string;
};

export const getEarliestAllowedTaskStartDate = (
  periods: IEarnedRewardPeriods,
  childId: string,
): string | null => {
  const lastApprovedMonth = getLastApprovedMonth(periods, childId);

  if (!lastApprovedMonth) {
    return null;
  }

  return format(
    startOfMonth(addMonths(parseISO(`${lastApprovedMonth}-01`), 1)),
    'yyyy-MM-dd',
  );
};

export const getEarliestAllowedTaskStartDateForChildren = (
  periods: IEarnedRewardPeriods,
  childIds: string[],
): string | null => {
  let earliest: string | null = null;

  for (const childId of childIds) {
    const childEarliest = getEarliestAllowedTaskStartDate(periods, childId);

    if (!childEarliest) {
      continue;
    }

    if (!earliest || childEarliest > earliest) {
      earliest = childEarliest;
    }
  }

  return earliest;
};

const isDateAllowed = (
  date: string | undefined,
  earliestDate: string | null,
  originalDate: string | undefined,
  isEditMode: boolean,
): boolean => {
  if (!date || !earliestDate) {
    return true;
  }

  if (isEditMode && originalDate && date === originalDate) {
    return true;
  }

  return date >= earliestDate;
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
}): TaskAssignmentDateValidationError | null => {
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

  if (repeats && endDate && endDate < startDate) {
    return {
      field: 'endDate',
      message:
        t('tasks.task_end_date_before_start_date') ||
        'End date cannot be before start date',
    };
  }

  for (const childId of childIds) {
    const earliestStartDate = getEarliestAllowedTaskStartDate(periods, childId);

    if (!earliestStartDate) {
      continue;
    }

    const childName = childNamesById[childId] ?? '';
    const earliestMonth = earliestStartDate.slice(0, 7);

    if (
      !isDateAllowed(
        startDate,
        earliestStartDate,
        originalStartDate,
        isEditMode,
      )
    ) {
      return {
        field: 'startDate',
        message:
          t('tasks.task_date_before_closed_period', {
            month: earliestMonth,
            childName,
          }) ||
          `Tasks for ${childName} must start in ${earliestMonth} or later`,
      };
    }

    if (
      repeats &&
      endDate &&
      !isDateAllowed(
        endDate,
        earliestStartDate,
        originalEndDate,
        isEditMode,
      )
    ) {
      return {
        field: 'endDate',
        message:
          t('tasks.task_end_date_before_closed_period', {
            month: earliestMonth,
            childName,
          }) ||
          `Task end date for ${childName} must be in ${earliestMonth} or later`,
      };
    }
  }

  return null;
};
