import { ISubtaskCompletionMedia, ITask } from '~/types/ITask';

export type SubtaskMediaField =
  | 'completedPhotos'
  | 'completedAudioRecords';

function countSubtaskMediaForDate(
  tasks: ITask[],
  date: string,
  field: SubtaskMediaField,
  exclude?: { taskId: string; subtaskId: string },
): number {
  return tasks.reduce((count, task) => {
    if (task.date !== date) {
      return count;
    }

    const items: ISubtaskCompletionMedia[] = task[field] ?? [];

    if (exclude && task.id === exclude.taskId) {
      return (
        count +
        items.filter(item => item.subtaskId !== exclude.subtaskId).length
      );
    }

    return count + items.length;
  }, 0);
}

export function canAddSubtaskMedia(params: {
  tasks: ITask[];
  date: string;
  taskId: string;
  subtaskId: string;
  hasExistingMedia: boolean;
  isPro: boolean;
  withoutSubscriptionLimit: number;
  maximumLimit: number;
  field: SubtaskMediaField;
}): {
  isAtMaximumLimit: boolean;
  isAtFreeLimit: boolean;
  isCaptureDisabled: boolean;
  showSubscriptionHelp: boolean;
} {
  const otherCount = countSubtaskMediaForDate(
    params.tasks,
    params.date,
    params.field,
    params.hasExistingMedia
      ? { taskId: params.taskId, subtaskId: params.subtaskId }
      : undefined,
  );
  const isAtMaximumLimit = otherCount >= params.maximumLimit;
  const isAtFreeLimit =
    !params.isPro &&
    !params.hasExistingMedia &&
    otherCount >= params.withoutSubscriptionLimit;
  const isCaptureDisabled = isAtMaximumLimit || isAtFreeLimit;
  const showSubscriptionHelp = isAtFreeLimit && !isAtMaximumLimit;

  return {
    isAtMaximumLimit,
    isAtFreeLimit,
    isCaptureDisabled,
    showSubscriptionHelp,
  };
}
