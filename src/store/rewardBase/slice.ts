import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getBaseRewards } from '~/constants/rewards';
import { EStateName } from '~/store/enums';
import {
  createEntityReducers,
  createGenericEntityAdapter,
} from '~/store/helpers';
import { noopEntityRequestReducer } from '~/store/helpers/sagaEntitySync';
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
    addRewardBase: noopEntityRequestReducer,
    addRewardBaseSuccess: (state, action: PayloadAction<IRewardBase>) => {
      entityReducers.addEntity(state, {
        ...action,
        payload: { entity: action.payload },
      } as unknown as PayloadAction<{ entity: IRewardBase; isUpsert?: boolean }>);
    },
    updateRewardBase: noopEntityRequestReducer,
    updateRewardBaseSuccess: (state, action: PayloadAction<IRewardBase>) => {
      entityReducers.upsertEntity(state, action as unknown as PayloadAction<IRewardBase>);
    },
    removeRewardBase: noopEntityRequestReducer,
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
          entityReducers.addEntity(
            state,
            {
              payload: { entity: defaultReward, isUpsert: false },
            } as PayloadAction<{ entity: IRewardBase; isUpsert?: boolean }>,
          );
          return;
        }

        existing.title = defaultReward.title;
      });
    },
    replaceRewardBaseCatalog: (
      state,
      action: PayloadAction<IRewardBase[]>,
    ) => {
      rewardBaseAdapter.setAll(state, action.payload);
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
  replaceRewardBaseCatalog,
} = rewardBaseSlice.actions;
