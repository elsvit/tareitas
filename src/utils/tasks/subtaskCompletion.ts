import {
  ISubtask,
  ISubtaskCompletionMedia,
  ITask,
} from '~/types/ITask';
import { createTaskId } from '~/utils/tasks/taskGeneration';

export function partitionSubtasks(subtasks: ISubtask[]) {
  const regular: ISubtask[] = [];
  const audio: ISubtask[] = [];
  const photo: ISubtask[] = [];

  for (const subtask of subtasks) {
    if (subtask.isAudio) {
      audio.push(subtask);
      continue;
    }

    if (subtask.isPhoto) {
      photo.push(subtask);
      continue;
    }

    regular.push(subtask);
  }

  return { regular, audio, photo };
}

export function getSubtaskAudioUrl(
  subtaskId: string,
  records?: ISubtaskCompletionMedia[],
): string | undefined {
  return records?.find(record => record.subtaskId === subtaskId)?.url;
}

export function getSubtaskPhotoUrl(
  subtaskId: string,
  photos?: ISubtaskCompletionMedia[],
): string | undefined {
  return photos?.find(photo => photo.subtaskId === subtaskId)?.url;
}

export function isSubtaskComplete(
  subtask: ISubtask,
  completedSubtasks: string[],
  completedAudioRecords?: ISubtaskCompletionMedia[],
  completedPhotos?: ISubtaskCompletionMedia[],
): boolean {
  if (subtask.isAudio) {
    return !!getSubtaskAudioUrl(subtask.value, completedAudioRecords);
  }

  if (subtask.isPhoto) {
    return !!getSubtaskPhotoUrl(subtask.value, completedPhotos);
  }

  return completedSubtasks.includes(subtask.value);
}

export function areAllSubtasksComplete(
  subtasks: ISubtask[],
  completedSubtasks: string[],
  completedAudioRecords?: ISubtaskCompletionMedia[],
  completedPhotos?: ISubtaskCompletionMedia[],
): boolean {
  if (subtasks.length === 0) {
    return true;
  }

  return subtasks.every(subtask =>
    isSubtaskComplete(
      subtask,
      completedSubtasks,
      completedAudioRecords,
      completedPhotos,
    ),
  );
}

export function upsertSubtaskCompletionMedia(
  records: ISubtaskCompletionMedia[] | undefined,
  subtaskId: string,
  url: string,
): ISubtaskCompletionMedia[] {
  const nextRecords = [...(records ?? [])];
  const existingIndex = nextRecords.findIndex(
    record => record.subtaskId === subtaskId,
  );

  if (existingIndex >= 0) {
    nextRecords[existingIndex] = { subtaskId, url };
    return nextRecords;
  }

  nextRecords.push({ subtaskId, url });

  return nextRecords;
}

export function removeSubtaskCompletionMedia(
  records: ISubtaskCompletionMedia[] | undefined,
  subtaskId: string,
): ISubtaskCompletionMedia[] {
  return (records ?? []).filter(record => record.subtaskId !== subtaskId);
}

export function withSubtaskMarkedComplete(
  subtaskValue: string,
  completedSubtasks: string[],
): string[] {
  return [...new Set([...completedSubtasks, subtaskValue])];
}

export function withSubtaskMarkedIncomplete(
  subtaskValue: string,
  completedSubtasks: string[],
): string[] {
  return completedSubtasks.filter(value => value !== subtaskValue);
}

export function buildTaskCompletionUpdate(
  task: ITask | null | undefined,
  assignmentId: string,
  date: string,
  next: {
    status: ITask['status'];
    completedSubtasks: string[];
    completedAudioRecords?: ISubtaskCompletionMedia[];
    completedPhotos?: ISubtaskCompletionMedia[];
  },
): ITask {
  return {
    id: task?.id ?? createTaskId(assignmentId, date),
    assignmentId,
    date,
    status: next.status,
    completedSubtasks: next.completedSubtasks,
    completedAudioRecords: next.completedAudioRecords ?? [],
    completedPhotos: next.completedPhotos ?? [],
    createdAt: task?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
