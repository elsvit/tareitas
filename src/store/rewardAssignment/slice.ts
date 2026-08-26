import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { EStateName } from '~/store/enums';
import {
  createEntityReducers,
  createGenericEntityAdapter,
} from '~/store/helpers';
import { noopEntityRequestReducer } from '~/store/helpers/sagaEntitySync';
import { IRewardAssignment } from '~/types/IReward';

import { IStateRewardAssignment } from './types';

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
    addRewardAssignment: noopEntityRequestReducer,
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
    updateRewardAssignment: noopEntityRequestReducer,
    updateRewardAssignmentSuccess: (
      state,
      action: PayloadAction<IRewardAssignment>,
    ) => {
      entityReducers.upsertEntity(
        state,
        (action as unknown) as PayloadAction<IRewardAssignment>,
      );
    },
    removeRewardAssignment: noopEntityRequestReducer,
    removeRewardAssignmentSuccess: (state, action: PayloadAction<string>) => {
      entityReducers.removeEntity(
        state,
        (action as unknown) as PayloadAction<string>,
      );
    },
    replaceRewardAssignments: (
      state,
      action: PayloadAction<IRewardAssignment[]>,
    ) => {
      const serverIds = new Set(action.payload.map(assignment => assignment.id));

      if (action.payload.length > 0) {
        rewardAssignmentAdapter.upsertMany(state, action.payload);
      }

      const staleIds = (state.ids as string[]).filter(id => {
        if (serverIds.has(id)) {
          return false;
        }

        const assignment = state.entities[id];

        if (!assignment) {
          return false;
        }

        if (!assignment.createdAt) {
          return false;
        }

        const createdAt = Date.parse(assignment.createdAt);
        const isRecent =
          Number.isFinite(createdAt) &&
          Date.now() - createdAt < 60_000;

        return !isRecent;
      });

      if (staleIds.length > 0) {
        rewardAssignmentAdapter.removeMany(state, staleIds);
      }
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
  replaceRewardAssignments,
  clearRewardAssignment,
} = rewardAssignmentSlice.actions;
