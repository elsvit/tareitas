import { createSelector } from '@reduxjs/toolkit';

import type { IState } from '../types';
import { selectAllChildren, selectChildById } from '~/store/children/selectors';
import { ERewardStatus } from '~/types/EReward';
import { IReward, IRewardAssignment } from '~/types/IReward';

import {
  isRewardAssignedToChild,
  selectAllRewardAssignment,
  selectRewardAssignmentById,
} from '../rewardAssignment/selectors';
import {
  findActiveRewardInstance,
  findApprovableMonthPeriod,
  findEarnedPeriod,
  formatYearMonth,
  getChildCurrentRewardBalance,
  getLastApprovedMonth,
  isPeriodClosed,
  normalizeEarnedRewardPeriods,
} from './rewardCalculations';
import { rewardsAdapter } from './slice';

export const getRewardsState = (state: IState) => state.rewards;

export const {
  selectAll: selectAllRewards,
  selectById: selectRewardById,
  selectIds: selectRewardIds,
  selectEntities: selectRewardEntities,
  selectTotal: selectTotalRewards,
} = rewardsAdapter.getSelectors((state: IState) => state.rewards);

const selectRawEarnedRewardPeriods = (state: IState) =>
  state.rewards.earnedRewardPeriods;

export const selectEarnedRewardPeriods = createSelector(
  [selectRawEarnedRewardPeriods],
  periods => {
    if (Array.isArray(periods)) {
      return periods;
    }

    return normalizeEarnedRewardPeriods(periods);
  },
);

export type RewardListItemView = {
  id: string;
  assignmentId: string;
  assignment: IRewardAssignment;
  instance: IReward | null;
  childId: string;
  title: string;
  picture?: string;
  reward: number;
  status?: ERewardStatus;
  completedDate?: string;
  currentBalance: number;
  canAfford: boolean;
};

export const buildRewardListItemView = (
  assignment: IRewardAssignment,
  childId: string,
  instance: IReward | null,
  currentBalance: number,
): RewardListItemView => ({
  id: instance?.id ?? `${assignment.id}_${childId}`,
  assignmentId: assignment.id,
  assignment,
  instance,
  childId,
  title: assignment.title,
  picture: assignment.picture,
  reward: assignment.reward,
  status: instance?.status,
  completedDate: instance?.completedDate,
  currentBalance,
  canAfford: currentBalance >= assignment.reward,
});

const selectBalanceCalculationState = createSelector(
  [
    (state: IState) => state.rewards.earnedRewardPeriods,
    (state: IState) => state.rewards.entities,
    (state: IState) => state.tasks.entities,
    (state: IState) => state.taskAssignment.entities,
    (state: IState) => state.taskBase.entities,
    (state: IState) => state,
  ],
  (
    _earnedRewardPeriods,
    _rewardEntities,
    _taskEntities,
    _taskAssignmentEntities,
    _taskBaseEntities,
    state,
  ) => state,
);

export const selectChildRewardBalance = (childId: string) =>
  createSelector([selectBalanceCalculationState], state =>
    getChildCurrentRewardBalance(state, childId),
  );

export const selectRewardListItemsForChild = (childId: string) =>
  createSelector(
    [
      selectAllRewardAssignment,
      selectAllRewards,
      (state: IState) => state.rewards.entities,
      selectChildRewardBalance(childId),
    ],
    (assignments, rewards, _rewardEntities, balance) =>
      assignments
        .filter(assignment => isRewardAssignedToChild(assignment, childId))
        .map(assignment =>
          buildRewardListItemView(
            assignment,
            childId,
            findActiveRewardInstance(rewards, assignment.id, childId) ?? null,
            balance,
          ),
        ),
  );

export const selectRewardsByStatus = (status: ERewardStatus) =>
  createSelector([selectAllRewards, selectAllRewardAssignment], (rewards, assignments) =>
    rewards
      .filter(reward => reward.status === status && !reward.completedDate)
      .map(reward => {
        const assignment = assignments.find(
          item => item.id === reward.rewardAssignmentId,
        );

        return {
          reward,
          assignment,
        };
      })
      .filter(item => item.assignment),
  );

