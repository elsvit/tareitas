import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectHasAuthSession,
  selectIsMultidevice,
  selectIsSessionPaused,
} from '~/store/settings/selectors';
import { store } from '~/store/store';
import {
  resumeMultideviceSession,
  touchSessionActivity,
} from '~/store/settings/slice';

export const useCatalogForegroundSync = () => {
  const dispatch = useDispatch();
  const isMultidevice = useSelector(selectIsMultidevice);
  const hasAuthSession = useSelector(selectHasAuthSession);
  const isSessionPaused = useSelector(selectIsSessionPaused);
  const appState = useRef(AppState.currentState);
  const isSessionPausedRef = useRef(isSessionPaused);

  isSessionPausedRef.current = isSessionPaused;

  useEffect(() => {
    if (!isMultidevice || !hasAuthSession) {
      return;
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      const previousState = appState.current;

      if (nextState === 'background') {
        dispatch(touchSessionActivity());
      }

      if (previousState === 'background' && nextState === 'active') {
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
  }, [dispatch, hasAuthSession, isMultidevice]);
};
