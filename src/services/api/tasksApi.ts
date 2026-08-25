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

export function mapServerTaskToLocal(server: ServerTask): ITask {
  return {
    id: server.id,
    assignmentId: server.assignmentId,
    date: server.date,
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