export const selectSelectedRewardsByChildSections = createSelector(
  [
    selectRewardsByStatus(ERewardStatus.Selected),
    selectAllChildren,
    selectBalanceCalculationState,
  ],
  (items, children, state) =>
    children
      .map(child => ({
        childId: child.id,
        title: child.name,
        currentReward: getChildCurrentRewardBalance(state, child.id),
        data: items
          .filter(item => item.reward.childId === child.id)
          .map(item => ({
            reward: item.reward,
            assignment: item.assignment!,
          })),
      }))
      .filter(section => section.data.length > 0),
);

export const selectApprovedRewardsByChildSections = createSelector(
  [
    selectRewardsByStatus(ERewardStatus.Approved),
    selectAllChildren,
    selectBalanceCalculationState,
  ],
  (items, children, state) =>
    children
      .map(child => ({
        childId: child.id,
        title: child.name,
        currentReward: getChildCurrentRewardBalance(state, child.id),
        data: items
          .filter(item => item.reward.childId === child.id)
          .map(item => ({
            reward: item.reward,
            assignment: item.assignment!,
          })),
      }))
      .filter(section => section.data.length > 0),
);

export type HistoryPeriodItem = {
  childId: string;
  childName: string;
  yearMonth: string;
  remainingRewardFromPreviousMonths: number | null;
  monthReward: number;
  isPeriodClosed: boolean;
  canApprovePeriod: boolean;
};

export const selectUnapprovedHistorySections = createSelector(
  [selectEarnedRewardPeriods, selectAllChildren, selectBalanceCalculationState],
  (earnedRewardPeriods, children, state) => {
    const yearMonths = [
      ...new Set(earnedRewardPeriods.map(period => period.yearMonth)),
    ].sort().reverse();

    return yearMonths
      .map(yearMonth => ({
        yearMonth,
        title: yearMonth,
        data: children
          .map(child => {
            const period = findEarnedPeriod(
              earnedRewardPeriods,
              child.id,
              yearMonth,
            );

            if (!period) {
              return null;
            }

            const approvableMonth = findApprovableMonthPeriod(
              state,
              child.id,
              earnedRewardPeriods,
            );

            return {
              childId: child.id,
              childName: child.name,
              yearMonth,
              remainingRewardFromPreviousMonths:
                period.remainingRewardFromPreviousMonths,
              monthReward: period.monthReward,
              isPeriodClosed: isPeriodClosed(period),
              canApprovePeriod: approvableMonth === yearMonth,
            };
          })
          .filter((item): item is HistoryPeriodItem => item != null),
      }))
      .filter(section => section.data.length > 0);
  },
);

export const selectRewardListItemViewByInstanceId = (rewardId: string) =>
  createSelector(
    [
      (state: IState) => selectRewardById(state, rewardId),
      (state: IState) => {
        const reward = selectRewardById(state, rewardId);

        return reward
          ? selectRewardAssignmentById(reward.rewardAssignmentId)(state)
          : undefined;
      },
      (state: IState) => {
        const reward = selectRewardById(state, rewardId);

        return reward ? selectChildById(state, reward.childId) : undefined;
      },
      (state: IState) => {
        const reward = selectRewardById(state, rewardId);

        return reward
          ? getChildCurrentRewardBalance(state, reward.childId)
          : 0;
      },
    ],
    (instance, assignment, _child, balance) => {
      if (!instance || !assignment) {
        return null;
      }

      return buildRewardListItemView(
        assignment,
        instance.childId,
        instance,
        balance,
      );
    },
  );

export const selectLastApprovedMonthForChild = (childId: string) =>
  createSelector([selectEarnedRewardPeriods], earnedRewardPeriods =>
    getLastApprovedMonth(earnedRewardPeriods, childId),
  );
