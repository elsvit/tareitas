import { ITaskAssignment } from '~/types/ITask';

export function countTaskRecordsForDate(
  assignments: ITaskAssignment[],
  date: string,
): number {
  return assignments.reduce((count, assignment) => {
    if (assignment.changes?.[date]?.audioRecord) {
      return count + 1;
    }

    return count;
  }, 0);
}

export function getEffectiveTaskRecordCountForDate(
  assignments: ITaskAssignment[],
  date: string,
  hasExistingRecord: boolean,
): number {
  const total = countTaskRecordsForDate(assignments, date);

  return hasExistingRecord ? Math.max(0, total - 1) : total;
}

export function canAddTaskRecord(params: {
  assignments: ITaskAssignment[];
  date: string;
  hasExistingRecord: boolean;
  isPro: boolean;
  withoutSubscriptionLimit: number;
  maximumLimit: number;
}): {
  isAtMaximumLimit: boolean;
  isAtFreeLimit: boolean;
  isRecordDisabled: boolean;
  showSubscriptionHelp: boolean;
} {
  const effectiveCount = getEffectiveTaskRecordCountForDate(
    params.assignments,
    params.date,
    params.hasExistingRecord,
  );
  const isAtMaximumLimit =
    effectiveCount >= params.maximumLimit;
  const isAtFreeLimit =
    !params.isPro &&
    effectiveCount >= params.withoutSubscriptionLimit;
  const isRecordDisabled = isAtMaximumLimit || isAtFreeLimit;
  const showSubscriptionHelp =
    isAtFreeLimit && !isAtMaximumLimit;

  return {
    isAtMaximumLimit,
    isAtFreeLimit,
    isRecordDisabled,
    showSubscriptionHelp,
  };
}
