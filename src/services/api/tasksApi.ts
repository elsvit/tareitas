import { createTaskId } from '~/utils/tasks/taskGeneration';
import { ETaskStatus } from '~/types/ETask';
import { ITask } from '~/types/ITask';

import { apiFetch, parseApiJson } from './client';

export type ServerTask = {
  id: string;
  familyId: string;
  assignmentId: string;
  date: string;
  status: ETaskStatus;
  completedSubtasks?: string[];
  createdAt: string;
  updatedAt: string;
};

type CreateTaskBody = {
  id?: string;
  assignmentId: string;
  date: string;
  status?: ETaskStatus;
  completedSubtasks?: string[];
};

type UpdateTaskBody = {
  status?: ETaskStatus;
  completedSubtasks?: string[];
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

export function mapServerTaskToLocal(server: ServerTask): ITask {
  const date = server.date.slice(0, 10);

  return {
    id: createTaskId(server.assignmentId, date),
    assignmentId: server.assignmentId,
    date,
    status: server.status,
    completedSubtasks: server.completedSubtasks,
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
  };
}

export function toUpdateTaskBody(entity: ITask): UpdateTaskBody {
  return {
    status: entity.status,
    completedSubtasks: entity.completedSubtasks,
  };
}
