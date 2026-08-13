import { EntityState } from '@reduxjs/toolkit';

import { IRewardAssignment } from '~/types/IReward';

export interface IStateRewardAssignment
  extends EntityState<IRewardAssignment, string> {}

export type AddRewardAssignmentPayload = {
  entity: IRewardAssignment;
  onSuccess?: () => void;
};

export type UpdateRewardAssignmentPayload = AddRewardAssignmentPayload;

export type RemoveRewardAssignmentPayload = {
  entity: string;
  onSuccess?: () => void;
};
