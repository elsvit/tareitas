import { APPROVED_PERIOD_MEDIA_RETENTION_MONTHS } from '~/constants/support';
import { ITaskAssignment, ITaskAssignmentChange } from '~/types/ITask';
import { isBuiltinPictureId, isRemoteImageRef } from '~/utils/imageRefs';

export function subtractMonthsFromYearMonth(
  yearMonth: string,
  months: number,
): string {
  const [yearPart, monthPart] = yearMonth.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  const date = new Date(year, month - 1, 1);

  date.setMonth(date.getMonth() - months);

  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');

  return `${nextYear}-${nextMonth}`;
}

export function getApprovedPeriodMediaCutoffYearMonth(
  approvedYearMonth: string,
): string {
  return subtractMonthsFromYearMonth(
    approvedYearMonth,
    APPROVED_PERIOD_MEDIA_RETENTION_MONTHS,
  );
}

export function isLocalCustomTaskPicture(
  picture: string | undefined,
  taskUrls: Record<string, string>,
): picture is string {
  if (!picture || isBuiltinPictureId(picture, 'task') || isRemoteImageRef(picture)) {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(taskUrls, picture) ||
    picture.startsWith('file://')
  );
}

export type PeriodMediaCleanupResult = {
  assignment: ITaskAssignment;
  removedAudioUris: string[];
  removedPictureRefs: Array<{ ref: string; uri?: string }>;
};

export function cleanupAssignmentChangesForCutoff(
  assignment: ITaskAssignment,
  cutoffYearMonth: string,
  taskUrls: Record<string, string>,
): PeriodMediaCleanupResult {
  const emptyResult: PeriodMediaCleanupResult = {
    assignment,
    removedAudioUris: [],
    removedPictureRefs: [],
  };

  if (!assignment.changes) {
    return emptyResult;
  }

  let changed = false;
  const nextChanges: Record<string, ITaskAssignmentChange> = {
    ...assignment.changes,
  };
  const removedAudioUris: string[] = [];
  const removedPictureRefs: Array<{ ref: string; uri?: string }> = [];

  for (const [date, change] of Object.entries(assignment.changes)) {
    const changeYearMonth = date.slice(0, 7);

    if (changeYearMonth > cutoffYearMonth) {
      continue;
    }

    const nextChange = { ...change };
    let changeUpdated = false;

    if (change.audioRecord?.startsWith('file://')) {
      removedAudioUris.push(change.audioRecord);
      delete nextChange.audioRecord;
      changeUpdated = true;
    }

    if (isLocalCustomTaskPicture(change.picture, taskUrls)) {
      const ref = change.picture;
      const uri =
        taskUrls[ref] ?? (ref.startsWith('file://') ? ref : undefined);

      removedPictureRefs.push({ ref, uri });
      delete nextChange.picture;
      changeUpdated = true;
    }

    if (!changeUpdated) {
      continue;
    }

    if (Object.keys(nextChange).length === 0) {
      delete nextChanges[date];
    } else {
      nextChanges[date] = nextChange;
    }

    changed = true;
  }

  if (!changed) {
    return emptyResult;
  }

  return {
    assignment: {
      ...assignment,
      changes:
        Object.keys(nextChanges).length > 0 ? nextChanges : undefined,
      updatedAt: new Date().toISOString(),
    },
    removedAudioUris,
    removedPictureRefs,
  };
}
