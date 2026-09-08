import { createSelector } from '@reduxjs/toolkit';

import { RootStateT } from '~/store';
import { ensureEntityState } from '~/store/helpers';
import { dedupeChildren } from '~/store/rewardAssignment/childIds';

import { childrenAdapter } from './slice';

export const getChildrenState = (state: RootStateT) =>
  ensureEntityState(state.children);

export const {
  selectAll: selectAllChildren,
  selectById: selectChildById,
  selectIds: selectChildIds,
  selectEntities: selectChildEntities,
  selectTotal: selectTotalChildren,
} = childrenAdapter.getSelectors(getChildrenState);

export const selectDedupedChildren = createSelector(
  [selectAllChildren],
  children => dedupeChildren(children),
);

export const selectDedupedChildIds = createSelector(
  [selectDedupedChildren],
  children => children.map(child => child.id),
);
