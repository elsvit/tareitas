import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { EStateName } from '~/store/enums';

import type { IStateImages } from './types';

const initialState: IStateImages = {
  taskUrls: {},
  rewardUrls: {},
  userUrls: {},
};

export const imagesSlice = createSlice({
  name: EStateName.images,
  initialState,
  reducers: {
    setTaskImageUrl: (
      state,
      action: PayloadAction<{ id: string; uri: string }>,
    ) => {
      state.taskUrls[action.payload.id] = action.payload.uri;
    },
    removeTaskImageUrl: (state, action: PayloadAction<string>) => {
      delete state.taskUrls[action.payload];
    },
    setRewardImageUrl: (
      state,
      action: PayloadAction<{ id: string; uri: string }>,
    ) => {
      state.rewardUrls[action.payload.id] = action.payload.uri;
    },
    removeRewardImageUrl: (state, action: PayloadAction<string>) => {
      delete state.rewardUrls[action.payload];
    },
    setUserImageUrl: (
      state,
      action: PayloadAction<{ id: string; uri: string }>,
    ) => {
      state.userUrls[action.payload.id] = action.payload.uri;
    },
    removeUserImageUrl: (state, action: PayloadAction<string>) => {
      delete state.userUrls[action.payload];
    },
    clearAllImageUrls: state => {
      state.taskUrls = {};
      state.rewardUrls = {};
      state.userUrls = {};
    },
  },
});

export const {
  setTaskImageUrl,
  removeTaskImageUrl,
  setRewardImageUrl,
  removeRewardImageUrl,
  setUserImageUrl,
  removeUserImageUrl,
  clearAllImageUrls,
} = imagesSlice.actions;
