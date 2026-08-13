import { RootStateT } from '~/store';

import { rewardBaseAdapter } from './slice';

export const getRewardBaseState = (state: RootStateT) => state.rewardBase;

export const {
  selectAll: selectAllRewardBase,
  selectById,
  selectIds: selectRewardBaseIds,
  selectEntities: selectRewardBaseEntities,
  selectTotal: selectTotalRewardBase,
} = rewardBaseAdapter.getSelectors((state: RootStateT) => state.rewardBase);

export const selectRewardBaseById = (id: string) => (state: RootStateT) =>
  selectById(state, id);
