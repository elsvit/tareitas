import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getBaseRewards } from '~/constants/rewards';
import { EStateName } from '~/store/enums';
import {
  createEntityReducers,
  createGenericEntityAdapter,
} from '~/store/helpers';
import { IRewardBase } from '~/types/IReward';

import {
  AddRewardBasePayload,
  IStateRewardBase,
  RemoveRewardBasePayload,
  UpdateRewardBasePayload,
} from './types';

export const rewardBaseAdapter = createGenericEntityAdapter<IRewardBase>();

export const getRewardBaseInitialState = (): IStateRewardBase =>
  rewardBaseAdapter.setAll(rewardBaseAdapter.getInitialState(), getBaseRewards());

const initialState: IStateRewardBase = getRewardBaseInitialState();

const entityReducers = createEntityReducers(rewardBaseAdapter);

export const rewardBaseSlice = createSlice({
  name: EStateName.rewardBase,
  initialState,
  reducers: {
    addRewardBase: (state, action: PayloadAction<AddRewardBasePayload>) => {
      entityReducers.addEntity(
        state,
        action as unknown as PayloadAction<{ entity: IRewardBase; isUpsert?: boolean }>,
      );
    },
    addRewardBaseSuccess: (state, action: PayloadAction<IRewardBase>) => {
      entityReducers.addEntity(state, {
        ...action,
        payload: { entity: action.payload },
      } as unknown as PayloadAction<{ entity: IRewardBase; isUpsert?: boolean }>);
    },
    updateRewardBase: (state, action: PayloadAction<UpdateRewardBasePayload>) => {
      entityReducers.upsertEntity(
        state,
        { ...action, payload: action.payload.entity } as unknown as PayloadAction<IRewardBase>,
      );
    },
    updateRewardBaseSuccess: (state, action: PayloadAction<IRewardBase>) => {
      entityReducers.upsertEntity(state, action as unknown as PayloadAction<IRewardBase>);
    },
    removeRewardBase: (state, action: PayloadAction<RemoveRewardBasePayload>) => {
      entityReducers.removeEntity(
        state,
        { ...action, payload: action.payload.id } as unknown as PayloadAction<string>,
      );
    },
    removeRewardBaseSuccess: (state, action: PayloadAction<string>) => {
      entityReducers.removeEntity(state, action as unknown as PayloadAction<string>);
    },
    clearRewardBase: state => {
      entityReducers.clearEntities(state);
    },
    resetRewardBase: state => {
      entityReducers.resetEntities(
        state,
        { payload: getBaseRewards() } as PayloadAction<IRewardBase[]>,
      );
    },
    syncRewardBaseTranslations: state => {
      getBaseRewards().forEach(defaultReward => {
        const existing = state.entities[defaultReward.id];

        if (!existing) {
          return;
        }

        existing.title = defaultReward.title;
      });
    },
  },
});

export const {
  addRewardBase,
  addRewardBaseSuccess,
  updateRewardBase,
  updateRewardBaseSuccess,
  removeRewardBase,
  removeRewardBaseSuccess,
  clearRewardBase,
  resetRewardBase,
  syncRewardBaseTranslations,
} = rewardBaseSlice.actions;
