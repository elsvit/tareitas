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
import { IChild } from '~/types/IChild';

import { IStateChildren } from './types';

// Create entity adapter for dishes
export const childrenAdapter = createGenericEntityAdapter<IChild>();

const initialState: IStateChildren = {
  ...childrenAdapter.getInitialState(),
};

// Create generic entity reducers
const entityReducers = createEntityReducers(childrenAdapter);

export const childrenSlice = createSlice({
  name: EStateName.children,
  initialState,
  reducers: {
    addChild: noopEntityRequestReducer,
    addChildSuccess: (state, action: PayloadAction<IChild>) => {
      entityReducers.addEntity(state, {
        ...action,
        // entityReducers.addEntity expects payload in shape { entity: IUser }
        payload: { entity: action.payload },
      });
    },
    updateChild: noopEntityRequestReducer,
    updateChildSuccess: (state, action: PayloadAction<IChild>) => {
      // entityReducers.upsertEntity expects payload to be the entity itself
      entityReducers.upsertEntity(state, action as unknown as PayloadAction<IChild>);
    },
    removeChild: noopEntityRequestReducer,
    removeChildSuccess: (state, action: PayloadAction<string>) => {
      // entityReducers.removeEntity expects payload to be the entity id (string)
      entityReducers.removeEntity(state, action as unknown as PayloadAction<string>);
    },
    clearChildren: state => {
      entityReducers.clearEntities(state);
    },
    hydrateFromStorage: createHydrateFromStorageReducer(childrenAdapter),
  },
  extraReducers: builder => {
    builder.addCase(REHYDRATE, state => {
      normalizeEntityState(state);
    });
  },
});

export const {
  addChild,
  addChildSuccess,
  updateChild,
  updateChildSuccess,
  removeChild,
  removeChildSuccess,
  clearChildren,
  hydrateFromStorage,
} = childrenSlice.actions;
