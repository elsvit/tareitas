import { ITaskAssignment } from '~/types/ITask';

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
