import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectHasAuthSession,
  selectIsMultidevice,
} from '~/store/settings/selectors';
import { refreshAuthSession } from '~/store/settings/slice';

export const useCatalogForegroundSync = () => {
  const dispatch = useDispatch();
  const isMultidevice = useSelector(selectIsMultidevice);
  const hasAuthSession = useSelector(selectHasAuthSession);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!isMultidevice || !hasAuthSession) {
      return;
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      const wasBackground =
        appState.current === 'background' ||
        appState.current === 'inactive';
      const isActive = nextState === 'active';

      if (wasBackground && isActive) {
        dispatch(refreshAuthSession());
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
