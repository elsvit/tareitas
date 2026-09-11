import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

import { EStateName } from '~/store/enums';

import type { IStateImages, ImageStoreKind } from './types';

const initialState: IStateImages = {
  taskUrls: {},
  rewardUrls: {},
  userUrls: {},
};

function cloneImageUrlMaps(payload: IStateImages): IStateImages {
  return {
    taskUrls: { ...(payload.taskUrls ?? {}) },
    rewardUrls: { ...(payload.rewardUrls ?? {}) },
    userUrls: { ...(payload.userUrls ?? {}) },
  };
}

function omitImageUrlKey(
  urls: Record<string, string>,
  id: string,
): Record<string, string> {
  const next = { ...urls };
  delete next[id];
  return next;
}

export const imagesSlice = createSlice({
  name: EStateName.images,
  initialState,
  reducers: {
    setTaskImageUrl: (
      state,
      action: PayloadAction<{ id: string; uri: string }>,
    ) => {
      state.taskUrls = {
        ...state.taskUrls,
        [action.payload.id]: action.payload.uri,
      };
    },
    removeTaskImageUrl: (state, action: PayloadAction<string>) => {
      state.taskUrls = omitImageUrlKey(state.taskUrls, action.payload);
    },
    setRewardImageUrl: (
      state,
      action: PayloadAction<{ id: string; uri: string }>,
    ) => {
      state.rewardUrls = {
        ...state.rewardUrls,
        [action.payload.id]: action.payload.uri,
      };
    },
    removeRewardImageUrl: (state, action: PayloadAction<string>) => {
      state.rewardUrls = omitImageUrlKey(state.rewardUrls, action.payload);
    },
    setUserImageUrl: (
      state,
      action: PayloadAction<{ id: string; uri: string }>,
    ) => {
      state.userUrls = {
        ...state.userUrls,
        [action.payload.id]: action.payload.uri,
      };
    },
    removeUserImageUrl: (state, action: PayloadAction<string>) => {
      state.userUrls = omitImageUrlKey(state.userUrls, action.payload);
    },
    clearAllImageUrls: state => {
      state.taskUrls = {};
      state.rewardUrls = {};
      state.userUrls = {};
    },
    hydrateFromStorage: (_state, action: PayloadAction<IStateImages>) =>
      cloneImageUrlMaps(action.payload),
    mergeFamilyImagesFromServer: (
      state,
      action: PayloadAction<
        Array<{
          kind: ImageStoreKind;
          path: string;
          uri: string;
        }>
      >,
    ) => {
      let taskUrls = state.taskUrls;
      let rewardUrls = state.rewardUrls;
      let userUrls = state.userUrls;

      action.payload.forEach(({ kind, path, uri }) => {
        const target =
          kind === 'task'
            ? taskUrls
            : kind === 'reward'
              ? rewardUrls
              : userUrls;
        const existing = target[path];
        const nextValue = existing?.startsWith('file:') ? existing : uri;

        if (kind === 'task') {
          taskUrls = { ...taskUrls, [path]: nextValue };
        } else if (kind === 'reward') {
          rewardUrls = { ...rewardUrls, [path]: nextValue };
        } else {
          userUrls = { ...userUrls, [path]: nextValue };
        }
      });

      state.taskUrls = taskUrls;
      state.rewardUrls = rewardUrls;
      state.userUrls = userUrls;
    },
    deleteFamilyImage: () => {},
  },
  extraReducers: builder => {
    builder.addCase(REHYDRATE, (_state, action) => {
      const incoming = (
        action as { payload?: Partial<Record<string, IStateImages>> }
      ).payload?.[EStateName.images];

      if (incoming) {
        return cloneImageUrlMaps(incoming);
      }
    });
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
  hydrateFromStorage,
  mergeFamilyImagesFromServer,
  deleteFamilyImage,
} = imagesSlice.actions;
