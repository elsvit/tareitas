import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import { EStateName } from '~/store/enums';
import {
  createEntityReducers,
  createGenericEntityAdapter,
} from '~/store/helpers';
import { IEarnedRewardPeriod, IReward } from '~/types/IReward';

import {
  upsertChildEarnedPeriod,
  normalizeEarnedRewardPeriods,
} from './earnedRewardPeriodUtils';
import {
  AddRewardPayload,
  ApprovePeriodPayload,
  IStateRewards,
  RemoveRewardPayload,
  SetRemainingRewardFromPreviousMonthsPayload,
  UpdateRewardPayload,
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
    addReward: (state, action: PayloadAction<AddRewardPayload>) => {
      entityReducers.addEntity(state, action);
    },
    addRewardSuccess: (state, action: PayloadAction<IReward>) => {
      entityReducers.addEntity(state, {
        ...action,
        payload: { entity: action.payload },
      });
    },
    updateReward: (state, action: PayloadAction<UpdateRewardPayload>) => {
      entityReducers.upsertEntity(state, {
        ...action,
        payload: action.payload.entity,
      });
    },
    updateRewardSuccess: (state, action: PayloadAction<IReward>) => {
      entityReducers.upsertEntity(
        state,
        action as unknown as PayloadAction<IReward>,
      );
    },
    removeReward: (state, action: PayloadAction<RemoveRewardPayload>) => {
      entityReducers.removeEntity(state, {
        ...action,
        payload: action.payload.entity,
      });
    },
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
} = rewardsSlice.actions;
