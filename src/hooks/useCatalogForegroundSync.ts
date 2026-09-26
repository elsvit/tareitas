import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { selectParentIds } from '~/store/parents/selectors';
import { applyProfileLogout } from '~/services/sessionProfile';
import {
  selectFamilyId,
  selectHasAuthSession,
  selectIsMultidevice,
  selectIsSessionPaused,
  selectSyncMode,
} from '~/store/settings/selectors';
import { store } from '~/store/store';
import { ESyncMode } from '~/store/settings/enums';
import {
  resumeMultideviceSession,
  touchSessionActivity,
} from '~/store/settings/slice';

function hasConfiguredFamily(state: ReturnType<typeof store.getState>): boolean {
  const syncMode = selectSyncMode(state);

  if (syncMode === ESyncMode.deviceOnly) {
    return selectParentIds(state).length > 0;
  }

  if (syncMode === ESyncMode.multidevice) {
    return (
      selectParentIds(state).length > 0 || Boolean(selectFamilyId(state))
    );
  }

  return false;
}

export const useCatalogForegroundSync = () => {
  const dispatch = useDispatch();
  const syncMode = useSelector(selectSyncMode);
  const isMultidevice = useSelector(selectIsMultidevice);
  const hasAuthSession = useSelector(selectHasAuthSession);
  const isSessionPaused = useSelector(selectIsSessionPaused);
  const appState = useRef(AppState.currentState);
  const isSessionPausedRef = useRef(isSessionPaused);

  isSessionPausedRef.current = isSessionPaused;

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      const previousState = appState.current;
      const state = store.getState();

      if (nextState === 'background') {
        if (isMultidevice && hasAuthSession) {
          dispatch(touchSessionActivity());
        }

        if (
          !selectIsSessionPaused(state) &&
          hasConfiguredFamily(state)
        ) {
          applyProfileLogout(dispatch);
        }
      }

      if (
        previousState === 'background' &&
        nextState === 'active' &&
        isMultidevice &&
        hasAuthSession
      ) {
        const isPaused = selectIsSessionPaused(store.getState());

        if (!isPaused) {
          dispatch(resumeMultideviceSession());
        }
      }

      appState.current = nextState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [dispatch, hasAuthSession, isMultidevice, syncMode]);
};
