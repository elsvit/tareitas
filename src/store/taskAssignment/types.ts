import { EntityState } from '@reduxjs/toolkit';
import { ITaskAssignment } from '~/types/ITask';

export interface IStateTaskAssignment
  extends EntityState<ITaskAssignment, string> {}

export type AddTaskAssignmentPayload = {
  entity: ITaskAssignment;
  onSuccess?: () => void;
};

export type AddTaskAssignmentsBatchPayload = {
  entities: ITaskAssignment[];
  onSuccess?: () => void;
};

export type UpdateTaskAssignmentPayload = AddTaskAssignmentPayload;

export type RemoveTaskAssignmentPayload = {
  entity: string;
  onSuccess?: () => void;
};
