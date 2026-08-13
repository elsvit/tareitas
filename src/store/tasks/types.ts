import { EntityState } from '@reduxjs/toolkit';
import { ETaskStatus } from '~/types/ETask';
import { ITask } from '~/types/ITask';

export interface ITaskFilters {
  status?: ETaskStatus[];
  startDate: string;
  endDate: string;
  childId?: string;
  isHabit?: boolean;
}

export interface IStateTasks extends EntityState<ITask, string> {}

export type AddTasksPayload = {
  entity: ITask;
  onSuccess?: () => void;
};

export type UpdateTasksPayload = AddTasksPayload;

export type RemoveTasksPayload = {
  entity: string;
  onSuccess?: () => void;
};
