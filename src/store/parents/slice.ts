import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import { EStateName } from '~/store/enums';
import {
  createEntityReducers,
  createGenericEntityAdapter,
  createHydrateFromStorageReducer,
  normalizeEntityState,
} from '~/store/helpers';
import { noopEntityRequestReducer } from '~/store/helpers/sagaEntitySync';
import { IParent } from '~/types/IParent';

import { IStateParents } from './types';

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
    addParent: noopEntityRequestReducer,
    addParentSuccess: (state, action: PayloadAction<IParent>) => {
      entityReducers.addEntity(state, {
        ...action,
        // entityReducers.addEntity expects payload in shape { entity: IUser }
        payload: { entity: action.payload },
      });
    },
    updateParent: noopEntityRequestReducer,
    updateParentSuccess: (state, action: PayloadAction<IParent>) => {
      // entityReducers.upsertEntity expects payload to be the entity itself
      entityReducers.upsertEntity(state, action as unknown as PayloadAction<IParent>);
    },
    removeParent: noopEntityRequestReducer,
    removeParentSuccess: (state, action: PayloadAction<string>) => {
      // entityReducers.removeEntity expects payload to be the entity id (string)
      entityReducers.removeEntity(state, action as unknown as PayloadAction<string>);
    },
    clearParents: state => {
      entityReducers.clearEntities(state);
    },
    hydrateFromStorage: createHydrateFromStorageReducer(parentsAdapter),
  },
  extraReducers: builder => {
    builder.addCase(REHYDRATE, state => {
      normalizeEntityState(state);
    });
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
  hydrateFromStorage,
} = parentsSlice.actions;
