import { ITaskAssignment } from '~/types/ITask';

export function countTaskRecordsForDate(
  assignments: ITaskAssignment[],
  date: string,
  excludeAssignmentId?: string,
): number {
  return assignments.reduce((count, assignment) => {
    if (excludeAssignmentId && assignment.id === excludeAssignmentId) {
      return count;
    }

    if (assignment.changes?.[date]?.audioRecord) {
      return count + 1;
    }

    return count;
  }, 0);
}

export function canAddTaskRecord(params: {
  assignments: ITaskAssignment[];
  date: string;
  assignmentId?: string;
  isPro: boolean;
  withoutSubscriptionLimit: number;
  maximumLimit: number;
}): {
  isAtMaximumLimit: boolean;
  isAtFreeLimit: boolean;
  isRecordDisabled: boolean;
  showSubscriptionHelp: boolean;
} {
  const otherRecordsCount = countTaskRecordsForDate(
    params.assignments,
    params.date,
    params.assignmentId,
  );
  const isAtMaximumLimit =
    otherRecordsCount >= params.maximumLimit;
  const isAtFreeLimit =
    !params.isPro &&
    otherRecordsCount >= params.withoutSubscriptionLimit;
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
