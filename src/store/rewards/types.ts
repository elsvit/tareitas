import { EntityState } from '@reduxjs/toolkit';

import { IEarnedRewardPeriods, IReward } from '~/types/IReward';

export interface IStateRewards extends EntityState<IReward, string> {
  earnedRewardPeriods: IEarnedRewardPeriods;
}

export type AddRewardPayload = {
  entity: IReward;
  onSuccess?: () => void;
};

export type UpdateRewardPayload = AddRewardPayload;

export type RemoveRewardPayload = {
  entity: string;
  onSuccess?: () => void;
};

export type SetRemainingRewardFromPreviousMonthsPayload = {
  childId: string;
  yearMonth: string;
  amount: number;
};

export type ApprovePeriodPayload = {
  childId: string;
  updates: Array<{
    yearMonth: string;
    remainingRewardFromPreviousMonths: number;
    monthReward: number;
  }>;
};
