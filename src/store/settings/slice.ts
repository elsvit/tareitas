import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { EStateName } from '~/store/enums';
import { ERole, ESyncMode } from '~/store/settings/enums';
import { ELang } from '~/types/ELang';
import { getTodayDateString, resolveCalendarDateString } from '~/utils/date';
import type { IFamilySubscription } from '~/types/ISubscription';

import type { IStateSettings, PendingReturnRoute } from './types';

function resetCloudSessionState(state: IStateSettings) {
  state.familyId = null;
  state.subscription = null;
  state.authToken = null;
  state.refreshToken = null;
  state.authUserId = null;
  state.authUserRole = null;
  state.lastSyncedTaskBaseRevision = 0;
  state.lastSyncedRewardBaseRevision = 0;
  state.catalogDirty = false;
  state.pendingRemovedTaskBaseIds = [];
  state.pendingRemovedRewardBaseIds = [];
}

const initialState: IStateSettings = {
  lang: null,
  isLangInitiating: true, // TODO Change from null to true
  isHabitsTabSeparated: true,
  isChildPasswordObligatory: true,
  isChildHasChangeFamily: false,
  showLoginName: false,
  showParentLoginName: false,
  currentUser: null,
  currentRole: null,
  taskCalendarDate: getTodayDateString(),
  syncMode: ESyncMode.deviceOnly,
  familyId: null,
  subscription: null,
  authToken: null,
  refreshToken: null,
  authUserId: null,
  authUserRole: null,
  lastSyncedTaskBaseRevision: 0,
  lastSyncedRewardBaseRevision: 0,
  catalogDirty: false,
  pendingRemovedTaskBaseIds: [],
  pendingRemovedRewardBaseIds: [],
  requireLogin: false,
  pendingFamilySetup: false,
  hasPersistedFamily: false,
  lastSessionActivityAt: null,
  pendingReturnRoute: null,
  sessionPauseCount: 0,
  appInstalledAt: null,
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
    setIsChildHasChangeFamily: (state, action: PayloadAction<boolean>) => {
      state.isChildHasChangeFamily = action.payload;
    },
    setShowLoginName: (state, action: PayloadAction<boolean>) => {
      state.showLoginName = action.payload;
    },
    setShowParentLoginName: (state, action: PayloadAction<boolean>) => {
      state.showParentLoginName = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<string | null>) => {
      state.currentUser = action.payload;
    },
    setCurrentRole: (state, action: PayloadAction<ERole | null>) => {
      state.currentRole = action.payload;
    },
    setTaskCalendarDate: (state, action: PayloadAction<string>) => {
      state.taskCalendarDate = resolveCalendarDateString(action.payload);
    },
    setSyncMode: (state, action: PayloadAction<ESyncMode>) => {
      state.syncMode = action.payload;

      if (action.payload === ESyncMode.deviceOnly) {
        resetCloudSessionState(state);
      }
    },
    setMultideviceSession: (
      state,
      action: PayloadAction<{
        familyId: string;
        authToken: string;
        refreshToken: string;
        authUserId?: string | null;
        authUserRole?: ERole | null;
      }>,
    ) => {
      state.syncMode = ESyncMode.multidevice;
      state.familyId = action.payload.familyId;
      state.authToken = action.payload.authToken;
      state.refreshToken = action.payload.refreshToken;
      state.authUserId = action.payload.authUserId ?? null;
      state.authUserRole = action.payload.authUserRole ?? null;
      state.hasPersistedFamily = true;
      state.lastSessionActivityAt =
        new Date().toISOString();
    },
    setFamilySubscription: (
      state,
      action: PayloadAction<IFamilySubscription | null>,
    ) => {
      state.subscription = action.payload;
    },
    setAuthUser: (
      state,
      action: PayloadAction<{
        id: string;
        role: ERole;
      }>,
    ) => {
      state.authUserId = action.payload.id;
      state.authUserRole = action.payload.role;
    },
    clearMultideviceSession: state => {
      state.syncMode = ESyncMode.deviceOnly;
      resetCloudSessionState(state);
    },
    clearAuthSession: state => {
      state.familyId = null;
      state.subscription = null;
      state.authToken = null;
      state.refreshToken = null;
      state.authUserId = null;
      state.authUserRole = null;
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
      state.lastSessionActivityAt =
        new Date().toISOString();
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
  syncTaskAssignments: () => {},
  syncRewardsData: () => {},
  syncFamilyImages: () => {},
  setRequireLogin: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.requireLogin = action.payload;
    },
    setPendingFamilySetup: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.pendingFamilySetup = action.payload;
    },
    setHasPersistedFamily: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.hasPersistedFamily = action.payload;
    },
    touchSessionActivity: state => {
      state.lastSessionActivityAt =
        new Date().toISOString();
    },
    setPendingReturnRoute: (
      state,
      action: PayloadAction<PendingReturnRoute | null>,
    ) => {
      state.pendingReturnRoute = action.payload;
    },
    resumeMultideviceSession: () => {},
    pauseSessionChecks: state => {
      state.sessionPauseCount += 1;
    },
    resumeSessionChecks: state => {
      state.sessionPauseCount = Math.max(
        0,
        state.sessionPauseCount - 1,
      );
    },
    ensureAppInstalledAt: state => {
      if (!state.appInstalledAt) {
        state.appInstalledAt = new Date().toISOString();
      }
    },
  },
});

// Export actions
export const {
  initLanguage,
  setLanguage,
  setIsRecurringTabSeparated,
  setIsChildPasswordObligatory,
  setIsChildHasChangeFamily,
  setShowLoginName,
  setShowParentLoginName,
  setCurrentRole,
  setCurrentUser,
  setTaskCalendarDate,
  setSyncMode,
  setMultideviceSession,
  setFamilySubscription,
  setAuthUser,
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
  syncTaskAssignments,
  syncRewardsData,
  syncFamilyImages,
  setRequireLogin,
  setPendingFamilySetup,
  setHasPersistedFamily,
  touchSessionActivity,
  setPendingReturnRoute,
  resumeMultideviceSession,
  pauseSessionChecks,
  resumeSessionChecks,
  ensureAppInstalledAt,
} = settingsSlice.actions;
