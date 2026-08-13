import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { EStateName } from '~/store/enums';
import {
  createEntityReducers,
  createGenericEntityAdapter,
} from '~/store/helpers';
import { IRewardAssignment } from '~/types/IReward';

import {
  AddRewardAssignmentPayload,
  IStateRewardAssignment,
  RemoveRewardAssignmentPayload,
  UpdateRewardAssignmentPayload,
} from './types';

export const rewardAssignmentAdapter =
  createGenericEntityAdapter<IRewardAssignment>();

const initialState: IStateRewardAssignment = {
  ...rewardAssignmentAdapter.getInitialState(),
};

const entityReducers = createEntityReducers(rewardAssignmentAdapter);

export const rewardAssignmentSlice = createSlice({
  name: EStateName.rewardAssignment,
  initialState,
  reducers: {
    addRewardAssignment: (
      state,
      action: PayloadAction<AddRewardAssignmentPayload>,
    ) => {
      entityReducers.addEntity(
        state,
        action as unknown as PayloadAction<{
          entity: IRewardAssignment;
          isUpsert?: boolean;
        }>,
      );
    },
    addRewardAssignmentSuccess: (
      state,
      action: PayloadAction<IRewardAssignment>,
    ) => {
      entityReducers.addEntity(
        state,
        ({
          ...action,
          payload: { entity: action.payload },
        } as unknown) as PayloadAction<{
          entity: IRewardAssignment;
          isUpsert?: boolean;
        }>,
      );
    },
    updateRewardAssignment: (
      state,
      action: PayloadAction<UpdateRewardAssignmentPayload>,
    ) => {
      entityReducers.upsertEntity(
        state,
        ({ ...action, payload: action.payload.entity } as unknown) as PayloadAction<IRewardAssignment>,
      );
    },
    updateRewardAssignmentSuccess: (
      state,
      action: PayloadAction<IRewardAssignment>,
    ) => {
      entityReducers.upsertEntity(
        state,
        (action as unknown) as PayloadAction<IRewardAssignment>,
      );
    },
    removeRewardAssignment: (
      state,
      action: PayloadAction<RemoveRewardAssignmentPayload>,
    ) => {
      entityReducers.removeEntity(
        state,
        ({ ...action, payload: action.payload.entity } as unknown) as PayloadAction<string>,
      );
    },
    removeRewardAssignmentSuccess: (state, action: PayloadAction<string>) => {
      entityReducers.removeEntity(
        state,
        (action as unknown) as PayloadAction<string>,
      );
    },
    clearRewardAssignment: state => {
      entityReducers.clearEntities(state);
    },
  },
});

export const {
  addRewardAssignment,
  addRewardAssignmentSuccess,
  updateRewardAssignment,
  updateRewardAssignmentSuccess,
  removeRewardAssignment,
  removeRewardAssignmentSuccess,
  clearRewardAssignment,
} = rewardAssignmentSlice.actions;
