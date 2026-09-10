import { createTaskId } from '~/utils/tasks/taskGeneration';
import { ETaskStatus } from '~/types/ETask';
import { ISubtaskCompletionMedia, ITask } from '~/types/ITask';

import { apiFetch, parseApiJson } from './client';

export type ServerTask = {
  id: string;
  familyId: string;
  assignmentId: string;
  date: string;
  status: ETaskStatus;
  completedSubtasks?: string[];
  completedAudioRecords?: ISubtaskCompletionMedia[];
  completedPhotos?: ISubtaskCompletionMedia[];
  createdAt: string;
  updatedAt: string;
};

type CreateTaskBody = {
  id?: string;
  assignmentId: string;
  date: string;
  status?: ETaskStatus;
  completedSubtasks?: string[];
  completedAudioRecords?: ISubtaskCompletionMedia[];
  completedPhotos?: ISubtaskCompletionMedia[];
};

type UpdateTaskBody = {
  status?: ETaskStatus;
  completedSubtasks?: string[];
  completedAudioRecords?: ISubtaskCompletionMedia[];
  completedPhotos?: ISubtaskCompletionMedia[];
};

type ListTasksQuery = {
  assignmentId?: string;
  childId?: string;
  from?: string;
  to?: string;
  status?: ETaskStatus;
};

export async function listTaskInstances(
  token: string,
  familyId: string,
  query: ListTasksQuery = {},
) {
  const params = new URLSearchParams();

  if (query.assignmentId) {
    params.set('assignmentId', query.assignmentId);
  }

  if (query.childId) {
    params.set('childId', query.childId);
  }

  if (query.from) {
    params.set('from', query.from);
  }

  if (query.to) {
    params.set('to', query.to);
  }

  if (query.status) {
    params.set('status', query.status);
  }

  const queryString = params.toString();
  const response = await apiFetch(
    `/families/${familyId}/tasks${queryString ? `?${queryString}` : ''}`,
    { token },
  );

  return parseApiJson<ServerTask[]>(response);
}

export async function getTaskInstance(
  token: string,
  familyId: string,
  taskId: string,
) {
  const response = await apiFetch(
    `/families/${familyId}/tasks/${taskId}`,
    { token },
  );

  return parseApiJson<ServerTask>(response);
}

export async function createTaskInstance(
  token: string,
  familyId: string,
  body: CreateTaskBody,
) {
  const response = await apiFetch(
    `/families/${familyId}/tasks`,
    {
      method: 'POST',
      token,
      body,
    },
  );

  return parseApiJson<ServerTask>(response);
}

export async function updateTaskInstance(
  token: string,
  familyId: string,
  taskId: string,
  body: UpdateTaskBody,
) {
  const response = await apiFetch(
    `/families/${familyId}/tasks/${taskId}`,
    {
      method: 'PATCH',
      token,
      body,
    },
  );

  return parseApiJson<ServerTask>(response);
}

export async function approveTaskInstance(
  token: string,
  familyId: string,
  taskId: string,
) {
  const response = await apiFetch(
    `/families/${familyId}/tasks/${taskId}/approve`,
    {
      method: 'POST',
      token,
    },
  );

  return parseApiJson<ServerTask>(response);
}

export async function rejectTaskInstance(
  token: string,
  familyId: string,
  taskId: string,
) {
  const response = await apiFetch(
    `/families/${familyId}/tasks/${taskId}/reject`,
    {
      method: 'POST',
      token,
    },
  );

  return parseApiJson<ServerTask>(response);
}

export async function unapproveTaskInstance(
  token: string,
  familyId: string,
  taskId: string,
) {
  const response = await apiFetch(
    `/families/${familyId}/tasks/${taskId}/unapprove`,
    {
      method: 'POST',
      token,
    },
  );

  return parseApiJson<ServerTask>(response);
}

export function mergeTaskFromServerWithLocal(
  serverTask: ITask,
  requestedTask: ITask,
): ITask {
  return {
    ...serverTask,
    completedSubtasks:
      requestedTask.completedSubtasks !== undefined
        ? requestedTask.completedSubtasks
        : serverTask.completedSubtasks,
    completedAudioRecords:
      requestedTask.completedAudioRecords !== undefined
        ? requestedTask.completedAudioRecords
        : serverTask.completedAudioRecords,
    completedPhotos:
      requestedTask.completedPhotos !== undefined
        ? requestedTask.completedPhotos
        : serverTask.completedPhotos,
  };
}

export function mapServerTaskToLocal(server: ServerTask): ITask {
  const date = server.date.slice(0, 10);

  return {
    id: createTaskId(server.assignmentId, date),
    assignmentId: server.assignmentId,
    date,
    status: server.status,
    completedSubtasks: server.completedSubtasks,
    completedAudioRecords: server.completedAudioRecords,
    completedPhotos: server.completedPhotos,
    createdAt: server.createdAt,
    updatedAt: server.updatedAt,
  };
}

export function toCreateTaskBody(entity: ITask): CreateTaskBody {
  return {
    id: entity.id,
    assignmentId: entity.assignmentId,
    date: entity.date,
    status: entity.status,
    completedSubtasks: entity.completedSubtasks,
    completedAudioRecords: entity.completedAudioRecords,
    completedPhotos: entity.completedPhotos,
  };
}

export function toUpdateTaskBody(entity: ITask): UpdateTaskBody {
  return {
    status: entity.status,
    completedSubtasks: entity.completedSubtasks,
    completedAudioRecords: entity.completedAudioRecords,
    completedPhotos: entity.completedPhotos,
  };
}
