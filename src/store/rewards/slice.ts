import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import { EStateName } from '~/store/enums';
import {
  createEntityReducers,
  createGenericEntityAdapter,
} from '~/store/helpers';
import { noopEntityRequestReducer } from '~/store/helpers/sagaEntitySync';
import { IEarnedRewardPeriod, IReward } from '~/types/IReward';

import {
  upsertChildEarnedPeriod,
  normalizeEarnedRewardPeriods,
} from './earnedRewardPeriodUtils';
import {
  ApprovePeriodPayload,
  IStateRewards,
  SetRemainingRewardFromPreviousMonthsPayload,
} from './types';

const ensureEarnedRewardPeriods = (state: IStateRewards) => {
  state.earnedRewardPeriods = normalizeEarnedRewardPeriods(
    state.earnedRewardPeriods,
  );
};

export const rewardsAdapter = createGenericEntityAdapter<IReward>();

const initialState: IStateRewards = {
  ...rewardsAdapter.getInitialState(),
  earnedRewardPeriods: [],
};

const entityReducers = createEntityReducers(rewardsAdapter);

export const rewardsSlice = createSlice({
  name: EStateName.rewards,
  initialState,
  reducers: {
    addReward: noopEntityRequestReducer,
    addRewardSuccess: (state, action: PayloadAction<IReward>) => {
      entityReducers.addEntity(state, {
        ...action,
        payload: { entity: action.payload },
      });
    },
    updateReward: noopEntityRequestReducer,
    updateRewardSuccess: (state, action: PayloadAction<IReward>) => {
      entityReducers.upsertEntity(
        state,
        action as unknown as PayloadAction<IReward>,
      );
    },
    removeReward: noopEntityRequestReducer,
    removeRewardSuccess: (state, action: PayloadAction<string>) => {
      entityReducers.removeEntity(
        state,
        action as unknown as PayloadAction<string>,
      );
    },
    clearRewards: state => {
      entityReducers.clearEntities(state);
    },
    setRemainingRewardFromPreviousMonths: (
      state,
      action: PayloadAction<SetRemainingRewardFromPreviousMonthsPayload>,
    ) => {
      ensureEarnedRewardPeriods(state);
      const { childId, yearMonth, amount } = action.payload;

      upsertChildEarnedPeriod(state.earnedRewardPeriods, childId, yearMonth, {
        remainingRewardFromPreviousMonths: amount,
      });
    },
    approvePeriod: (state, action: PayloadAction<ApprovePeriodPayload>) => {
      ensureEarnedRewardPeriods(state);
      const { childId, updates } = action.payload;

      updates.forEach(
        ({ yearMonth, remainingRewardFromPreviousMonths, monthReward }) => {
          upsertChildEarnedPeriod(state.earnedRewardPeriods, childId, yearMonth, {
            remainingRewardFromPreviousMonths,
            monthReward,
            isPeriodApproved: true,
          });
        },
      );
    },
    syncEarnedRewardPeriods: (
      state,
      action: PayloadAction<IEarnedRewardPeriod[]>,
    ) => {
      state.earnedRewardPeriods = normalizeEarnedRewardPeriods(action.payload);
    },
    replaceRewardInstancesFromServer: (
      state,
      action: PayloadAction<IReward[]>,
    ) => {
      rewardsAdapter.setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder.addCase(REHYDRATE, (state, action) => {
      const payload = (action as { payload?: IStateRewards }).payload;

      if (payload?.earnedRewardPeriods) {
        state.earnedRewardPeriods = normalizeEarnedRewardPeriods(
          payload.earnedRewardPeriods,
        );
      }
    });
  },
});

export const {
  addReward,
  addRewardSuccess,
  updateReward,
  updateRewardSuccess,
  removeReward,
  removeRewardSuccess,
  clearRewards,
  setRemainingRewardFromPreviousMonths,
  approvePeriod,
  syncEarnedRewardPeriods,
  replaceRewardInstancesFromServer,
} = rewardsSlice.actions;
