import { EntityState } from '@reduxjs/toolkit';

import { IRewardBase } from '~/types/IReward';

export interface IStateRewardBase extends EntityState<IRewardBase, string> {}

export type AddRewardBasePayload = {
  entity: IRewardBase;
};

export type UpdateRewardBasePayload = AddRewardBasePayload;

export type RemoveRewardBasePayload = {
  id: string;
};
