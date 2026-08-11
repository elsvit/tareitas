import { EntityState } from '@reduxjs/toolkit';
import { ITaskBase } from '~/types/ITask';

export interface IStateTaskBase extends EntityState<ITaskBase, string> {}

export type AddTaskBasePayload = {
  entity: ITaskBase;
};

export type UpdateTaskBasePayload = AddTaskBasePayload;

export type RemoveTaskBasePayload = {
  id: string;
};
