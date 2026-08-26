import { createSelector } from '@reduxjs/toolkit';

import { selectDedupedChildIds } from '~/store/children/selectors';
import { IRewardAssignment } from '~/types/IReward';

import type { IState } from '../types';
import { isRewardAssignedToChild } from './childIds';
import { rewardAssignmentAdapter } from './slice';

export {
  dedupeChildren,
  filterValidChildIds,
  isAllChildrenRewardAssignment,
  isRewardAssignedToChild,
  mapServerChildUserIdsToChildIds,
  normalizeRewardChildIdsForSave,
  remapChildIds,
  resolveSavedRewardChildIds,
  rewardChildIdsForForm,
} from './childIds';

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

export const selectRewardAssignmentsForChild = (childId: string) =>
  createSelector(
    [selectAllRewardAssignment, selectDedupedChildIds],
    (assignments, validChildIds) =>
      assignments.filter(assignment =>
        isRewardAssignedToChild(assignment, childId, validChildIds),
      ),
  );

export const selectPreviousRewardTemplates = createSelector(
  [selectAllRewardAssignment],
  assignments =>
    [...assignments].sort((left, right) =>
      (right.createdAt ?? '').localeCompare(left.createdAt ?? ''),
    ),
);
