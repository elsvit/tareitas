import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IStateChildren, RemoveChildrenPayload } from './types';
import { IChild } from '~/types/IChild';
import { EStateName } from '~/store/enums';
import {
  createGenericEntityAdapter,
  createEntityReducers,
} from '~/store/helpers';
import { AddChildrenPayload, UpdateChildrenPayload } from './types';

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
    addChild: (state, action: PayloadAction<AddChildrenPayload>) => {
      entityReducers.addEntity(state, action);
    },
    addChildSuccess: (state, action: PayloadAction<IChild>) => {
      entityReducers.addEntity(state, {
        ...action,
        // entityReducers.addEntity expects payload in shape { entity: IUser }
        payload: { entity: action.payload },
      });
    },
    updateChild: (state, action: PayloadAction<UpdateChildrenPayload>) => {
      entityReducers.upsertEntity(state, { ...action, payload: action.payload.entity, });
    },
    updateChildSuccess: (state, action: PayloadAction<IChild>) => {
      // entityReducers.upsertEntity expects payload to be the entity itself
      entityReducers.upsertEntity(state, action as unknown as PayloadAction<IChild>);
    },
    removeChild: (state, action: PayloadAction<RemoveChildrenPayload>) => {
      entityReducers.removeEntity(state, { ...action, payload: action.payload.id, });
    },
    removeChildSuccess: (state, action: PayloadAction<string>) => {
      // entityReducers.removeEntity expects payload to be the entity id (string)
      entityReducers.removeEntity(state, action as unknown as PayloadAction<string>);
    },
    clearChildren: state => {
      entityReducers.clearEntities(state);
    },
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
} = childrenSlice.actions;
