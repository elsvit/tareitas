import { ETaskRepeatType } from '~/types/ETask';
import { ISubtask, ITaskAssignment, ITaskAssignmentChange } from '~/types/ITask';

import { apiFetch, parseApiJson } from './client';

export type ServerTaskAssignment = {
  id: string;
  familyId: string;
  childId: string;
  title: string;
  description?: string;
  reward?: number;
  picture?: string;
  color?: string;
  startDate: string;
  endDate?: string;
  time: string;
  isHabit?: boolean;
  repeat?: {
    type: ETaskRepeatType;
    weekDays?: number[];
    count?: number;
  };
  newTaskBonus?: number;
  newTaskDuration?: number;
  subtasks?: ISubtask[];
  changes?: Record<string, ITaskAssignmentChange>;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

type CreateTaskAssignmentBody = {
  id?: string;
  childId: string;
  title: string;
  description?: string;
  reward?: number;
  picture?: string;
  color?: string;
  startDate: string;
  endDate?: string;
  time?: string;
  isHabit?: boolean;
  repeat?: ServerTaskAssignment['repeat'];
  newTaskBonus?: number;
  newTaskDuration?: number;
  subtasks?: ISubtask[];
  changes?: Record<string, ITaskAssignmentChange>;
};

type UpdateTaskAssignmentBody = Partial<CreateTaskAssignmentBody>;

export async function listTaskAssignments(
  token: string,
  familyId: string,
  childId?: string,
) {
  const query = childId ? `?childId=${childId}` : '';
  const response = await apiFetch(
    `/families/${familyId}/task-assignments${query}`,
    { token },
  );

  return parseApiJson<ServerTaskAssignment[]>(response);
}

export async function createTaskAssignment(
  token: string,
  familyId: string,
  body: CreateTaskAssignmentBody,
) {
  const response = await apiFetch(
    `/families/${familyId}/task-assignments`,
    {
      method: 'POST',
      token,
      body,
    },
  );

  return parseApiJson<ServerTaskAssignment>(response);
}

export async function updateTaskAssignment(
  token: string,
  familyId: string,
  assignmentId: string,
  body: UpdateTaskAssignmentBody,
) {
  const response = await apiFetch(
    `/families/${familyId}/task-assignments/${assignmentId}`,
    {
      method: 'PATCH',
      token,
      body,
    },
  );

  return parseApiJson<ServerTaskAssignment>(response);
}

export async function deleteTaskAssignment(
  token: string,
  familyId: string,
  assignmentId: string,
) {
  await apiFetch(
    `/families/${familyId}/task-assignments/${assignmentId}`,
    {
      method: 'DELETE',
      token,
    },
  );
}

export function mapServerTaskAssignmentToLocal(
  server: ServerTaskAssignment,
): ITaskAssignment {
  return {
    id: server.id,
    childId: server.childId,
    title: server.title,
    description: server.description,
    reward: server.reward,
    picture: server.picture,
    color: server.color,
    startDate: server.startDate.slice(0, 10),
    endDate: server.endDate?.slice(0, 10),
    time: server.time,
    isHabit: server.isHabit,
    repeat: server.repeat,
    newTaskBonus: server.newTaskBonus,
    newTaskDuration: server.newTaskDuration,
    subtasks: server.subtasks,
    changes: server.changes,
    createdBy: server.createdByUserId,
    createdAt: server.createdAt,
    updatedAt: server.updatedAt,
  };
}

export function toCreateTaskAssignmentBody(
  entity: ITaskAssignment,
): CreateTaskAssignmentBody {
  return {
    id: entity.id,
    childId: entity.childId,
    title: entity.title,
    description: entity.description,
    reward: entity.reward,
    picture: entity.picture,
    color: entity.color,
    startDate: entity.startDate,
    endDate: entity.endDate,
    time: entity.time,
    isHabit: entity.isHabit,
    repeat: entity.repeat,
    newTaskBonus: entity.newTaskBonus,
    newTaskDuration: entity.newTaskDuration,
    subtasks: entity.subtasks,
    changes: entity.changes,
  };
}

export function toUpdateTaskAssignmentBody(
  entity: ITaskAssignment,
): UpdateTaskAssignmentBody {
  const { id: _id, ...body } = toCreateTaskAssignmentBody(entity);

  return body;
}
