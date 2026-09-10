import { ITaskAssignment, ITaskAssignmentChange } from '~/types/ITask';

export function buildAssignmentChangesUpdate(
  previous: ITaskAssignment['changes'] | undefined,
  merged: ITaskAssignment['changes'] | undefined,
): Record<string, ITaskAssignmentChange> | undefined {
  const previousJson = JSON.stringify(previous ?? null);
  const mergedJson = JSON.stringify(merged ?? null);

  if (previousJson === mergedJson) {
    return undefined;
  }

  return merged ?? {};
}

export function mergeAudioRecordIntoAssignmentChanges(
  assignment: Partial<ITaskAssignment> | undefined,
  date: string,
  audioRecord?: string | null,
): ITaskAssignment['changes'] {
  const nextChanges = {
    ...(assignment?.changes ?? {}),
  };
  const existingChange = nextChanges[date] ?? {};

  if (!audioRecord) {
    if (!existingChange.audioRecord) {
      return Object.keys(nextChanges).length > 0
        ? nextChanges
        : undefined;
    }

    const { audioRecord: _removed, ...rest } = existingChange;

    if (Object.keys(rest).length === 0) {
      delete nextChanges[date];
    } else {
      nextChanges[date] = rest;
    }

    return Object.keys(nextChanges).length > 0
      ? nextChanges
      : undefined;
  }

  nextChanges[date] = {
    ...existingChange,
    audioRecord,
  };

  return nextChanges;
}

export function getAudioRecordForAssignmentDate(
  assignment: Partial<ITaskAssignment> | undefined,
  date: string,
): string | undefined {
  return assignment?.changes?.[date]?.audioRecord;
}
