import { RootStateT } from '~/store';
import { ensureEntityState } from '~/store/helpers';
import { parentsAdapter } from './slice';

// Base selectors
export const getParentsState = (state: RootStateT) =>
  ensureEntityState(state.parents);

// Adapter selectors
export const {
  selectAll: selectAllParents,
  selectById: selectParentById,
  selectIds: selectParentIds,
  selectEntities: selectParentEntities,
  selectTotal: selectTotalParents,
} = parentsAdapter.getSelectors(getParentsState);
