import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { EStateName } from '~/store/enums';
import { ERole } from '~/store/settings/enums';
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
} = settingsSlice.actions;
