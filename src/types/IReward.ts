import { ERewardStatus } from './EReward';
export interface IRewardBase extends Partial<CreatedProps> {
  id: string;
  title: string;
  reward: number;
  picture?: string;
}

export type RewardBaseFormProps = OmitCreatedKeys<IRewardBase>;

export interface IRewardAssignment extends Partial<CreatedProps> {
  id: string;
  title: string;
  reward: number;
  picture?: string;
  childIds?: string[]; // undefined/empty = all children
}

export type RewardAssignmentFormProps = OmitCreatedKeys<IRewardAssignment>;

export interface IReward extends Partial<CreatedProps> {
  id: string;
  rewardAssignmentId: string;
  childId: string;
  status?: ERewardStatus;
  completedDate?: string; // YYYY-MM-DD for completed rewards
}

export interface IEarnedRewardPeriodChildBalance {
  remainingRewardFromPreviousMonths: number | null;
  monthReward: number;
  /** Set when parent/admin explicitly approves the period in Rewards history. */
  isPeriodApproved?: boolean;
}

export interface IEarnedRewardPeriod {
  yearMonth: string; // YYYY-MM
  [childId: string]: IEarnedRewardPeriodChildBalance | string;
}

export type IEarnedRewardPeriodEntry = IEarnedRewardPeriodChildBalance & {
  yearMonth: string;
  childId: string;
};

export type IEarnedRewardPeriods = IEarnedRewardPeriod[];
