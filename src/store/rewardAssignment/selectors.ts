import { createSelector } from '@reduxjs/toolkit';

import { IRewardAssignment } from '~/types/IReward';

import type { IState } from '../types';
import { rewardAssignmentAdapter } from './slice';

export const {
  selectAll: selectAllRewardAssignment,
  selectById,
  selectIds: selectRewardAssignmentIds,
  selectEntities: selectRewardAssignmentEntities,
  selectTotal: selectTotalRewardAssignment,
} = rewardAssignmentAdapter.getSelectors(
  (state: IState) => state.rewardAssignment,
);

export const selectRewardAssignmentById = (id: string) => (state: IState) =>
  selectById(state, id);

export const isRewardAssignedToChild = (
  assignment: { childIds?: string[] } | undefined,
  childId: string,
) => {
  if (!assignment) {
    return false;
  }

  if (!assignment.childIds || assignment.childIds.length === 0) {
    return true;
  }

  return assignment.childIds.includes(childId);
};

export const selectRewardAssignmentsForChild = (childId: string) => (state: IState) =>
  selectAllRewardAssignment(state).filter(assignment =>
    isRewardAssignedToChild(assignment, childId),
  );

export const selectPreviousRewardTemplates = createSelector(
  [selectAllRewardAssignment],
  assignments =>
    [...assignments].sort((left, right) =>
      (right.createdAt ?? '').localeCompare(left.createdAt ?? ''),
    ),
);
