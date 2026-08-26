import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import { ITaskAssignment } from '~/types/ITask';
import { EStateName } from '~/store/enums';
import {
  createEntityReducers,
  createGenericEntityAdapter,
} from '~/store/helpers';
import { noopEntityRequestReducer } from '~/store/helpers/sagaEntitySync';
import { removeChild } from '~/store/children/slice';
import type { IState } from '~/store/types';

import { pruneOrphanedTaskAssignmentsInState } from './taskAssignmentCleanup';
import { IStateTaskAssignment } from './types';

export const taskAssignmentAdapter =
  createGenericEntityAdapter<ITaskAssignment>();

const initialState: IStateTaskAssignment = {
  ...taskAssignmentAdapter.getInitialState(),
};

const entityReducers = createEntityReducers(taskAssignmentAdapter);

export const taskAssignmentSlice = createSlice({
  name: EStateName.taskAssignment,
  initialState,
  reducers: {
    addTaskAssignment: noopEntityRequestReducer,
    addTaskAssignmentsBatch: noopEntityRequestReducer,
    addTaskAssignmentSuccess: (
      state,
      action: PayloadAction<ITaskAssignment>
    ) => {
      entityReducers.addEntity(
        state,
        ({
          ...action,
          payload: { entity: action.payload },
        } as unknown) as PayloadAction<{
          entity: ITaskAssignment;
          isUpsert?: boolean;
        }>
      );
    },
    updateTaskAssignment: noopEntityRequestReducer,
    updateTaskAssignmentSuccess: (
      state,
      action: PayloadAction<ITaskAssignment>
    ) => {
      entityReducers.upsertEntity(
        state,
        (action as unknown) as PayloadAction<ITaskAssignment>
      );
    },
    removeTaskAssignment: noopEntityRequestReducer,
    removeTaskAssignmentSuccess: (state, action: PayloadAction<string>) => {
      entityReducers.removeEntity(
        state,
        (action as unknown) as PayloadAction<string>
      );
    },
    replaceTaskAssignments: (
      state,
      action: PayloadAction<ITaskAssignment[]>,
    ) => {
      taskAssignmentAdapter.setAll(state, action.payload);
    },
    clearTaskAssignment: (state) => {
      entityReducers.clearEntities(state);
    },
    pruneOrphanedTaskAssignments: (
      state,
      action: PayloadAction<{ validChildIds: string[] }>,
    ) => {
      pruneOrphanedTaskAssignmentsInState(state, action.payload.validChildIds);
    },
  },
  extraReducers: builder => {
    builder.addCase(removeChild, (state, action) => {
      const childId = action.payload.id;
      const idsToRemove = state.ids.filter(
        id => state.entities[id]?.childId === childId,
      );

      if (idsToRemove.length > 0) {
        taskAssignmentAdapter.removeMany(state, idsToRemove);
      }
    });

    builder.addCase(REHYDRATE, (state, action) => {
      const payload = (action as { payload?: IState }).payload;

      if (!payload?.children) {
        return;
      }

      pruneOrphanedTaskAssignmentsInState(state, payload.children.ids);
    });
  },
});

export const {
  addTaskAssignment,
  addTaskAssignmentsBatch,
  addTaskAssignmentSuccess,
  updateTaskAssignment,
  updateTaskAssignmentSuccess,
  removeTaskAssignment,
  removeTaskAssignmentSuccess,
  replaceTaskAssignments,
  clearTaskAssignment,
  pruneOrphanedTaskAssignments,
} = taskAssignmentSlice.actions;
