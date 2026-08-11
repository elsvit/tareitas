import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IStateParents, RemoveParentPayload } from './types';
import { IParent } from '~/types/IParent';
// IMPORTANT: import EStateName directly from types to avoid circular deps with store
import { EStateName } from '~/store/enums';
import {
  createGenericEntityAdapter,
  createEntityReducers,
} from '~/store/helpers';
import { AddParentPayload, UpdateParentPayload } from './types';

// Create entity adapter for dishes
export const parentsAdapter = createGenericEntityAdapter<IParent>();

const initialState: IStateParents = {
  ...parentsAdapter.getInitialState(),
};

// Create generic entity reducers
const entityReducers = createEntityReducers(parentsAdapter);

export const parentsSlice = createSlice({
  name: EStateName.parents,
  initialState,
  reducers: {
    addParent: (state, action: PayloadAction<AddParentPayload>) => {
      entityReducers.addEntity(state, action);
    },
    addParentSuccess: (state, action: PayloadAction<IParent>) => {
      entityReducers.addEntity(state, {
        ...action,
        // entityReducers.addEntity expects payload in shape { entity: IUser }
        payload: { entity: action.payload },
      });
    },
    updateParent: (state, action: PayloadAction<UpdateParentPayload>) => {
      entityReducers.upsertEntity(state, { ...action, payload: action.payload.entity, });
    },
    updateParentSuccess: (state, action: PayloadAction<IParent>) => {
      // entityReducers.upsertEntity expects payload to be the entity itself
      entityReducers.upsertEntity(state, action as unknown as PayloadAction<IParent>);
    },
    removeParent: (state, action: PayloadAction<RemoveParentPayload>) => {
      entityReducers.removeEntity(state, { ...action, payload: action.payload.id, });
    },
    removeParentSuccess: (state, action: PayloadAction<string>) => {
      // entityReducers.removeEntity expects payload to be the entity id (string)
      entityReducers.removeEntity(state, action as unknown as PayloadAction<string>);
    },
    clearParents: state => {
      entityReducers.clearEntities(state);
    },
  },
});

export const {
  addParent,
  addParentSuccess,
  updateParent,
  updateParentSuccess ,
  removeParent,
  removeParentSuccess,
  clearParents,
} = parentsSlice.actions;
