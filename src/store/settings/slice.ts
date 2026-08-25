import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { EStateName } from '~/store/enums';
import { ERole, ESyncMode } from '~/store/settings/enums';
import { ELang } from '~/types/ELang';
import { getTodayDateString } from '~/utils/date';

import type { IStateSettings } from './types';

const initialState: IStateSettings = {
  lang: null,
  isLangInitiating: true, // TODO Change from null to true
  isHabitsTabSeparated: true,
  isChildPasswordObligatory: true,
  currentUser: null,
  currentRole: null,
  taskCalendarDate: getTodayDateString(),
  syncMode: ESyncMode.deviceOnly,
  familyId: null,
  authToken: null,
  refreshToken: null,
  lastSyncedTaskBaseRevision: 0,
  lastSyncedRewardBaseRevision: 0,
  catalogDirty: false,
  pendingRemovedTaskBaseIds: [],
  pendingRemovedRewardBaseIds: [],
  requireLogin: false,
};

export const settingsSlice = createSlice({
  name: EStateName.settings,
  initialState,
  reducers: {
    initLanguage: state => {
      state.isLangInitiating = true;
    },
    setLanguage: (state, action: PayloadAction<ELang>) => {
      state.lang = action.payload;
      state.isLangInitiating = false; // Set to false when language is set
    },
    setIsRecurringTabSeparated: (state, action: PayloadAction<boolean>) => {
      state.isHabitsTabSeparated = action.payload;
    },
    setIsChildPasswordObligatory: (state, action: PayloadAction<boolean>) => {
      state.isChildPasswordObligatory = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<string | null>) => {
      state.currentUser = action.payload;
    },
    setCurrentRole: (state, action: PayloadAction<ERole | null>) => {
      state.currentRole = action.payload;
    },
    setTaskCalendarDate: (state, action: PayloadAction<string>) => {
      state.taskCalendarDate = action.payload;
    },
    setSyncMode: (state, action: PayloadAction<ESyncMode>) => {
      state.syncMode = action.payload;
    },
    setMultideviceSession: (
      state,
      action: PayloadAction<{
        familyId: string;
        authToken: string;
        refreshToken: string;
      }>,
    ) => {
      state.syncMode = ESyncMode.multidevice;
      state.familyId = action.payload.familyId;
      state.authToken = action.payload.authToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearMultideviceSession: state => {
      state.syncMode = ESyncMode.deviceOnly;
      state.familyId = null;
      state.authToken = null;
      state.refreshToken = null;
      state.lastSyncedTaskBaseRevision = 0;
      state.lastSyncedRewardBaseRevision = 0;
      state.catalogDirty = false;
      state.pendingRemovedTaskBaseIds = [];
      state.pendingRemovedRewardBaseIds = [];
    },
    clearAuthSession: state => {
      state.familyId = null;
      state.authToken = null;
      state.refreshToken = null;

      if (state.syncMode === ESyncMode.multidevice) {
        state.requireLogin = true;
      }
    },
    updateAuthTokens: (
      state,
      action: PayloadAction<{
        authToken: string;
        refreshToken: string;
      }>,
    ) => {
      state.authToken = action.payload.authToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setCatalogRevisions: (
      state,
      action: PayloadAction<{
        taskBaseRevision: number;
        rewardBaseRevision: number;
      }>,
    ) => {
      state.lastSyncedTaskBaseRevision =
        action.payload.taskBaseRevision;
      state.lastSyncedRewardBaseRevision =
        action.payload.rewardBaseRevision;
    },
    markCatalogDirty: state => {
      state.catalogDirty = true;
    },
    clearCatalogDirty: state => {
      state.catalogDirty = false;
      state.pendingRemovedTaskBaseIds = [];
      state.pendingRemovedRewardBaseIds = [];
    },
    queueRemovedTaskBaseId: (
      state,
      action: PayloadAction<string>,
    ) => {
      if (
        !state.pendingRemovedTaskBaseIds.includes(
          action.payload,
        )
      ) {
        state.pendingRemovedTaskBaseIds.push(
          action.payload,
        );
      }
      state.catalogDirty = true;
    },
    queueRemovedRewardBaseId: (
      state,
      action: PayloadAction<string>,
    ) => {
      if (
        !state.pendingRemovedRewardBaseIds.includes(
          action.payload,
        )
      ) {
        state.pendingRemovedRewardBaseIds.push(
          action.payload,
        );
      }
      state.catalogDirty = true;
    },
    syncCatalog: () => {},
    refreshAuthSession: () => {},
    syncFamilyMembers: () => {},
    setRequireLogin: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.requireLogin = action.payload;
    },
  },
});

// Export actions
export const {
  initLanguage,
  setLanguage,
  setIsRecurringTabSeparated,
  setIsChildPasswordObligatory,
  setCurrentRole,
  setCurrentUser,
  setTaskCalendarDate,
  setSyncMode,
  setMultideviceSession,
  clearMultideviceSession,
  clearAuthSession,
  updateAuthTokens,
  setCatalogRevisions,
  markCatalogDirty,
  clearCatalogDirty,
  queueRemovedTaskBaseId,
  queueRemovedRewardBaseId,
  syncCatalog,
  refreshAuthSession,
  syncFamilyMembers,
  setRequireLogin,
} = settingsSlice.actions;
